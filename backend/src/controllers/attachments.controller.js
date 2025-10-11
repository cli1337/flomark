import { prisma } from "../config/database.js";
import { ObjectId } from "mongodb";
import { SocketService } from "../services/socket.service.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Attachments Controller
 * Handles file attachments for tasks
 */

const broadcastTaskUpdate = (projectId, type, payload, userId, userName) => {
  if (SocketService.instance) {
    SocketService.instance.broadcastToProject(projectId, type, {
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
 * Upload attachment to task
 * POST /api/tasks/:taskId/attachments
 * 
 * Multipart form data with file
 * Returns: { data: attachment, success: true }
 */
export const uploadAttachment = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        
        if (!taskId) {
            return res.status(400).json({ message: "Task ID is required", key: "task_id_required", success: false });
        }
        
        if (!ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: "Invalid task ID", key: "invalid_task_id", success: false });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded", key: "no_file", success: false });
        }

        // Get task and verify permissions
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
            // Clean up uploaded file if task not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: "Task not found", key: "task_not_found", success: false });
        }
        
        const isMember = task.list.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            // Clean up uploaded file if unauthorized
            fs.unlinkSync(req.file.path);
            return res.status(403).json({ message: "You are not authorized to upload attachments to this task", key: "unauthorized", success: false });
        }

        // Create attachment record
        const attachment = await prisma.attachment.create({
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                url: `/uploads/tasks/${req.file.filename}`,
                taskId
            }
        });

        // Broadcast update
        broadcastTaskUpdate(task.list.project.id, "attachment-uploaded", {
            taskId,
            attachment
        }, req.user.id, req.user.username);
        
        res.json({ data: attachment, success: true });
    } catch (err) {
        // Clean up file on error
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkErr) {
                console.error('Error deleting file:', unlinkErr);
            }
        }
        console.error('uploadAttachment error:', err);
        next(err);
    }
};

/**
 * Get all attachments for a task
 * GET /api/tasks/:taskId/attachments
 * 
 * Returns: { data: attachments[], success: true }
 */
export const getAttachments = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        
        if (!taskId) {
            return res.status(400).json({ message: "Task ID is required", key: "task_id_required", success: false });
        }
        
        if (!ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: "Invalid task ID", key: "invalid_task_id", success: false });
        }

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                list: {
                    include: {
                        project: {
                            include: { members: true }
                        }
                    }
                },
                attachments: true
            }
        });
        
        if (!task) {
            return res.status(404).json({ message: "Task not found", key: "task_not_found", success: false });
        }
        
        const isMember = task.list.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to access this task", key: "unauthorized", success: false });
        }
        
        res.json({ data: task.attachments, success: true });
    } catch (err) {
        console.error('getAttachments error:', err);
        next(err);
    }
};

/**
 * Delete an attachment
 * DELETE /api/tasks/attachments/:attachmentId
 * 
 * Returns: { data: { id: attachmentId }, success: true }
 */
export const deleteAttachment = async (req, res, next) => {
    try {
        const { attachmentId } = req.params;
        
        if (!attachmentId) {
            return res.status(400).json({ message: "Attachment ID is required", key: "attachment_id_required", success: false });
        }
        
        if (!ObjectId.isValid(attachmentId)) {
            return res.status(400).json({ message: "Invalid attachment ID", key: "invalid_attachment_id", success: false });
        }

        const attachment = await prisma.attachment.findUnique({
            where: { id: attachmentId },
            include: {
                task: {
                    include: {
                        list: {
                            include: {
                                project: {
                                    include: { members: true }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        if (!attachment) {
            return res.status(404).json({ message: "Attachment not found", key: "attachment_not_found", success: false });
        }
        
        const isMember = attachment.task.list.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to delete this attachment", key: "unauthorized", success: false });
        }

        // Delete file from filesystem
        const uploadsDir = path.join(__dirname, '../../storage/tasks');
        const filePath = path.join(uploadsDir, attachment.filename);
        
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (fileErr) {
            console.error('Error deleting file from filesystem:', fileErr);
            // Continue with database deletion even if file deletion fails
        }

        // Delete from database
        await prisma.attachment.delete({
            where: { id: attachmentId }
        });

        // Broadcast update
        broadcastTaskUpdate(attachment.task.list.project.id, "attachment-deleted", {
            taskId: attachment.taskId,
            attachmentId
        }, req.user.id, req.user.username);
        
        res.json({ data: { id: attachmentId }, success: true });
    } catch (err) {
        console.error('deleteAttachment error:', err);
        next(err);
    }
};

