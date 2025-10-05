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
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { getClientIP } from "../middlewares/ip.middleware.js";

const router = Router();

router.post("/create", getClientIP, createUser);
router.post("/auth", getClientIP, authenticateUser);
router.post("/refresh", refreshToken);

router.get("/profile", authenticateToken, getProfile);

router.post("/2fa/init", authenticateToken, initTwoFactor);
router.post("/2fa/verify-setup", authenticateToken, verifyTwoFactorSetup);
router.post("/2fa/disable", authenticateToken, disableTwoFactor);
router.post("/2fa/verify-login", verifyTwoFactorLogin);

export default router;