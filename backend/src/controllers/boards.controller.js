import { prisma } from "../config/database.js";
import { ActivityService } from "../services/activity.service.js";
import { SocketService } from "../services/socket.service.js";
import { isValidId } from "../utils/id-validator.js";

/**
 * Boards Controller
 * Handles board management for projects
 * All endpoints require authentication
 */

/**
 * Broadcast board updates to all connected clients in real-time
 */
const broadcastBoardUpdate = (projectId, type, payload, userId, userName) => {
  if (SocketService.instance) {
    SocketService.instance.broadcastToProject(projectId, "board-updated", {
      projectId,
      type,
      payload,
      userId,
      userName,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get all boards for a project
 * GET /api/boards/project/:projectId
 */
export const getBoardsByProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        
        if (!isValidId(projectId)) {
            return res.status(400).json({ message: "Invalid project ID", key: "invalid_project_id", success: false });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true }
        });
        
        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }
        
        const isMember = project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to access this project", key: "unauthorized", success: false });
        }

        const boards = await prisma.board.findMany({
            where: { projectId },
            include: {
                lists: {
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        });
        
        res.json({ data: boards, success: true });
    } catch (err) {
        console.error('getBoardsByProject error:', err);
        next(err);
    }
};

/**
 * Get board by ID with lists and tasks
 * GET /api/boards/:boardId
 */
export const getBoardById = async (req, res, next) => {
    try {
        const { boardId } = req.params;
        
        if (!isValidId(boardId)) {
            return res.status(400).json({ message: "Invalid board ID", key: "invalid_board_id", success: false });
        }

        const board = await prisma.board.findUnique({
            where: { id: boardId },
            include: {
                project: {
                    include: { members: true }
                },
                lists: {
                    include: {
                        tasks: {
                            include: {
                                members: {
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true,
                                                profileImage: true
                                            }
                                        }
                                    }
                                },
                                subTasks: true
                            },
                            orderBy: { createdAt: 'asc' }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });
        
        if (!board) {
            return res.status(404).json({ message: "Board not found", key: "board_not_found", success: false });
        }
        
        const isMember = board.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to access this board", key: "unauthorized", success: false });
        }
        
        res.json({ data: board, success: true });
    } catch (err) {
        console.error('getBoardById error:', err);
        next(err);
    }
};

/**
 * Create a board for a project (max 10 boards per project)
 * POST /api/boards/project/:projectId
 */
export const createBoard = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: "Board name is required", key: "name_required", success: false });
        }
        
        if (name.length < 2 || name.length > 50) {
            return res.status(400).json({ message: "Board name must be between 2 and 50 characters", key: "invalid_name", success: false });
        }
        
        if (!isValidId(projectId)) {
            return res.status(400).json({ message: "Invalid project ID", key: "invalid_project_id", success: false });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { 
                members: true,
                boards: true
            }
        });
        
        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }
        
        const isMember = project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to create boards in this project", key: "unauthorized", success: false });
        }

        // Check board limit (max 10 boards per project)
        if (project.boards.length >= 10) {
            return res.status(400).json({ 
                message: "Maximum of 10 boards per project reached", 
                key: "board_limit_reached", 
                success: false 
            });
        }

        const lastBoard = await prisma.board.findFirst({
            where: { projectId },
            orderBy: { order: 'desc' }
        });
        
        const nextOrder = lastBoard ? lastBoard.order + 1 : 0;

        const board = await prisma.board.create({
            data: { 
                name: name.trim(),
                projectId,
                order: nextOrder
            },
            include: {
                lists: true
            }
        });

        // Log activity
        await ActivityService.logActivity(
            projectId,
            req.user.id,
            'BOARD_CREATED',
            'board',
            board.id,
            { boardName: board.name }
        );

        broadcastBoardUpdate(projectId, "board-created", {
            board: board
        }, req.user.id, req.user.name);

        res.json({ data: board, success: true });
    } catch (err) {
        console.error('createBoard error:', err);
        next(err);
    }
};

/**
 * Update a board
 * PUT /api/boards/:boardId
 */
export const updateBoard = async (req, res, next) => {
    try {
        const { boardId } = req.params;
        const { name, order } = req.body;
        
        if (!isValidId(boardId)) {
            return res.status(400).json({ message: "Invalid board ID", key: "invalid_board_id", success: false });
        }

        const board = await prisma.board.findUnique({
            where: { id: boardId },
            include: {
                project: {
                    include: { members: true }
                }
            }
        });
        
        if (!board) {
            return res.status(404).json({ message: "Board not found", key: "board_not_found", success: false });
        }
        
        const isMember = board.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to update this board", key: "unauthorized", success: false });
        }

        const updateData = {};
        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ message: "Board name is required", key: "name_required", success: false });
            }
            if (name.trim().length > 50) {
                return res.status(400).json({ message: "Board name must be 50 characters or less", key: "name_too_long", success: false });
            }
            updateData.name = name.trim();
        }
        if (order !== undefined) {
            updateData.order = order;
        }
        
        const updatedBoard = await prisma.board.update({
            where: { id: boardId },
            data: updateData,
            include: {
                lists: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        // Log activity
        const changes = {};
        if (name !== undefined) changes.name = name;
        if (order !== undefined) changes.order = order;
        
        await ActivityService.logActivity(
            board.project.id,
            req.user.id,
            'BOARD_UPDATED',
            'board',
            boardId,
            { boardName: updatedBoard.name, changes }
        );

        broadcastBoardUpdate(board.project.id, "board-updated", {
            board: updatedBoard
        }, req.user.id, req.user.name);
        
        res.json({ data: updatedBoard, success: true });
    } catch (err) {
        console.error('updateBoard error:', err);
        next(err);
    }
};

/**
 * Delete a board
 * DELETE /api/boards/:boardId
 */
export const deleteBoard = async (req, res, next) => {
    try {
        const { boardId } = req.params;
        
        if (!isValidId(boardId)) {
            return res.status(400).json({ message: "Invalid board ID", key: "invalid_board_id", success: false });
        }

        const board = await prisma.board.findUnique({
            where: { id: boardId },
            include: {
                project: {
                    include: { members: true }
                }
            }
        });
        
        if (!board) {
            return res.status(404).json({ message: "Board not found", key: "board_not_found", success: false });
        }
        
        const isMember = board.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to delete this board", key: "unauthorized", success: false });
        }

        await prisma.board.delete({
            where: { id: boardId }
        });

        // Log activity
        await ActivityService.logActivity(
            board.project.id,
            req.user.id,
            'BOARD_DELETED',
            'board',
            boardId,
            { boardName: board.name }
        );

        broadcastBoardUpdate(board.project.id, "board-deleted", {
            boardId: boardId,
            boardName: board.name
        }, req.user.id, req.user.name);
        
        res.json({ 
            message: "Board deleted successfully", 
            success: true 
        });
    } catch (err) {
        console.error('deleteBoard error:', err);
        next(err);
    }
};

/**
 * Reorder boards in a project
 * PUT /api/boards/project/:projectId/reorder
 */
export const reorderBoards = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { boardIds } = req.body;
        
        if (!isValidId(projectId)) {
            return res.status(400).json({ message: "Invalid project ID", key: "invalid_project_id", success: false });
        }
        
        if (!boardIds || !Array.isArray(boardIds)) {
            return res.status(400).json({ message: "Board IDs array is required", key: "board_ids_required", success: false });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true }
        });
        
        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }
        
        const isMember = project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to reorder boards in this project", key: "unauthorized", success: false });
        }
        
        const updatePromises = boardIds.map((boardId, index) => {
            return prisma.board.update({
                where: { id: boardId },
                data: { order: index }
            });
        });
        
        await Promise.all(updatePromises);
        
        const updatedBoards = await prisma.board.findMany({
            where: { projectId },
            orderBy: { order: 'asc' }
        });

        broadcastBoardUpdate(projectId, "boards-reordered", {
            boards: updatedBoards
        }, req.user.id, req.user.name);
        
        res.json({ data: updatedBoards, success: true });
    } catch (err) {
        console.error('reorderBoards error:', err);
        next(err);
    }
};

