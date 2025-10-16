import { Router } from "express";
import { 
  createUser, 
  authenticateUser, 
  refreshToken, 
  getProfile,
  initTwoFactor,
  verifyTwoFactorSetup,
  disableTwoFactor,
  verifyTwoFactorLogin,
  updateUserProfile,
  updateUserPassword,
  uploadProfileImage,
  removeProfileImage,
  getAllUsers,
  updateUserByAdmin,
  promoteUserToAdmin,
  createUserByAdmin,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { getClientIP } from "../middlewares/ip.middleware.js";
import { uploadPhoto, handleMulterError } from "../config/multer.config.js";
import { 
  loginRateLimiter, 
  registrationRateLimiter, 
  passwordRateLimiter,
  refreshTokenRateLimiter 
} from "../middlewares/rate-limit.middleware.js";

/**
 * User Routes
 * Base path: /api/user
 * 
 * Handles authentication, registration, profile management, 2FA, and admin operations
 */

const router = Router();

// ===== Public Routes (No Authentication Required) =====

// User registration and authentication
router.post("/create", registrationRateLimiter, getClientIP, createUser);
router.post("/auth", loginRateLimiter, getClientIP, authenticateUser);
router.post("/refresh", refreshTokenRateLimiter, refreshToken);
router.post("/2fa/verify-login", loginRateLimiter, verifyTwoFactorLogin); // Complete 2FA login

// Password reset
router.post("/forgot-password", passwordRateLimiter, forgotPassword);
router.post("/reset-password", passwordRateLimiter, resetPassword);

// ===== Protected Routes (Authentication Required) =====

// Profile management
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateUserProfile);
router.put("/password", passwordRateLimiter, authenticateToken, updateUserPassword);
router.post("/profile/image", authenticateToken, uploadPhoto.single('profileImage'), handleMulterError, uploadProfileImage);
router.delete("/profile/image", authenticateToken, removeProfileImage);

// Two-factor authentication (2FA)
router.post("/2fa/init", passwordRateLimiter, authenticateToken, initTwoFactor);
router.post("/2fa/verify-setup", passwordRateLimiter, authenticateToken, verifyTwoFactorSetup);
router.post("/2fa/disable", passwordRateLimiter, authenticateToken, disableTwoFactor);

// Admin operations (requires Admin or Owner role)
router.get("/admin/users", authenticateToken, getAllUsers);
router.post("/admin/users/create", authenticateToken, getClientIP, createUserByAdmin);
router.put("/admin/users/:userId", authenticateToken, updateUserByAdmin);
router.post("/admin/users/:userId/promote", authenticateToken, promoteUserToAdmin);

export default router;