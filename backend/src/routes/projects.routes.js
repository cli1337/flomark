import { Router } from "express";
import { 
  getProjects,
  createProject,
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
  deleteLabel
} from "../controllers/projects.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { uploadPhoto, handleMulterError } from "../config/multer.config.js";

const router = Router();

router.use(authenticateToken);

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:id", getProjectById);

router.post("/:id/image", uploadPhoto.single('image'), handleMulterError, uploadProjectImage);

router.post("/:id/list", createList);
router.get("/:id/lists", getListsByProject);
router.put("/lists/:listId", updateList);
router.put("/:id/lists/reorder", reorderLists);

router.get("/:id/members", getMembersByProject);
router.delete("/:id/members/:memberId", removeMemberFromProject);
router.put("/:id/members/:memberId/role", updateMemberRole);

router.post("/:id/invite", createInviteLink);
router.post("/join/:inviteLink", joinProject);

router.get("/:id/labels", getLabelsByProject);
router.post("/:id/labels", createLabel);
router.put("/labels/:labelId", updateLabel);
router.delete("/labels/:labelId", deleteLabel);

export default router;