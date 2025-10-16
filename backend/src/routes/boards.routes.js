import express from "express";
import { 
    getBoardsByProject,
    getBoardById, 
    createBoard, 
    updateBoard, 
    deleteBoard,
    reorderBoards
} from "../controllers/boards.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all boards for a project
router.get('/project/:projectId', getBoardsByProject);

// Get board by ID
router.get('/:boardId', getBoardById);

// Create a board for a project
router.post('/project/:projectId', createBoard);

// Update a board
router.put('/:boardId', updateBoard);

// Delete a board
router.delete('/:boardId', deleteBoard);

// Reorder boards in a project
router.put('/project/:projectId/reorder', reorderBoards);

export default router;

