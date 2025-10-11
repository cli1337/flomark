import { prisma } from "../config/database.js";
import bcrypt from "bcrypt";
import { generateToken, generateRefreshToken, verifyToken } from "../utils/jwt.utils.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

/**
 * User Controller
 * Handles all user-related operations including authentication, registration, 2FA, and profile management
 */

/**
 * Register a new user
 * POST /api/user/register
 * 
 * Body: { name, email, password, confirmPassword }
 * Returns: { data: user, success: true }
 */
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

/**
 * Authenticate user and generate JWT token
 * POST /api/user/login
 * 
 * Body: { email, password }
 * Returns: { data: { token, refreshToken, user }, success: true }
 * Or: { data: { requires2fa: true, pendingToken }, success: true } if 2FA is enabled
 */
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
          role: user.role,
        }
      }, 
      success: true 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Refresh access token using refresh token
 * POST /api/user/refresh
 * 
 * Body: { refreshToken }
 * Returns: { data: { token, refreshToken, user }, success: true }
 */
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
    if (!decoded) {
      return res.status(401).json({
        message: "Invalid refresh token",
        key: "invalid_refresh_token",
        success: false,
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, profileImage: true, twoFactorEnabled: true, role: true },
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
          role: user.role,
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

/**
 * Get authenticated user's profile
 * GET /api/user/profile
 * Requires: Authentication
 * 
 * Returns: { data: user, success: true }
 */
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
        role: true,
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

/**
 * Initialize two-factor authentication (2FA)
 * POST /api/user/2fa/init
 * Requires: Authentication
 * 
 * Returns: { data: { otpauthUrl, qrDataUrl }, success: true }
 */
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

/**
 * Verify and enable 2FA after scanning QR code
 * POST /api/user/2fa/verify
 * Requires: Authentication
 * 
 * Body: { code }
 * Returns: { success: true }
 */
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

/**
 * Disable two-factor authentication
 * POST /api/user/2fa/disable
 * Requires: Authentication
 * 
 * Body: { code } (if 2FA is currently enabled)
 * Returns: { success: true }
 */
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

/**
 * Complete login with 2FA code
 * POST /api/user/2fa/login
 * 
 * Body: { pendingToken, code }
 * Returns: { data: { token, refreshToken, user }, success: true }
 */
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
          role: user.role,
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

/**
 * Update user profile (name)
 * PUT /api/user/profile
 * Requires: Authentication
 * 
 * Body: { name }
 * Returns: { data: updatedUser, success: true }
 */
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
        role: true,
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

/**
 * Update user password
 * PUT /api/user/password
 * Requires: Authentication
 * 
 * Body: { currentPassword, newPassword }
 * Returns: { message, success: true }
 */
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

/**
 * Upload user profile image
 * POST /api/user/profile-image
 * Requires: Authentication, multipart/form-data
 * 
 * Returns: { data: updatedUser, success: true }
 */
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
        role: true,
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

/**
 * Get all users (Admin only)
 * GET /api/user/all
 * Requires: Authentication, Admin or Owner role
 * 
 * Returns: { data: users[], success: true }
 */
export const getAllUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'OWNER') {
      return res.status(403).json({
        message: "Access denied. Admin or Owner only.",
        key: "forbidden",
        success: false,
      });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        role: true,
        createdAt: true,
        registerIP: true,
        lastIP: true,
        twoFactorEnabled: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      data: users,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user profile by admin
 * PUT /api/user/:userId
 * Requires: Authentication, Admin or Owner role
 * 
 * Body: { name, email }
 * Returns: { data: updatedUser, success: true }
 */
export const updateUserByAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'OWNER') {
      return res.status(403).json({
        message: "Access denied. Admin or Owner only.",
        key: "forbidden",
        success: false,
      });
    }

    const { userId } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
        key: "fields_required",
        success: false,
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
        key: "user_not_found",
        success: false,
      });
    }

    if (req.user.role === 'ADMIN' && (targetUser.role === 'OWNER' || targetUser.role === 'ADMIN')) {
      return res.status(403).json({
        message: "You cannot edit other admins or owners",
        key: "forbidden",
        success: false,
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({
        message: "Email already in use",
        key: "email_exists",
        success: false,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        name: name.trim(), 
        email: email.trim() 
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        role: true,
        createdAt: true,
        registerIP: true,
        lastIP: true,
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

/**
 * Promote/demote user to/from admin role
 * POST /api/user/:userId/promote
 * Requires: Authentication, Admin or Owner role
 * 
 * Returns: { data: updatedUser, success: true }
 */
export const promoteUserToAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'OWNER') {
      return res.status(403).json({
        message: "Access denied. Admin or Owner only.",
        key: "forbidden",
        success: false,
      });
    }

    const { userId } = req.params;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
        key: "user_not_found",
        success: false,
      });
    }

    if (targetUser.role === 'OWNER') {
      return res.status(403).json({
        message: "Cannot modify owner role",
        key: "forbidden",
        success: false,
      });
    }

    if (req.user.role === 'ADMIN' && targetUser.role === 'ADMIN') {
      return res.status(403).json({
        message: "You cannot demote other admins",
        key: "forbidden",
        success: false,
      });
    }

    const newRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        role: true,
        createdAt: true,
        registerIP: true,
        lastIP: true,
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