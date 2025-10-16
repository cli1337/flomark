import { prisma } from "../config/database.js";
import { isValidId } from "../utils/id-validator.js";
import { safeUserSelect } from "../utils/user-sanitizer.js";
import { SocketService } from "../services/socket.service.js";

/**
 * Comments Controller
 * Handles task comments
 * All endpoints require authentication
 */

/**
 * Broadcast comment updates to all connected clients in real-time
 * @param {string} projectId - Project ID
 * @param {string} type - Update type (e.g., 'comment-added', 'comment-updated')
 * @param {object} payload - Update payload
 * @param {string} userId - User who made the change
 * @param {string} userName - Name of user who made the change
 */
const broadcastCommentUpdate = (projectId, type, payload, userId, userName) => {
  if (SocketService.instance) {
    SocketService.instance.broadcastToProject(projectId, "comment-updated", {
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
 * Get comments for a task
 * GET /api/comments/task/:taskId
 * 
 * Returns: { data: comments[], success: true }
 */
export const getCommentsByTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    
    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required", key: "task_id_required", success: false });
    }
    
    if (!isValidId(taskId)) {
      return res.status(400).json({ message: "Invalid task ID", key: "invalid_task_id", success: false });
    }

    // Verify task exists and user has access
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        list: {
          include: {
            project: {
              include: { members: true }
            }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found", key: "task_not_found", success: false });
    }

    // Check if user is a project member
    const isMember = task.list.project.members.some(member => member.userId === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: "Access denied", key: "access_denied", success: false });
    }

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: {
          select: safeUserSelect
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ data: comments, success: true });
  } catch (err) {
    console.error('getCommentsByTask error:', err);
    next(err);
  }
};

/**
 * Create a new comment
 * POST /api/comments/task/:taskId
 * 
 * Body: { content }
 * Returns: { data: comment, success: true }
 */
export const createComment = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    
    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required", key: "task_id_required", success: false });
    }
    
    if (!isValidId(taskId)) {
      return res.status(400).json({ message: "Invalid task ID", key: "invalid_task_id", success: false });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required", key: "content_required", success: false });
    }

    // Verify task exists and user has access
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        list: {
          include: {
            project: {
              include: { members: true }
            }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found", key: "task_not_found", success: false });
    }

    // Check if user is a project member
    const isMember = task.list.project.members.some(member => member.userId === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: "Access denied", key: "access_denied", success: false });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: req.user.id,
        taskId
      },
      include: {
        user: {
          select: safeUserSelect
        }
      }
    });

    // Broadcast comment creation
    broadcastCommentUpdate(task.list.project.id, "comment-added", {
      comment,
      taskId
    }, req.user.id, req.user.name);

    res.json({ data: comment, success: true });
  } catch (err) {
    console.error('createComment error:', err);
    next(err);
  }
};

/**
 * Update a comment
 * PUT /api/comments/:commentId
 * 
 * Body: { content }
 * Returns: { data: comment, success: true }
 */
export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    if (!commentId) {
      return res.status(400).json({ message: "Comment ID is required", key: "comment_id_required", success: false });
    }
    
    if (!isValidId(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID", key: "invalid_comment_id", success: false });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required", key: "content_required", success: false });
    }

    // Verify comment exists and belongs to user
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        task: {
          include: {
            list: {
              include: {
                project: true
              }
            }
          }
        }
      }
    });

    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found", key: "comment_not_found", success: false });
    }

    // Only comment author can update their comment
    if (existingComment.userId !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own comments", key: "access_denied", success: false });
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      include: {
        user: {
          select: safeUserSelect
        }
      }
    });

    // Broadcast comment update
    broadcastCommentUpdate(existingComment.task.list.project.id, "comment-updated", {
      comment,
      taskId: existingComment.taskId
    }, req.user.id, req.user.name);

    res.json({ data: comment, success: true });
  } catch (err) {
    console.error('updateComment error:', err);
    next(err);
  }
};

/**
 * Delete a comment
 * DELETE /api/comments/:commentId
 * 
 * Returns: { success: true }
 */
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    
    if (!commentId) {
      return res.status(400).json({ message: "Comment ID is required", key: "comment_id_required", success: false });
    }
    
    if (!isValidId(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID", key: "invalid_comment_id", success: false });
    }

    // Verify comment exists and belongs to user
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        task: {
          include: {
            list: {
              include: {
                project: true
              }
            }
          }
        }
      }
    });

    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found", key: "comment_not_found", success: false });
    }

    // Only comment author can delete their comment
    if (existingComment.userId !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own comments", key: "access_denied", success: false });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    // Broadcast comment deletion
    broadcastCommentUpdate(existingComment.task.list.project.id, "comment-deleted", {
      commentId,
      taskId: existingComment.taskId
    }, req.user.id, req.user.name);

    res.json({ success: true });
  } catch (err) {
    console.error('deleteComment error:', err);
    next(err);
  }
};

