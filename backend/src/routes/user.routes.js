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

const router = Router();

router.post("/create", getClientIP, createUser);
router.post("/auth", getClientIP, authenticateUser);
router.post("/refresh", refreshToken);

router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateUserProfile);
router.put("/password", authenticateToken, updateUserPassword);
router.post("/profile/image", authenticateToken, uploadPhoto.single('profileImage'), handleMulterError, uploadProfileImage);

router.post("/2fa/init", authenticateToken, initTwoFactor);
router.post("/2fa/verify-setup", authenticateToken, verifyTwoFactorSetup);
router.post("/2fa/disable", authenticateToken, disableTwoFactor);
router.post("/2fa/verify-login", verifyTwoFactorLogin);

// Admin routes
router.get("/admin/users", authenticateToken, getAllUsers);
router.put("/admin/users/:userId", authenticateToken, updateUserByAdmin);
router.post("/admin/users/:userId/promote", authenticateToken, promoteUserToAdmin);

export default router;