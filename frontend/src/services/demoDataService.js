/**
 * Frontend Demo Data Service
 * Provides in-browser demo mode with localStorage persistence
 * No backend required - everything runs client-side
 */

const DEMO_STORAGE_KEY = 'flomark_demo_data';
const DEMO_USER_KEY = 'flomark_demo_user';

/**
 * Initialize demo data with sample projects and tasks
 */
const initializeDemoData = () => {
  const demoUser = {
    id: 'demo-user-1',
    email: 'demo@flomark.app',
    name: 'Demo User',
    firstName: 'Demo',
    lastName: 'User',
    role: 'OWNER',
    twoFactorEnabled: false,
    profileImage: null,
    createdAt: new Date().toISOString()
  };

  const projects = [
    {
      id: 'demo-project-1',
      name: '🚀 Product Launch',
      description: 'Q1 2025 Product Launch',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      ownerId: demoUser.id
    },
    {
      id: 'demo-project-2',
      name: '🎨 Website Redesign',
      description: 'Modern UI/UX overhaul',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      ownerId: demoUser.id
    }
  ];

  const lists = [
    { id: 'demo-list-1', name: 'To Do', projectId: 'demo-project-1', order: 0 },
    { id: 'demo-list-2', name: 'In Progress', projectId: 'demo-project-1', order: 1 },
    { id: 'demo-list-3', name: 'Done', projectId: 'demo-project-1', order: 2 },
    { id: 'demo-list-4', name: 'Backlog', projectId: 'demo-project-2', order: 0 },
    { id: 'demo-list-5', name: 'Design', projectId: 'demo-project-2', order: 1 },
    { id: 'demo-list-6', name: 'Development', projectId: 'demo-project-2', order: 2 }
  ];

  const labels = [
    { id: 'demo-label-1', name: 'High Priority', color: '#ef4444', projectId: 'demo-project-1' },
    { id: 'demo-label-2', name: 'Bug', color: '#f97316', projectId: 'demo-project-1' },
    { id: 'demo-label-3', name: 'Feature', color: '#3b82f6', projectId: 'demo-project-1' },
    { id: 'demo-label-4', name: 'Design', color: '#8b5cf6', projectId: 'demo-project-2' },
    { id: 'demo-label-5', name: 'Frontend', color: '#10b981', projectId: 'demo-project-2' }
  ];

  const tasks = [
    {
      id: 'demo-task-1',
      name: 'Setup CI/CD Pipeline',
      description: 'Configure automated testing and deployment',
      listId: 'demo-list-1',
      order: 0,
      labelId: 'demo-label-1',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: demoUser.id,
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-task-2',
      name: 'Design Landing Page',
      description: 'Create mockups for the new landing page',
      listId: 'demo-list-2',
      order: 0,
      labelId: 'demo-label-3',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: demoUser.id,
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-task-3',
      name: 'Write API Documentation',
      description: 'Document all API endpoints',
      listId: 'demo-list-2',
      order: 1,
      labelId: null,
      dueDate: null,
      createdBy: demoUser.id,
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-task-4',
      name: 'User Testing',
      description: 'Conduct user testing sessions',
      listId: 'demo-list-3',
      order: 0,
      labelId: null,
      dueDate: null,
      createdBy: demoUser.id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-task-5',
      name: 'Color Scheme Selection',
      description: 'Choose primary and secondary colors',
      listId: 'demo-list-5',
      order: 0,
      labelId: 'demo-label-4',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: demoUser.id,
      createdAt: new Date().toISOString()
    }
  ];

  const subtasks = [
    { id: 'demo-subtask-1', taskId: 'demo-task-1', title: 'Research CI/CD tools', completed: true, order: 0 },
    { id: 'demo-subtask-2', taskId: 'demo-task-1', title: 'Configure GitHub Actions', completed: false, order: 1 },
    { id: 'demo-subtask-3', taskId: 'demo-task-1', title: 'Setup test environment', completed: false, order: 2 },
    { id: 'demo-subtask-4', taskId: 'demo-task-2', title: 'Sketch wireframes', completed: true, order: 0 },
    { id: 'demo-subtask-5', taskId: 'demo-task-2', title: 'Create high-fidelity mockups', completed: false, order: 1 }
  ];

  const members = [
    { id: 'demo-member-1', userId: demoUser.id, projectId: 'demo-project-1', role: 'OWNER' },
    { id: 'demo-member-2', userId: demoUser.id, projectId: 'demo-project-2', role: 'OWNER' }
  ];

  return {
    user: demoUser,
    projects,
    lists,
    labels,
    tasks,
    subtasks,
    members,
    notifications: []
  };
};

/**
 * Get demo data from localStorage or initialize if not exists
 */
export const getDemoData = () => {
  try {
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load demo data from localStorage:', error);
  }
  
  const initialData = initializeDemoData();
  saveDemoData(initialData);
  return initialData;
};

/**
 * Save demo data to localStorage
 */
export const saveDemoData = (data) => {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save demo data:', error);
  }
};

/**
 * Reset demo data to initial state
 */
export const resetDemoData = () => {
  const initialData = initializeDemoData();
  saveDemoData(initialData);
  return initialData;
};

/**
 * Check if demo mode is enabled
 */
export const isDemoMode = () => {
  // Check URL parameter or localStorage setting
  const urlParams = new URLSearchParams(window.location.search);
  const urlDemo = urlParams.get('demo') === 'true';
  const storageDemo = localStorage.getItem('demo_mode') === 'true';
  
  return urlDemo || storageDemo;
};

/**
 * Enable demo mode
 */
export const enableDemoMode = () => {
  localStorage.setItem('demo_mode', 'true');
  resetDemoData();
};

/**
 * Disable demo mode
 */
export const disableDemoMode = () => {
  localStorage.removeItem('demo_mode');
  localStorage.removeItem(DEMO_STORAGE_KEY);
  localStorage.removeItem(DEMO_USER_KEY);
};

/**
 * Get current demo user
 */
export const getDemoUser = () => {
  const data = getDemoData();
  return data.user;
};

/**
 * Generate unique ID for demo entities
 */
export const generateId = (prefix = 'demo') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Export demo data service
const demoDataService = {
  getDemoData,
  saveDemoData,
  resetDemoData,
  isDemoMode,
  enableDemoMode,
  disableDemoMode,
  getDemoUser,
  generateId
};

export default demoDataService;

