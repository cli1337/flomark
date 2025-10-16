import { Router } from "express";
import { 
  getCommentsByTask,
  createComment,
  updateComment,
  deleteComment
} from "../controllers/comments.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

// Get comments for a task
router.get("/task/:taskId", getCommentsByTask);

// Create a comment
router.post("/task/:taskId", createComment);

// Update a comment
router.put("/:commentId", updateComment);

// Delete a comment
router.delete("/:commentId", deleteComment);

export default router;

