import { Router } from "express";
import { 
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
  uploadProjectImage,
  createList,
  getListsByProject,
  updateList,
  reorderLists,
  createInviteLink,
  joinProject,
  getMembersByProject,
  removeMemberFromProject,
  updateMemberRole,
  getLabelsByProject,
  createLabel,
  updateLabel,
  deleteLabel,
  getProjectDataOptimized
} from "../controllers/projects.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { checkDemoMode } from "../middlewares/demo.middleware.js";
import { uploadPhoto, handleMulterError } from "../config/multer.config.js";

/**
 * Projects Routes
 * Base path: /api/projects
 * 
 * Handles projects, lists, labels, members, and invitations
 * All routes require authentication
 */

const router = Router();

router.use(authenticateToken);

// ===== Project Operations =====
router.get("/", getProjects);
router.post("/", checkDemoMode, createProject);
router.put("/:id", checkDemoMode, updateProject);
router.delete("/:id", checkDemoMode, deleteProject);
router.get("/:id/data", getProjectDataOptimized); // Optimized - get all project data at once
router.get("/:id", getProjectById);
router.post("/:id/image", checkDemoMode, uploadPhoto.single('image'), handleMulterError, uploadProjectImage);

// ===== List Operations =====
router.post("/:id/list", checkDemoMode, createList);
router.get("/:id/lists", getListsByProject);
router.put("/lists/:listId", checkDemoMode, updateList);
router.put("/:id/lists/reorder", checkDemoMode, reorderLists);

// ===== Member Management =====
router.get("/:id/members", getMembersByProject);
router.delete("/:id/members/:memberId", checkDemoMode, removeMemberFromProject);
router.put("/:id/members/:memberId/role", checkDemoMode, updateMemberRole);

// ===== Invitations =====
router.post("/:id/invite", checkDemoMode, createInviteLink);
router.post("/join/:inviteLink", checkDemoMode, joinProject);

// ===== Label Management =====
router.get("/:id/labels", getLabelsByProject);
router.post("/:id/labels", checkDemoMode, createLabel);
router.put("/labels/:labelId", checkDemoMode, updateLabel);
router.delete("/labels/:labelId", checkDemoMode, deleteLabel);

export default router;