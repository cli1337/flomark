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
  getAllUsers,
  updateUserByAdmin,
  promoteUserToAdmin,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { getClientIP } from "../middlewares/ip.middleware.js";
import { uploadPhoto, handleMulterError } from "../config/multer.config.js";

/**
 * User Routes
 * Base path: /api/user
 * 
 * Handles authentication, registration, profile management, 2FA, and admin operations
 */

const router = Router();

// ===== Public Routes (No Authentication Required) =====

// User registration and authentication
router.post("/create", getClientIP, createUser);
router.post("/auth", getClientIP, authenticateUser);
router.post("/refresh", refreshToken);
router.post("/2fa/verify-login", verifyTwoFactorLogin); // Complete 2FA login

// ===== Protected Routes (Authentication Required) =====

// Profile management
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateUserProfile);
router.put("/password", authenticateToken, updateUserPassword);
router.post("/profile/image", authenticateToken, uploadPhoto.single('profileImage'), handleMulterError, uploadProfileImage);

// Two-factor authentication (2FA)
router.post("/2fa/init", authenticateToken, initTwoFactor);
router.post("/2fa/verify-setup", authenticateToken, verifyTwoFactorSetup);
router.post("/2fa/disable", authenticateToken, disableTwoFactor);

// Admin operations (requires Admin or Owner role)
router.get("/admin/users", authenticateToken, getAllUsers);
router.put("/admin/users/:userId", authenticateToken, updateUserByAdmin);
router.post("/admin/users/:userId/promote", authenticateToken, promoteUserToAdmin);

export default router;