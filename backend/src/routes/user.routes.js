import { Router } from "express";
import { 
  createUser, 
  authenticateUser, 
  refreshToken, 
  getProfile 
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// <-- Public Routes -->
router.post("/create", createUser);
router.post("/auth", authenticateUser);
router.post("/refresh", refreshToken);

// <-- Protected Routes -->
router.get("/profile", authenticateToken, getProfile);

export default router;