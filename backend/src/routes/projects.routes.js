import { Router } from "express";
import { 
  getProjects,
  createProject,
  getProjectById,
  uploadProjectImage,
} from "../controllers/projects.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { uploadPhoto, handleMulterError } from "../config/multer.config.js";

const router = Router();

router.use(authenticateToken);

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:id", getProjectById);
router.post("/:id/image", uploadPhoto.single('image'), handleMulterError, uploadProjectImage);

export default router;