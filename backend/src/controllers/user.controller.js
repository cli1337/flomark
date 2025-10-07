import { prisma } from "../config/database.js";
import bcrypt from "bcrypt";
import { generateToken, generateRefreshToken, verifyToken } from "../utils/jwt.utils.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export const createUser = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Body is required", key: "body_required", success: false });
    }
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "No field can be empty", key: "fields_empty", success: false });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password and confirm password do not match", key: "password_mismatch", success: false });
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters long and contain at least 1 uppercase letter and 1 special character", key: "invalid_password", success: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists", key: "user_exists", success: false });
    }
    
    const registerIP = req.clientIP || req.ip || 'unknown';
    
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword,
        registerIP,
        lastIP: registerIP
      },
    });
    res.json({ data: user, success: true });
  } catch (err) {
    next(err);
  }
};

export const authenticateUser = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Body is required", key: "body_required", success: false });
    }

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found", key: "user_not_found", success: false });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password", key: "invalid_password", success: false });
    }
    
    const lastIP = req.clientIP || req.ip || 'unknown';
    
    await prisma.user.update({
      where: { id: user.id },
      data: { lastIP }
    });
    
    if (user.twoFactorEnabled) {
      const pendingToken = generateToken({ userId: user.id, email: user.email, twoFactorPending: true });
      return res.json({
        data: {
          requires2fa: true,
          pendingToken,
        },
        success: true,
      });
    }

    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id });
    
    res.json({ 
      data: { 
        token, 
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage || null,
          twoFactorEnabled: user.twoFactorEnabled || false,
        }
      }, 
      success: true 
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required",
        key: "refresh_token_required",
        success: false,
      });
    }

    const decoded = verifyToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, profileImage: true, twoFactorEnabled: true },
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found",
        key: "user_not_found",
        success: false,
      });
    }

    const newToken = generateToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    res.json({
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage || null,
          twoFactorEnabled: user.twoFactorEnabled || false,
        },
      },
      success: true,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
        key: "invalid_refresh_token",
        success: false,
      });
    }
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        twoFactorEnabled: true,
      },
    });

    res.json({
      data: user,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

export const initTwoFactor = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found", key: "user_not_found", success: false });
    }

    const secret = speakeasy.generateSecret({ name: `Flomark (${user.email})` });

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    const otpauthUrl = secret.otpauth_url;
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

    res.json({
      data: {
        otpauthUrl,
        qrDataUrl,
      },
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyTwoFactorSetup = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { code } = req.body || {};
    if (!code) {
      return res.status(400).json({ message: "Code is required", key: "code_required", success: false });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: "2FA not initialized", key: "2fa_not_initialized", success: false });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid authentication code", key: "invalid_2fa_code", success: false });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const disableTwoFactor = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { code } = req.body || {};
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found", key: "user_not_found", success: false });
    }

    if (user.twoFactorEnabled) {
      if (!code) {
        return res.status(400).json({ message: "Code is required", key: "code_required", success: false });
      }
      const ok = speakeasy.totp.verify({ secret: user.twoFactorSecret || '', encoding: 'base32', token: code, window: 1 });
      if (!ok) {
        return res.status(400).json({ message: "Invalid authentication code", key: "invalid_2fa_code", success: false });
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const verifyTwoFactorLogin = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Body is required", key: "body_required", success: false });
    }
    const { pendingToken, code } = req.body;
    if (!pendingToken || !code) {
      return res.status(400).json({ message: "pendingToken and code are required", key: "fields_required", success: false });
    }

    const decoded = verifyToken(pendingToken);
    if (!decoded || !decoded.twoFactorPending || !decoded.userId) {
      return res.status(401).json({ message: "Invalid pending token", key: "invalid_pending_token", success: false });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ message: "2FA not enabled", key: "2fa_not_enabled", success: false });
    }

    const ok = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: code, window: 1 });
    if (!ok) {
      return res.status(400).json({ message: "Invalid authentication code", key: "invalid_2fa_code", success: false });
    }

    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id });
    
    res.json({
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage || null,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      },
      success: true,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired pending token", key: "invalid_pending_token", success: false });
    }
    next(err);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        message: "Name is required", 
        key: "name_required", 
        success: false 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        twoFactorEnabled: true,
      },
    });

    res.json({
      data: updatedUser,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserPassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Current password and new password are required", 
        key: "passwords_required", 
        success: false 
      });
    }

    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long and contain at least 1 uppercase letter and 1 special character", 
        key: "invalid_password", 
        success: false 
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ 
        message: "User not found", 
        key: "user_not_found", 
        success: false 
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        message: "Current password is incorrect", 
        key: "invalid_current_password", 
        success: false 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({
      message: "Password updated successfully",
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

export const uploadProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ 
        message: "No file uploaded", 
        key: "no_file", 
        success: false 
      });
    }

    const profileImage = req.file.filename;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImage },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        twoFactorEnabled: true,
      },
    });

    res.json({
      data: updatedUser,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};