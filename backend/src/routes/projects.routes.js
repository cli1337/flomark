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
import { uploadPhoto, handleMulterError } from "../config/multer.config.js";
import { demoModeMiddleware, preventDemoDestruction } from "../middlewares/demo.middleware.js";

/**
 * Projects Routes
 * Base path: /api/projects
 * 
 * Handles projects, lists, labels, members, and invitations
 * All routes require authentication (unless in demo mode for demo project)
 */

const router = Router();

// Apply demo mode middleware first, then authentication
router.use(demoModeMiddleware);
router.use(authenticateToken);
router.use(preventDemoDestruction);

// ===== Project Operations =====
router.get("/", getProjects);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.get("/:id/data", getProjectDataOptimized); // Optimized - get all project data at once
router.get("/:id", getProjectById);
router.post("/:id/image", uploadPhoto.single('image'), handleMulterError, uploadProjectImage);

// ===== List Operations =====
router.post("/:id/list", createList);
router.get("/:id/lists", getListsByProject);
router.put("/lists/:listId", updateList);
router.put("/:id/lists/reorder", reorderLists);

// ===== Member Management =====
router.get("/:id/members", getMembersByProject);
router.delete("/:id/members/:memberId", removeMemberFromProject);
router.put("/:id/members/:memberId/role", updateMemberRole);

// ===== Invitations =====
router.post("/:id/invite", createInviteLink);
router.post("/join/:inviteLink", joinProject);

// ===== Label Management =====
router.get("/:id/labels", getLabelsByProject);
router.post("/:id/labels", createLabel);
router.put("/labels/:labelId", updateLabel);
router.delete("/labels/:labelId", deleteLabel);

export default router;