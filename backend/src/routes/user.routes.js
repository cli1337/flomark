import { Router } from "express";
import { 
  createUser, 
  authenticateUser, 
  refreshToken, 
  getProfile 
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { getClientIP } from "../middlewares/ip.middleware.js";

const router = Router();

router.post("/create", getClientIP, createUser);
router.post("/auth", getClientIP, authenticateUser);
router.post("/refresh", refreshToken);

router.get("/profile", authenticateToken, getProfile);

export default router;