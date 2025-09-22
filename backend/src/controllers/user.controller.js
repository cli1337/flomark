import { prisma } from "../config/database.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { generateToken, generateRefreshToken, verifyToken } from "../utils/jwt.utils.js";

export const createUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      return res.status(400).json({ message: "Already logged in", key: "already_logged_in", success: false });
    }
    if (!req.body) {
      return res.status(400).json({ message: "Body is required", key: "body_required", success: false });
    }
    const { name, email, password, confirmPassword } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", key: "validation_failed", errors: errors.array(), success: false });
    }
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
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    res.json({ data: user, success: true });
  } catch (err) {
    next(err);
  }
};

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      return res.status(400).json({ message: "Already logged in", key: "already_logged_in", success: false });
    }

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
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id });
    
    res.json({ 
      data: { 
        token, 
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
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
      select: { id: true, email: true, name: true },
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
    res.json({
      data: req.user,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};
