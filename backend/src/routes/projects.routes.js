import { Router } from "express";
import { 
  getProjects,
  createProject,
  getProjectById,
} from "../controllers/projects.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:id", getProjectById);

export default router;