import { prisma } from "../config/database.js";
import { ObjectId } from "mongodb";
import { SocketService } from "../services/socket.service.js";

/**
 * Tasks Controller
 * Handles all task-related operations including CRUD, members, subtasks, and labels
 * All endpoints require authentication
 */

/**
 * Broadcast task updates to all connected clients in project in real-time
 * @param {string} projectId - Project ID
 * @param {string} type - Update type (e.g., 'task-created', 'task-updated')
 * @param {object} payload - Update payload
 * @param {string} userId - User who made the change
 * @param {string} userName - Name of user who made the change
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
 * Get all tasks in a list
 * GET /api/tasks/list/:listId
 * 
 * Returns: { data: tasks[], success: true }
 */
export const getTasksByList = async (req, res, next) => {
    try {
        const { listId } = req.params;
        
        if (!listId) {
            return res.status(400).json({ message: "List ID is required", key: "list_id_required", success: false });
        }
        
        if (!ObjectId.isValid(listId)) {
            return res.status(400).json({ message: "Invalid list ID", key: "invalid_list_id", success: false });
        }

        const list = await prisma.list.findUnique({
            where: { id: listId },
            include: {
                project: {
                    include: { members: true }
                }
            }
        });
        
        if (!list) {
            return res.status(404).json({ message: "List not found", key: "list_not_found", success: false });
        }
        
        const isMember = list.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to access this list", key: "unauthorized", success: false });
        }

        const tasks = await prisma.task.findMany({
            where: { listId },
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                subTasks: true
            },
            orderBy: { createdAt: 'asc' }
        });
        
        res.json({ data: tasks, success: true });
    } catch (err) {
        console.error('getTasksByList error:', err);
        next(err);
    }
};

/**
 * Create a new task in a list
 * POST /api/tasks/list/:listId
 * 
 * Body: { name, description, dueDate }
 * Returns: { data: task, success: true }
 */
export const createTask = async (req, res, next) => {
    try {
        const { listId } = req.params;
        const { name, description, dueDate } = req.body;
        
        if (!listId) {
            return res.status(400).json({ message: "List ID is required", key: "list_id_required", success: false });
        }
        
        if (!ObjectId.isValid(listId)) {
            return res.status(400).json({ message: "Invalid list ID", key: "invalid_list_id", success: false });
        }
        
        if (!name) {
            return res.status(400).json({ message: "Task name is required", key: "name_required", success: false });
        }

        if (name.length < 2 || name.length > 100) {
            return res.status(400).json({ message: "Task name must be between 2 and 100 characters", key: "invalid_name", success: false });
        }

        const list = await prisma.list.findUnique({
            where: { id: listId },
            include: {
                project: {
                    include: { members: true }
                }
            }
        });
        
        if (!list) {
            return res.status(404).json({ message: "List not found", key: "list_not_found", success: false });
        }
        
        const isMember = list.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to create tasks in this list", key: "unauthorized", success: false });
        }

        // Determine labels format based on database type
        const dbUrl = process.env.DATABASE_URL || '';
        const isSQLite = dbUrl.startsWith('file:') || dbUrl.startsWith('sqlite:');
        const defaultLabels = isSQLite ? '[]' : [];

        const task = await prisma.task.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                dueDate: dueDate ? new Date(dueDate) : null,
                labels: defaultLabels,
                listId
            },
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                subTasks: true
            }
        });


        broadcastTaskUpdate(list.project.id, "task-created", {
            task: task
        }, req.user.id, req.user.name);
        
        res.json({ data: task, success: true });
    } catch (err) {
        console.error('createTask error:', err);
        next(err);
    }
};

/**
 * Get task by ID with all details
 * GET /api/tasks/:taskId
 * 
 * Returns: { data: task, success: true }
 */
export const getTaskById = async (req, res, next) => {
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
                members: {
                    include: {
                        user: true
                    }
                },
                subTasks: true,
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
        
        res.json({ data: task, success: true });
    } catch (err) {
        console.error('getTaskById error:', err);
        next(err);
    }
};

/**
 * Update a task
 * PUT /api/tasks/:taskId
 * 
 * Body: { name, description, dueDate, labels }
 * Returns: { data: updatedTask, success: true }
 */
export const updateTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { name, description, dueDate, labels } = req.body;
        
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
                }
            }
        });
        
        if (!task) {
            return res.status(404).json({ message: "Task not found", key: "task_not_found", success: false });
        }
        
        const isMember = task.list.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to update this task", key: "unauthorized", success: false });
        }

        const updateData = {};
        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ message: "Task name is required", key: "name_required", success: false });
            }
            updateData.name = name.trim();
        }
        if (description !== undefined) {
            updateData.description = description?.trim() || null;
        }
        if (dueDate !== undefined) {
            updateData.dueDate = dueDate ? new Date(dueDate) : null;
        }
        if (labels !== undefined) {
            if (Array.isArray(labels)) {
                updateData.labels = labels;
            } else {
                return res.status(400).json({ message: "Labels must be an array", key: "invalid_labels", success: false });
            }
        }
        
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: updateData,
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                subTasks: true
            }
        });


        broadcastTaskUpdate(task.list.project.id, "task-updated", {
            task: updatedTask
        }, req.user.id, req.user.name);
        
        res.json({ data: updatedTask, success: true });
    } catch (err) {
        console.error('updateTask error:', err);
        next(err);
    }
};

/**
 * Move a task to a different list
 * PUT /api/tasks/:taskId/move
 * 
 * Body: { listId }
 * Returns: { data: movedTask, success: true }
 */
export const moveTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { listId: newListId } = req.body;
        
        if (!taskId) {
            return res.status(400).json({ message: "Task ID is required", key: "task_id_required", success: false });
        }
        
        if (!ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: "Invalid task ID", key: "invalid_task_id", success: false });
        }
        
        if (!newListId) {
            return res.status(400).json({ message: "New list ID is required", key: "list_id_required", success: false });
        }
        
        if (!ObjectId.isValid(newListId)) {
            return res.status(400).json({ message: "Invalid new list ID", key: "invalid_list_id", success: false });
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
                }
            }
        });
        
        if (!task) {
            return res.status(404).json({ message: "Task not found", key: "task_not_found", success: false });
        }
        
        const isMember = task.list.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to move this task", key: "unauthorized", success: false });
        }

        const newList = await prisma.list.findUnique({
            where: { id: newListId },
            include: {
                project: {
                    include: { members: true }
                }
            }
        });
        
        if (!newList) {
            return res.status(404).json({ message: "Target list not found", key: "list_not_found", success: false });
        }
        
        const hasAccessToNewList = newList.project.members.some(member => member.userId === req.user.id);
        if (!hasAccessToNewList) {
            return res.status(403).json({ message: "You are not authorized to move tasks to this list", key: "unauthorized", success: false });
        }

        const movedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                listId: newListId
            },
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                subTasks: true
            }
        });


        broadcastTaskUpdate(task.list.project.id, "task-moved", {
            task: movedTask,
            fromListId: task.listId,
            toListId: newListId
        }, req.user.id, req.user.name);
        
        res.json({ data: movedTask, success: true });
    } catch (err) {
        console.error('moveTask error:', err);
        next(err);
    }
};

export const reorderTasks = async (req, res, next) => {
    try {
        const { listId } = req.params;
        const { taskIds } = req.body;
        
        if (!listId) {
            return res.status(400).json({ message: "List ID is required", key: "list_id_required", success: false });
        }
        
        if (!ObjectId.isValid(listId)) {
            return res.status(400).json({ message: "Invalid list ID", key: "invalid_list_id", success: false });
        }
        
        if (!taskIds || !Array.isArray(taskIds)) {
            return res.status(400).json({ message: "Task IDs array is required", key: "task_ids_required", success: false });
        }

        const list = await prisma.list.findUnique({
            where: { id: listId },
            include: {
                project: {
                    include: { members: true }
                }
            }
        });
        
        if (!list) {
            return res.status(404).json({ message: "List not found", key: "list_not_found", success: false });
        }
        
        const isMember = list.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to reorder tasks in this list", key: "unauthorized", success: false });
        }


        const updatedTasks = await prisma.task.findMany({
            where: { listId },
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                subTasks: true
            },
            orderBy: { createdAt: 'asc' }
        });
        
        res.json({ data: updatedTasks, success: true });
    } catch (err) {
        console.error('reorderTasks error:', err);
        next(err);
    }
};

export const deleteTask = async (req, res, next) => {
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
                }
            }
        });
        
        if (!task) {
            return res.status(404).json({ message: "Task not found", key: "task_not_found", success: false });
        }
        
        const isMember = task.list.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to delete this task", key: "unauthorized", success: false });
        }

        await prisma.task.delete({
            where: { id: taskId }
        });


        broadcastTaskUpdate(task.list.project.id, "task-deleted", {
            taskId: taskId,
            listId: task.listId
        }, req.user.id, req.user.name);
        
        res.json({ data: { id: taskId }, success: true });
    } catch (err) {
        console.error('deleteTask error:', err);
        next(err);
    }
};

/**
 * Assign a member to a task
 * POST /api/tasks/:taskId/members
 * 
 * Body: { userId }
 * Returns: { data: taskMember, success: true }
 */
export const assignMember = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { userId } = req.body;
        
        if (!taskId) {
            return res.status(400).json({ message: "Task ID is required", key: "task_id_required", success: false });
        }
        
        if (!ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: "Invalid task ID", key: "invalid_task_id", success: false });
        }
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required", key: "user_id_required", success: false });
        }
        
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID", key: "invalid_user_id", success: false });
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
                members: true
            }
        });
        
        if (!task) {
            return res.status(404).json({ message: "Task not found", key: "task_not_found", success: false });
        }
        
        const isMember = task.list.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to assign members to this task", key: "unauthorized", success: false });
        }

        const alreadyAssigned = task.members.some(member => member.userId === userId);
        if (alreadyAssigned) {
            return res.status(400).json({ message: "User is already assigned to this task", key: "already_assigned", success: false });
        }

        const isProjectMember = task.list.project.members.some(member => member.userId === userId);
        if (!isProjectMember) {
            return res.status(403).json({ message: "User is not a member of this project", key: "not_project_member", success: false });
        }

        const taskMember = await prisma.taskMember.create({
            data: {
                taskId,
                userId
            },
            include: {
                user: true
            }
        });
        
        res.json({ data: taskMember, success: true });
    } catch (err) {
        console.error('assignMember error:', err);
        next(err);
    }
};

/**
 * Remove a member from a task
 * DELETE /api/tasks/:taskId/members/:userId
 * 
 * Returns: { data: { taskId, userId }, success: true }
 */
export const removeMember = async (req, res, next) => {
    try {
        const { taskId, userId } = req.params;
        
        if (!taskId) {
            return res.status(400).json({ message: "Task ID is required", key: "task_id_required", success: false });
        }
        
        if (!ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: "Invalid task ID", key: "invalid_task_id", success: false });
        }
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required", key: "user_id_required", success: false });
        }
        
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID", key: "invalid_user_id", success: false });
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
                }
            }
        });
        
        if (!task) {
            return res.status(404).json({ message: "Task not found", key: "task_not_found", success: false });
        }
        
        const isMember = task.list.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to remove members from this task", key: "unauthorized", success: false });
        }

        await prisma.taskMember.deleteMany({
            where: {
                taskId,
                userId
            }
        });
        
        res.json({ data: { taskId, userId }, success: true });
    } catch (err) {
        console.error('removeMember error:', err);
        next(err);
    }
};

/**
 * Add a subtask to a task
 * POST /api/tasks/:taskId/subtasks
 * 
 * Body: { name }
 * Returns: { data: subTask, success: true }
 */
export const addSubTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { name } = req.body;
        
        if (!taskId) {
            return res.status(400).json({ message: "Task ID is required", key: "task_id_required", success: false });
        }
        
        if (!ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: "Invalid task ID", key: "invalid_task_id", success: false });
        }
        
        if (!name) {
            return res.status(400).json({ message: "Subtask name is required", key: "name_required", success: false });
        }

        if (name.length < 2 || name.length > 100) {
            return res.status(400).json({ message: "Subtask name must be between 2 and 100 characters", key: "invalid_name", success: false });
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
                }
            }
        });
        
        if (!task) {
            return res.status(404).json({ message: "Task not found", key: "task_not_found", success: false });
        }
        
        const isMember = task.list.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to add subtasks to this task", key: "unauthorized", success: false });
        }

        const subTask = await prisma.subTask.create({
            data: {
                name: name.trim(),
                taskId
            }
        });
        
        res.json({ data: subTask, success: true });
    } catch (err) {
        console.error('addSubTask error:', err);
        next(err);
    }
};

/**
 * Update a subtask (name or completion status)
 * PUT /api/tasks/subtasks/:subTaskId
 * 
 * Body: { name, isCompleted }
 * Returns: { data: updatedSubTask, success: true }
 */
export const updateSubTask = async (req, res, next) => {
    try {
        const { subTaskId } = req.params;
        const { name, isCompleted } = req.body;
        
        if (!subTaskId) {
            return res.status(400).json({ message: "Subtask ID is required", key: "subtask_id_required", success: false });
        }
        
        if (!ObjectId.isValid(subTaskId)) {
            return res.status(400).json({ message: "Invalid subtask ID", key: "invalid_subtask_id", success: false });
        }

        const subTask = await prisma.subTask.findUnique({
            where: { id: subTaskId },
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
        
        if (!subTask) {
            return res.status(404).json({ message: "Subtask not found", key: "subtask_not_found", success: false });
        }
        
        const isMember = subTask.task.list.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to update this subtask", key: "unauthorized", success: false });
        }

        const updateData = {};
        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ message: "Subtask name is required", key: "name_required", success: false });
            }
            updateData.name = name.trim();
        }
        if (isCompleted !== undefined) {
            updateData.isCompleted = isCompleted;
        }
        
        const updatedSubTask = await prisma.subTask.update({
            where: { id: subTaskId },
            data: updateData
        });
        
        res.json({ data: updatedSubTask, success: true });
    } catch (err) {
        console.error('updateSubTask error:', err);
        next(err);
    }
};

export const deleteSubTask = async (req, res, next) => {
    try {
        const { subTaskId } = req.params;
        
        if (!subTaskId) {
            return res.status(400).json({ message: "Subtask ID is required", key: "subtask_id_required", success: false });
        }
        
        if (!ObjectId.isValid(subTaskId)) {
            return res.status(400).json({ message: "Invalid subtask ID", key: "invalid_subtask_id", success: false });
        }

        const subTask = await prisma.subTask.findUnique({
            where: { id: subTaskId },
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
        
        if (!subTask) {
            return res.status(404).json({ message: "Subtask not found", key: "subtask_not_found", success: false });
        }
        
        const isMember = subTask.task.list.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to delete this subtask", key: "unauthorized", success: false });
        }

        await prisma.subTask.delete({
            where: { id: subTaskId }
        });
        
        res.json({ data: { id: subTaskId }, success: true });
    } catch (err) {
        console.error('deleteSubTask error:', err);
        next(err);
    }
};

export const addLabel = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { labelId } = req.body;

        if (!taskId) {
            return res.status(400).json({ message: "Task ID is required", key: "task_id_required", success: false });
        }
        
        if (!ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: "Invalid task ID", key: "invalid_task_id", success: false });
        }
        
        if (!labelId) {
            return res.status(400).json({ message: "Label ID is required", key: "label_id_required", success: false });
        }
        
        if (!ObjectId.isValid(labelId)) {
            return res.status(400).json({ message: "Invalid label ID", key: "invalid_label_id", success: false });
        }

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                labels: true
            }
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found", key: "task_not_found", success: false });
        }

        const isMember = task.labels.some(label => label.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to add labels to this task", key: "unauthorized", success: false });
        }

        const label = await prisma.label.findUnique({
            where: { id: labelId },
        });

        if (!label) {
            return res.status(404).json({ message: "Label not found", key: "label_not_found", success: false });
        }

        const taskLabel = await prisma.taskLabel.create({
            data: { taskId, labelId }
        });

        res.json({ data: taskLabel, success: true });

    } catch (err) {
        console.error('addLabel error:', err);
        next(err);
    }
};

export const removeLabel = async (req, res, next) => {
    try {
        const { taskId, labelId } = req.params;
        
        if (!taskId) {
            return res.status(400).json({ message: "Task ID is required", key: "task_id_required", success: false });
        }
        
        if (!ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: "Invalid task ID", key: "invalid_task_id", success: false });
        }
        
        if (!labelId) {
            return res.status(400).json({ message: "Label ID is required", key: "label_id_required", success: false });
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
                }
            }
        });
        
        if (!task) {
            return res.status(404).json({ message: "Task not found", key: "task_not_found", success: false });
        }
        
        const isMember = task.list.project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to remove labels from this task", key: "unauthorized", success: false });
        }

        const updatedLabels = task.labels.filter(label => label.id !== labelId);
        
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { labels: updatedLabels },
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                subTasks: true
            }
        });
        
        res.json({ data: updatedTask, success: true });
    } catch (err) {
        console.error('removeLabel error:', err);
        next(err);
    }
};
