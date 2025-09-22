import { Router } from "express";
import { getUsers, createUser, authenticateUser } from "../controllers/user.controller.js";

const router = Router();

router.get("/", getUsers);
router.post("/", createUser);
router.post("/auth", authenticateUser);

export default router;