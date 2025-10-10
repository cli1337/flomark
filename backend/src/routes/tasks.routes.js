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
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { demoModeMiddleware, preventDemoDestruction } from "../middlewares/demo.middleware.js";

const router = Router();

router.use(demoModeMiddleware);
router.use(authenticateToken);
router.use(preventDemoDestruction);

router.get("/lists/:listId/tasks", getTasksByList);

router.post("/lists/:listId/tasks", createTask);

router.get("/:taskId", getTaskById);

router.put("/:taskId", updateTask);

router.put("/:taskId/move", moveTask);

router.delete("/:taskId", deleteTask);

router.put("/lists/:listId/reorder", reorderTasks);

router.post("/:taskId/members", assignMember);
router.delete("/:taskId/members/:userId", removeMember);

router.post("/:taskId/subtasks", addSubTask);
router.put("/subtasks/:subTaskId", updateSubTask);
router.delete("/subtasks/:subTaskId", deleteSubTask);

router.post("/:taskId/labels", addLabel);
router.delete("/:taskId/labels/:labelId", removeLabel);

export default router;
