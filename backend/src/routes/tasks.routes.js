import { Router } from "express";
import { 
  getTasksByList,
  createTask,
  getTaskById,
  updateTask,
  moveTask,
  reorderTasks,
  deleteTask,
  assignMember,
  removeMember,
  addSubTask,
  updateSubTask,
  deleteSubTask,
  addLabel,
  removeLabel
} from "../controllers/tasks.controller.js";
import {
  uploadAttachment,
  getAttachments,
  deleteAttachment
} from "../controllers/attachments.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { checkDemoMode } from "../middlewares/demo.middleware.js";
import { uploadTaskFile } from "../config/multer.config.js";

const router = Router();

router.use(authenticateToken);

router.get("/lists/:listId/tasks", getTasksByList);

router.post("/lists/:listId/tasks", checkDemoMode, createTask);

router.get("/:taskId", getTaskById);

router.put("/:taskId", checkDemoMode, updateTask);

router.put("/:taskId/move", checkDemoMode, moveTask);

router.delete("/:taskId", checkDemoMode, deleteTask);

router.put("/lists/:listId/reorder", checkDemoMode, reorderTasks);

router.post("/:taskId/members", checkDemoMode, assignMember);
router.delete("/:taskId/members/:userId", checkDemoMode, removeMember);

router.post("/:taskId/subtasks", checkDemoMode, addSubTask);
router.put("/subtasks/:subTaskId", checkDemoMode, updateSubTask);
router.delete("/subtasks/:subTaskId", checkDemoMode, deleteSubTask);

router.post("/:taskId/labels", checkDemoMode, addLabel);
router.delete("/:taskId/labels/:labelId", checkDemoMode, removeLabel);

// Attachment routes
router.post("/:taskId/attachments", checkDemoMode, uploadTaskFile, uploadAttachment);
router.get("/:taskId/attachments", getAttachments);
router.delete("/attachments/:attachmentId", checkDemoMode, deleteAttachment);

export default router;
