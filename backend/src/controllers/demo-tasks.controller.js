import { DemoDataService } from '../services/demo-data.service.js';

/**
 * Demo Tasks Controller
 * Handles task operations using in-memory data (NO DATABASE)
 */

// Get tasks by list
export const getTasksByList = async (req, res) => {
  try {
    const { listId } = req.params;
    const tasks = DemoDataService.findTasksByList(listId).map(task => ({
      ...task,
      label: task.labelId ? DemoDataService.findLabelById(task.labelId) : null,
      subtasks: DemoDataService.findSubtasksByTask(task.id), // lowercase for frontend
      attachments: DemoDataService.findAttachmentsByTask(task.id)
    }));
    
    res.json({ data: tasks, success: true });
  } catch (err) {
    console.error('Demo getTasksByList error:', err);
    res.status(500).json({ message: 'Failed to fetch tasks', success: false });
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = DemoDataService.findTaskById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found', success: false });
    }
    
    const taskWithDetails = {
      ...task,
      label: task.labelId ? DemoDataService.findLabelById(task.labelId) : null,
      subtasks: DemoDataService.findSubtasksByTask(task.id), // lowercase for frontend
      attachments: DemoDataService.findAttachmentsByTask(task.id),
      createdByUser: DemoDataService.findUserById(task.createdBy)
    };
    
    res.json({ data: taskWithDetails, success: true });
  } catch (err) {
    console.error('Demo getTaskById error:', err);
    res.status(500).json({ message: 'Failed to fetch task', success: false });
  }
};

// Create task
export const createTask = async (req, res) => {
  try {
    const { listId } = req.params;
    const { name, description, labelId, dueDate } = req.body;
    const userId = req.user.id;
    
    const tasks = DemoDataService.findTasksByList(listId);
    const order = tasks.length;
    
    // Get projectId from list
    const list = DemoDataService.findListById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found', success: false });
    }
    
    const task = DemoDataService.createTask({
      name,
      description: description || '',
      listId,
      projectId: list.projectId,
      order,
      labelId: labelId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: userId
    });
    
    res.json({ data: task, success: true });
  } catch (err) {
    console.error('Demo createTask error:', err);
    res.status(500).json({ message: 'Failed to create task', success: false });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { name, description, labelId, dueDate } = req.body;
    
    const updated = DemoDataService.updateTask(taskId, {
      name,
      description,
      labelId,
      dueDate: dueDate ? new Date(dueDate) : null
    });
    
    if (!updated) {
      return res.status(404).json({ message: 'Task not found', success: false });
    }
    
    res.json({ data: updated, success: true });
  } catch (err) {
    console.error('Demo updateTask error:', err);
    res.status(500).json({ message: 'Failed to update task', success: false });
  }
};

// Move task
export const moveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { newListId, newOrder } = req.body;
    
    const task = DemoDataService.findTaskById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found', success: false });
    }
    
    const updated = DemoDataService.updateTask(taskId, {
      listId: newListId,
      order: newOrder
    });
    
    res.json({ data: updated, success: true });
  } catch (err) {
    console.error('Demo moveTask error:', err);
    res.status(500).json({ message: 'Failed to move task', success: false });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const deleted = DemoDataService.deleteTask(taskId);
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found', success: false });
    }
    
    res.json({ message: 'Task deleted', success: true });
  } catch (err) {
    console.error('Demo deleteTask error:', err);
    res.status(500).json({ message: 'Failed to delete task', success: false });
  }
};

// Reorder tasks
export const reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    
    // Update order for each task
    tasks.forEach(({ id, order }) => {
      DemoDataService.updateTask(id, { order });
    });
    
    res.json({ message: 'Tasks reordered', success: true });
  } catch (err) {
    console.error('Demo reorderTasks error:', err);
    res.status(500).json({ message: 'Failed to reorder tasks', success: false });
  }
};

// Add subtask
export const addSubTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;
    
    const subtask = DemoDataService.createSubtask({
      taskId,
      title,
      completed: false
    });
    
    res.json({ data: subtask, success: true });
  } catch (err) {
    console.error('Demo addSubTask error:', err);
    res.status(500).json({ message: 'Failed to add subtask', success: false });
  }
};

// Update subtask
export const updateSubTask = async (req, res) => {
  try {
    const { subTaskId } = req.params;
    const { title, completed } = req.body;
    
    const updated = DemoDataService.updateSubtask(subTaskId, { title, completed });
    if (!updated) {
      return res.status(404).json({ message: 'Subtask not found', success: false });
    }
    
    res.json({ data: updated, success: true });
  } catch (err) {
    console.error('Demo updateSubTask error:', err);
    res.status(500).json({ message: 'Failed to update subtask', success: false });
  }
};

// Delete subtask
export const deleteSubTask = async (req, res) => {
  try {
    const { subTaskId } = req.params;
    
    const deleted = DemoDataService.deleteSubtask(subTaskId);
    if (!deleted) {
      return res.status(404).json({ message: 'Subtask not found', success: false });
    }
    
    res.json({ message: 'Subtask deleted', success: true });
  } catch (err) {
    console.error('Demo deleteSubTask error:', err);
    res.status(500).json({ message: 'Failed to delete subtask', success: false });
  }
};

// Add label to task
export const addLabel = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { labelId } = req.body;
    
    const updated = DemoDataService.updateTask(taskId, { labelId });
    if (!updated) {
      return res.status(404).json({ message: 'Task not found', success: false });
    }
    
    res.json({ data: updated, success: true });
  } catch (err) {
    console.error('Demo addLabel error:', err);
    res.status(500).json({ message: 'Failed to add label', success: false });
  }
};

// Remove label from task
export const removeLabel = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const updated = DemoDataService.updateTask(taskId, { labelId: null });
    if (!updated) {
      return res.status(404).json({ message: 'Task not found', success: false });
    }
    
    res.json({ data: updated, success: true });
  } catch (err) {
    console.error('Demo removeLabel error:', err);
    res.status(500).json({ message: 'Failed to remove label', success: false });
  }
};

// Task members storage (in-memory)
const taskMembers = new Map(); // taskId -> [userId, userId, ...]

// Assign member to task
export const assignMember = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body;
    
    const task = DemoDataService.findTaskById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found', success: false });
    }
    
    // Get or create member list for this task
    if (!taskMembers.has(taskId)) {
      taskMembers.set(taskId, []);
    }
    
    const members = taskMembers.get(taskId);
    
    // Check if already assigned
    if (!members.includes(userId)) {
      members.push(userId);
      console.log(`✅ Assigned user ${userId} to task ${taskId}`);
    }
    
    res.json({ 
      message: 'Member assigned to task', 
      success: true,
      data: { userId, taskId }
    });
  } catch (err) {
    console.error('Demo assignMember error:', err);
    res.status(500).json({ message: 'Failed to assign member', success: false });
  }
};

// Remove member from task
export const removeMember = async (req, res) => {
  try {
    const { taskId, userId } = req.params;
    
    const task = DemoDataService.findTaskById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found', success: false });
    }
    
    if (taskMembers.has(taskId)) {
      const members = taskMembers.get(taskId);
      const index = members.indexOf(userId);
      if (index > -1) {
        members.splice(index, 1);
        console.log(`✅ Removed user ${userId} from task ${taskId}`);
      }
    }
    
    res.json({ 
      message: 'Member removed from task', 
      success: true 
    });
  } catch (err) {
    console.error('Demo removeMember error:', err);
    res.status(500).json({ message: 'Failed to remove member', success: false });
  }
};

// Get task members
export const getTaskMembers = (taskId) => {
  return taskMembers.get(taskId) || [];
};

export default {
  getTasksByList,
  getTaskById,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  reorderTasks,
  addSubTask,
  updateSubTask,
  deleteSubTask,
  addLabel,
  removeLabel,
  assignMember,
  removeMember
};

