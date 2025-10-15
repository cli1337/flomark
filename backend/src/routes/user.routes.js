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
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { getClientIP } from "../middlewares/ip.middleware.js";
import { checkDemoMode } from "../middlewares/demo.middleware.js";
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
router.post("/create", registrationRateLimiter, getClientIP, checkDemoMode, createUser);
router.post("/auth", loginRateLimiter, getClientIP, authenticateUser);
router.post("/refresh", refreshTokenRateLimiter, refreshToken);
router.post("/2fa/verify-login", loginRateLimiter, verifyTwoFactorLogin); // Complete 2FA login

// ===== Protected Routes (Authentication Required) =====

// Profile management
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, checkDemoMode, updateUserProfile);
router.put("/password", passwordRateLimiter, authenticateToken, checkDemoMode, updateUserPassword);
router.post("/profile/image", authenticateToken, checkDemoMode, uploadPhoto.single('profileImage'), handleMulterError, uploadProfileImage);
router.delete("/profile/image", authenticateToken, checkDemoMode, removeProfileImage);

// Two-factor authentication (2FA)
router.post("/2fa/init", passwordRateLimiter, authenticateToken, checkDemoMode, initTwoFactor);
router.post("/2fa/verify-setup", passwordRateLimiter, authenticateToken, checkDemoMode, verifyTwoFactorSetup);
router.post("/2fa/disable", passwordRateLimiter, authenticateToken, checkDemoMode, disableTwoFactor);

// Admin operations (requires Admin or Owner role)
router.get("/admin/users", authenticateToken, getAllUsers);
router.post("/admin/users/create", authenticateToken, getClientIP, checkDemoMode, createUserByAdmin);
router.put("/admin/users/:userId", authenticateToken, checkDemoMode, updateUserByAdmin);
router.post("/admin/users/:userId/promote", authenticateToken, checkDemoMode, promoteUserToAdmin);

export default router;