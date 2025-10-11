/**
 * Demo API Service
 * Intercepts API calls and returns mock data from localStorage
 * Simulates API responses without backend
 */

import demoDataService, { generateId } from './demoDataService';

// Simulate network delay for realism
const simulateDelay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Demo API - Simulates backend API responses
 */
export const demoApi = {
  // =======================
  // Authentication
  // =======================
  async login(credentials) {
    await simulateDelay();
    
    // Accept any credentials in demo mode
    const user = demoDataService.getDemoUser();
    const token = 'demo-token-' + Date.now();
    
    localStorage.setItem('demo_token', token);
    localStorage.setItem('demo_user', JSON.stringify(user));
    
    return {
      data: {
        success: true,
        data: {
          token,
          refreshToken: 'demo-refresh-token',
          user
        }
      }
    };
  },

  async register(userData) {
    await simulateDelay();
    // In demo mode, just log them in
    return this.login({ email: userData.email, password: 'demo' });
  },

  async refreshToken() {
    await simulateDelay();
    const user = demoDataService.getDemoUser();
    return {
      data: {
        success: true,
        data: {
          token: 'demo-token-' + Date.now(),
          user
        }
      }
    };
  },

  async getProfile() {
    await simulateDelay();
    const user = demoDataService.getDemoUser();
    return {
      data: {
        success: true,
        data: user
      }
    };
  },

  async updateProfile(updates) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    data.user = { ...data.user, ...updates };
    demoDataService.saveDemoData(data);
    
    return {
      data: {
        success: true,
        data: data.user
      }
    };
  },

  // =======================
  // Projects
  // =======================
  async getProjects() {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    
    // Add member information to projects
    const projectsWithMembers = data.projects.map(project => ({
      ...project,
      members: data.members
        .filter(m => m.projectId === project.id)
        .map(m => ({
          ...m,
          user: data.user
        }))
    }));
    
    return {
      data: {
        success: true,
        data: projectsWithMembers
      }
    };
  },

  async getProjectById(projectId) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    const project = data.projects.find(p => p.id === projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    const projectWithMembers = {
      ...project,
      members: data.members
        .filter(m => m.projectId === projectId)
        .map(m => ({
          ...m,
          user: data.user
        }))
    };
    
    return {
      data: {
        success: true,
        data: projectWithMembers
      }
    };
  },

  async createProject(projectData) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    
    const newProject = {
      id: generateId('project'),
      name: projectData.name,
      description: projectData.description || '',
      createdAt: new Date().toISOString(),
      ownerId: data.user.id
    };
    
    const newMember = {
      id: generateId('member'),
      userId: data.user.id,
      projectId: newProject.id,
      role: 'OWNER'
    };
    
    data.projects.push(newProject);
    data.members.push(newMember);
    demoDataService.saveDemoData(data);
    
    return {
      data: {
        success: true,
        data: {
          ...newProject,
          members: [{ ...newMember, user: data.user }]
        }
      }
    };
  },

  async updateProject(projectId, updates) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    const projectIndex = data.projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    data.projects[projectIndex] = { ...data.projects[projectIndex], ...updates };
    demoDataService.saveDemoData(data);
    
    return {
      data: {
        success: true,
        data: data.projects[projectIndex]
      }
    };
  },

  async deleteProject(projectId) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    
    // Remove project and all related data
    data.projects = data.projects.filter(p => p.id !== projectId);
    data.lists = data.lists.filter(l => l.projectId !== projectId);
    data.labels = data.labels.filter(l => l.projectId !== projectId);
    data.members = data.members.filter(m => m.projectId !== projectId);
    
    // Remove tasks from deleted lists
    const listIds = data.lists.filter(l => l.projectId === projectId).map(l => l.id);
    data.tasks = data.tasks.filter(t => !listIds.includes(t.listId));
    
    demoDataService.saveDemoData(data);
    
    return {
      data: {
        success: true,
        message: 'Project deleted'
      }
    };
  },

  // =======================
  // Lists
  // =======================
  async getListsByProject(projectId) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    const lists = data.lists.filter(l => l.projectId === projectId);
    
    return {
      data: {
        success: true,
        data: lists
      }
    };
  },

  async createList(projectId, listData) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    
    const projectLists = data.lists.filter(l => l.projectId === projectId);
    const newList = {
      id: generateId('list'),
      name: listData.name,
      projectId,
      order: projectLists.length,
      createdAt: new Date().toISOString()
    };
    
    data.lists.push(newList);
    demoDataService.saveDemoData(data);
    
    return {
      data: {
        success: true,
        data: newList
      }
    };
  },

  async updateList(listId, updates) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    const listIndex = data.lists.findIndex(l => l.id === listId);
    
    if (listIndex === -1) {
      throw new Error('List not found');
    }
    
    data.lists[listIndex] = { ...data.lists[listIndex], ...updates };
    demoDataService.saveDemoData(data);
    
    return {
      data: {
        success: true,
        data: data.lists[listIndex]
      }
    };
  },

  // =======================
  // Tasks
  // =======================
  async getTasksByList(listId) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    const tasks = data.tasks.filter(t => t.listId === listId);
    
    // Add related data
    const tasksWithData = tasks.map(task => ({
      ...task,
      label: task.labelId ? data.labels.find(l => l.id === task.labelId) : null,
      subTasks: data.subtasks.filter(st => st.taskId === task.id),
      attachments: [],
      createdByUser: data.user
    }));
    
    return {
      data: {
        success: true,
        data: tasksWithData
      }
    };
  },

  async createTask(listId, taskData) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    
    const listTasks = data.tasks.filter(t => t.listId === listId);
    const newTask = {
      id: generateId('task'),
      name: taskData.name,
      description: taskData.description || '',
      listId,
      order: listTasks.length,
      labelId: taskData.labelId || null,
      dueDate: taskData.dueDate || null,
      createdBy: data.user.id,
      createdAt: new Date().toISOString()
    };
    
    data.tasks.push(newTask);
    demoDataService.saveDemoData(data);
    
    return {
      data: {
        success: true,
        data: {
          ...newTask,
          label: newTask.labelId ? data.labels.find(l => l.id === newTask.labelId) : null,
          subTasks: [],
          attachments: [],
          createdByUser: data.user
        }
      }
    };
  },

  async updateTask(taskId, updates) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updates };
    demoDataService.saveDemoData(data);
    
    const task = data.tasks[taskIndex];
    return {
      data: {
        success: true,
        data: {
          ...task,
          label: task.labelId ? data.labels.find(l => l.id === task.labelId) : null,
          subTasks: data.subtasks.filter(st => st.taskId === taskId),
          attachments: []
        }
      }
    };
  },

  async deleteTask(taskId) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    
    data.tasks = data.tasks.filter(t => t.id !== taskId);
    data.subtasks = data.subtasks.filter(st => st.taskId !== taskId);
    demoDataService.saveDemoData(data);
    
    return {
      data: {
        success: true,
        message: 'Task deleted'
      }
    };
  },

  async moveTask(taskId, newListId) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const newListTasks = data.tasks.filter(t => t.listId === newListId);
    data.tasks[taskIndex].listId = newListId;
    data.tasks[taskIndex].order = newListTasks.length;
    
    demoDataService.saveDemoData(data);
    
    return {
      data: {
        success: true,
        data: data.tasks[taskIndex]
      }
    };
  },

  // =======================
  // Subtasks
  // =======================
  async createSubtask(taskId, subtaskData) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    
    const taskSubtasks = data.subtasks.filter(st => st.taskId === taskId);
    const newSubtask = {
      id: generateId('subtask'),
      taskId,
      title: subtaskData.title,
      completed: false,
      order: taskSubtasks.length
    };
    
    data.subtasks.push(newSubtask);
    demoDataService.saveDemoData(data);
    
    return {
      data: {
        success: true,
        data: newSubtask
      }
    };
  },

  async updateSubtask(subtaskId, updates) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    const subtaskIndex = data.subtasks.findIndex(st => st.id === subtaskId);
    
    if (subtaskIndex === -1) {
      throw new Error('Subtask not found');
    }
    
    data.subtasks[subtaskIndex] = { ...data.subtasks[subtaskIndex], ...updates };
    demoDataService.saveDemoData(data);
    
    return {
      data: {
        success: true,
        data: data.subtasks[subtaskIndex]
      }
    };
  },

  async deleteSubtask(subtaskId) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    
    data.subtasks = data.subtasks.filter(st => st.id !== subtaskId);
    demoDataService.saveDemoData(data);
    
    return {
      data: {
        success: true,
        message: 'Subtask deleted'
      }
    };
  },

  // =======================
  // Labels
  // =======================
  async getLabelsByProject(projectId) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    const labels = data.labels.filter(l => l.projectId === projectId);
    
    return {
      data: {
        success: true,
        data: labels
      }
    };
  },

  async createLabel(projectId, labelData) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    
    const newLabel = {
      id: generateId('label'),
      name: labelData.name,
      color: labelData.color,
      projectId
    };
    
    data.labels.push(newLabel);
    demoDataService.saveDemoData(data);
    
    return {
      data: {
        success: true,
        data: newLabel
      }
    };
  },

  async updateLabel(labelId, updates) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    const labelIndex = data.labels.findIndex(l => l.id === labelId);
    
    if (labelIndex === -1) {
      throw new Error('Label not found');
    }
    
    data.labels[labelIndex] = { ...data.labels[labelIndex], ...updates };
    demoDataService.saveDemoData(data);
    
    return {
      data: {
        success: true,
        data: data.labels[labelIndex]
      }
    };
  },

  async deleteLabel(labelId) {
    await simulateDelay();
    const data = demoDataService.getDemoData();
    
    // Remove label from tasks
    data.tasks.forEach(task => {
      if (task.labelId === labelId) {
        task.labelId = null;
      }
    });
    
    data.labels = data.labels.filter(l => l.id !== labelId);
    demoDataService.saveDemoData(data);
    
    return {
      data: {
        success: true,
        message: 'Label deleted'
      }
    };
  },

  // =======================
  // Notifications
  // =======================
  async getNotifications() {
    await simulateDelay();
    return {
      data: {
        success: true,
        data: []
      }
    };
  },

  async markNotificationRead(notificationId) {
    await simulateDelay();
    return {
      data: {
        success: true,
        message: 'Notification marked as read'
      }
    };
  }
};

export default demoApi;

