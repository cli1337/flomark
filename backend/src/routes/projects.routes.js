import { Router } from "express";
import { 
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} from "../controllers/projects.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Project routes
router.get("/", getProjects);                    // GET /api/projects - Get all user's projects
router.get("/:projectId", getProject);           // GET /api/projects/:projectId - Get specific project
router.post("/", createProject);                 // POST /api/projects - Create new project
router.put("/:projectId", updateProject);        // PUT /api/projects/:projectId - Update project
router.delete("/:projectId", deleteProject);     // DELETE /api/projects/:projectId - Delete project

// Member management routes
router.post("/:projectId/members", addMember);   // POST /api/projects/:projectId/members - Add member
router.delete("/:projectId/members/:memberId", removeMember); // DELETE /api/projects/:projectId/members/:memberId - Remove member

export default router;