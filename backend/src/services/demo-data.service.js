import { ENV } from '../config/env.js';
import bcrypt from 'bcrypt';

/**
 * In-Memory Data Storage for Demo Mode
 * All data is stored in memory and resets every 20-30 minutes
 */

// In-memory storage
let demoData = {
  users: [],
  projects: [],
  lists: [],
  tasks: [],
  labels: [],
  members: [],
  subtasks: [],
  attachments: [],
  notifications: []
};

let nextId = {
  user: 1,
  project: 1,
  list: 1,
  task: 1,
  label: 1,
  member: 1,
  subtask: 1,
  attachment: 1,
  notification: 1
};

let resetTimer = null;
let lastReset = Date.now();

/**
 * Initialize demo data with 2 example projects
 */
export async function initializeDemoData() {
  console.log('🎭 Initializing demo data...');
  
  // Reset everything
  demoData = {
    users: [],
    projects: [],
    lists: [],
    tasks: [],
    labels: [],
    members: [],
    subtasks: [],
    attachments: [],
    notifications: []
  };
  
  nextId = {
    user: 1,
    project: 1,
    list: 1,
    task: 1,
    label: 1,
    member: 1,
    subtask: 1,
    attachment: 1,
    notification: 1
  };

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo', 10);
  const demoUser = {
    id: 'demo-user-1',
    email: 'demo@flomark.app',
    name: 'Demo User',
    password: hashedPassword,
    role: 'USER',
    profileImage: null,
    registerIP: 'demo',
    lastIP: 'demo',
    twoFactorEnabled: false,
    twoFactorSecret: null,
    createdAt: new Date()
  };
  demoData.users.push(demoUser);

  // PROJECT 1: Marketing Campaign
  const project1 = {
    id: 'demo-project-1',
    name: '🎯 Marketing Campaign 2024',
    description: 'Launch our new product marketing campaign across all channels',
    ownerId: demoUser.id,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  demoData.projects.push(project1);

  // PROJECT 2: Website Redesign
  const project2 = {
    id: 'demo-project-2',
    name: '🎨 Website Redesign',
    description: 'Complete redesign of our company website with modern UI/UX',
    ownerId: demoUser.id,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  demoData.projects.push(project2);

  // Add user as owner to both projects
  demoData.members.push({
    id: 'member-1',
    userId: demoUser.id,
    projectId: project1.id,
    role: 'OWNER',
    joinedAt: new Date()
  });
  demoData.members.push({
    id: 'member-2',
    userId: demoUser.id,
    projectId: project2.id,
    role: 'OWNER',
    joinedAt: new Date()
  });

  // Create lists for Project 1
  const p1Lists = [
    { id: 'list-1', name: 'To Do', projectId: project1.id, order: 0 },
    { id: 'list-2', name: 'In Progress', projectId: project1.id, order: 1 },
    { id: 'list-3', name: 'Review', projectId: project1.id, order: 2 },
    { id: 'list-4', name: 'Done', projectId: project1.id, order: 3 }
  ];
  demoData.lists.push(...p1Lists);

  // Create lists for Project 2
  const p2Lists = [
    { id: 'list-5', name: 'Backlog', projectId: project2.id, order: 0 },
    { id: 'list-6', name: 'Design', projectId: project2.id, order: 1 },
    { id: 'list-7', name: 'Development', projectId: project2.id, order: 2 },
    { id: 'list-8', name: 'Completed', projectId: project2.id, order: 3 }
  ];
  demoData.lists.push(...p2Lists);

  // Create labels for Project 1
  const p1Labels = [
    { id: 'label-1', name: 'High Priority', color: '#ef4444', projectId: project1.id },
    { id: 'label-2', name: 'Social Media', color: '#3b82f6', projectId: project1.id },
    { id: 'label-3', name: 'Content', color: '#10b981', projectId: project1.id },
    { id: 'label-4', name: 'Analytics', color: '#f59e0b', projectId: project1.id }
  ];
  demoData.labels.push(...p1Labels);

  // Create labels for Project 2
  const p2Labels = [
    { id: 'label-5', name: 'UI', color: '#8b5cf6', projectId: project2.id },
    { id: 'label-6', name: 'UX', color: '#ec4899', projectId: project2.id },
    { id: 'label-7', name: 'Frontend', color: '#06b6d4', projectId: project2.id },
    { id: 'label-8', name: 'Backend', color: '#84cc16', projectId: project2.id }
  ];
  demoData.labels.push(...p2Labels);

  // Create tasks for Project 1
  const p1Tasks = [
    {
      id: 'task-1',
      name: '👋 Welcome to Flomark Demo!',
      description: 'This is a demo environment with 2 sample projects. Try creating tasks, moving them around, and exploring all features!\n\n✨ Features to try:\n• Drag & drop tasks\n• Add subtasks\n• Assign labels\n• Set due dates\n• Upload attachments\n\nData resets every 20-30 minutes.',
      listId: 'list-1',
      projectId: project1.id,
      order: 0,
      labelId: 'label-1',
      createdBy: demoUser.id,
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'task-2',
      name: 'Plan Q4 Social Media Strategy',
      description: 'Create comprehensive social media plan for Q4 including content calendar, posting schedule, and engagement tactics for all platforms.',
      listId: 'list-1',
      projectId: project1.id,
      order: 1,
      labelId: 'label-2',
      createdBy: demoUser.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'task-3',
      name: 'Design Campaign Graphics & Assets',
      description: 'Create visual assets for the marketing campaign including social media posts, email banners, and landing page graphics.',
      listId: 'list-2',
      projectId: project1.id,
      order: 0,
      labelId: 'label-3',
      createdBy: demoUser.id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'task-4',
      name: 'Write Product Launch Blog Post',
      description: 'Draft compelling blog post announcing the new product features and benefits.',
      listId: 'list-2',
      projectId: project1.id,
      order: 1,
      labelId: 'label-3',
      createdBy: demoUser.id,
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'task-5',
      name: 'Set Up Google Analytics & Tag Manager',
      description: 'Configure GA4 and GTM for comprehensive campaign tracking and conversion optimization.',
      listId: 'list-4',
      projectId: project1.id,
      order: 0,
      labelId: 'label-4',
      createdBy: demoUser.id,
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  demoData.tasks.push(...p1Tasks);

  // Create tasks for Project 2
  const p2Tasks = [
    {
      id: 'task-6',
      name: 'Research Modern Design Trends 2024',
      description: 'Analyze competitor websites, design trends, and best practices for modern web design. Focus on minimalism, animations, and user experience.',
      listId: 'list-5',
      projectId: project2.id,
      order: 0,
      labelId: 'label-5',
      createdBy: demoUser.id,
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'task-7',
      name: 'Create High-Fidelity Wireframes',
      description: 'Design detailed wireframes for all main pages including homepage, about, services, and contact.',
      listId: 'list-6',
      projectId: project2.id,
      order: 0,
      labelId: 'label-6',
      createdBy: demoUser.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'task-8',
      name: 'Build Responsive Navigation Component',
      description: 'Implement mobile-first navigation with hamburger menu, smooth animations, and accessibility features.',
      listId: 'list-7',
      projectId: project2.id,
      order: 0,
      labelId: 'label-7',
      createdBy: demoUser.id,
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'task-9',
      name: 'Implement Dark Mode Toggle',
      description: 'Add theme switcher with localStorage persistence and smooth transitions between light/dark modes.',
      listId: 'list-7',
      projectId: project2.id,
      order: 1,
      labelId: 'label-7',
      createdBy: demoUser.id,
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'task-10',
      name: 'Setup REST API Endpoints',
      description: 'Create backend API for contact form submissions, newsletter signup, and analytics tracking.',
      listId: 'list-7',
      projectId: project2.id,
      order: 2,
      labelId: 'label-8',
      createdBy: demoUser.id,
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  demoData.tasks.push(...p2Tasks);

  // Add ALL subtasks after all tasks are created
  const allSubtasks = [
    // Subtasks for Task 2 (Social Media Strategy)
    { id: 'subtask-1', taskId: 'task-2', title: 'Research competitor social media presence', completed: true, createdAt: new Date() },
    { id: 'subtask-2', taskId: 'task-2', title: 'Define content pillars and themes', completed: true, createdAt: new Date() },
    { id: 'subtask-3', taskId: 'task-2', title: 'Create monthly posting calendar', completed: false, createdAt: new Date() },
    { id: 'subtask-4', taskId: 'task-2', title: 'Schedule content in advance', completed: false, createdAt: new Date() },
    
    // Subtasks for Task 3 (Campaign Graphics)
    { id: 'subtask-5', taskId: 'task-3', title: 'Create Instagram post templates', completed: false, createdAt: new Date() },
    { id: 'subtask-6', taskId: 'task-3', title: 'Design email header banner', completed: false, createdAt: new Date() },
    { id: 'subtask-7', taskId: 'task-3', title: 'Develop brand style guide', completed: false, createdAt: new Date() },
    
    // Subtasks for Task 7 (Wireframes) - Project 2
    { id: 'subtask-8', taskId: 'task-7', title: 'Homepage wireframe', completed: true, createdAt: new Date() },
    { id: 'subtask-9', taskId: 'task-7', title: 'About page wireframe', completed: true, createdAt: new Date() },
    { id: 'subtask-10', taskId: 'task-7', title: 'Services page wireframe', completed: false, createdAt: new Date() },
    { id: 'subtask-11', taskId: 'task-7', title: 'Contact page wireframe', completed: false, createdAt: new Date() },
    
    // Subtasks for Task 8 (Navigation) - Project 2
    { id: 'subtask-12', taskId: 'task-8', title: 'Desktop navigation menu', completed: true, createdAt: new Date() },
    { id: 'subtask-13', taskId: 'task-8', title: 'Mobile hamburger menu', completed: false, createdAt: new Date() },
    { id: 'subtask-14', taskId: 'task-8', title: 'Smooth scroll animations', completed: false, createdAt: new Date() }
  ];
  
  demoData.subtasks = allSubtasks;
  
  console.log(`✅ Created ${demoData.subtasks.length} subtasks`);

  lastReset = Date.now();
  console.log('✅ Demo data initialized with 2 projects');
  console.log(`   - ${project1.name} (${p1Tasks.length} tasks)`);
  console.log(`   - ${project2.name} (${p2Tasks.length} tasks)`);
  console.log(`✅ Created ${demoData.tasks.length} total tasks with ${demoData.subtasks.length} subtasks`);
}

/**
 * Start auto-reset timer (20-30 minutes random interval)
 */
export function startAutoReset() {
  if (!ENV.DEMO_MODE) return;

  // Clear existing timer
  if (resetTimer) {
    clearTimeout(resetTimer);
  }

  // Random interval between 20-30 minutes (in milliseconds)
  const minMinutes = 20;
  const maxMinutes = 30;
  const interval = (minMinutes + Math.random() * (maxMinutes - minMinutes)) * 60 * 1000;

  console.log(`⏰ Demo data will reset in ${Math.round(interval / 60000)} minutes`);

  resetTimer = setTimeout(async () => {
    console.log('🔄 Auto-resetting demo data...');
    await initializeDemoData();
    startAutoReset(); // Schedule next reset
  }, interval);
}

/**
 * Stop auto-reset timer
 */
export function stopAutoReset() {
  if (resetTimer) {
    clearTimeout(resetTimer);
    resetTimer = null;
    console.log('⏹️ Auto-reset stopped');
  }
}

/**
 * Get time until next reset
 */
export function getTimeUntilReset() {
  const elapsed = Date.now() - lastReset;
  const maxInterval = 30 * 60 * 1000; // 30 minutes
  const remaining = maxInterval - elapsed;
  return Math.max(0, remaining);
}

/**
 * Helper to generate next ID
 */
function getNextId(type) {
  return `${type}-${nextId[type]++}`;
}

// ==================================================
// DATA ACCESS FUNCTIONS
// ==================================================

export const DemoDataService = {
  // Users
  findUserByEmail: (email) => demoData.users.find(u => u.email === email),
  findUserById: (id) => demoData.users.find(u => u.id === id),
  
  // Projects
  findAllProjects: (userId) => {
    const memberProjects = demoData.members
      .filter(m => m.userId === userId)
      .map(m => m.projectId);
    return demoData.projects.filter(p => memberProjects.includes(p.id));
  },
  findProjectById: (id) => demoData.projects.find(p => p.id === id),
  createProject: (data) => {
    const project = {
      id: getNextId('project'),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    demoData.projects.push(project);
    return project;
  },
  updateProject: (id, data) => {
    const index = demoData.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      demoData.projects[index] = { ...demoData.projects[index], ...data, updatedAt: new Date() };
      return demoData.projects[index];
    }
    return null;
  },
  deleteProject: (id) => {
    const index = demoData.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      demoData.projects.splice(index, 1);
      // Clean up related data
      demoData.lists = demoData.lists.filter(l => l.projectId !== id);
      demoData.tasks = demoData.tasks.filter(t => t.projectId !== id);
      demoData.labels = demoData.labels.filter(l => l.projectId !== id);
      demoData.members = demoData.members.filter(m => m.projectId !== id);
      return true;
    }
    return false;
  },

  // Lists
  findListsByProject: (projectId) => demoData.lists.filter(l => l.projectId === projectId).sort((a, b) => a.order - b.order),
  findListById: (id) => demoData.lists.find(l => l.id === id),
  createList: (data) => {
    const list = {
      id: getNextId('list'),
      ...data
    };
    demoData.lists.push(list);
    return list;
  },
  updateList: (id, data) => {
    const index = demoData.lists.findIndex(l => l.id === id);
    if (index !== -1) {
      demoData.lists[index] = { ...demoData.lists[index], ...data };
      return demoData.lists[index];
    }
    return null;
  },

  // Tasks
  findTasksByList: (listId) => demoData.tasks.filter(t => t.listId === listId).sort((a, b) => a.order - b.order),
  findTaskById: (id) => demoData.tasks.find(t => t.id === id),
  createTask: (data) => {
    const task = {
      id: getNextId('task'),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    demoData.tasks.push(task);
    return task;
  },
  updateTask: (id, data) => {
    const index = demoData.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      demoData.tasks[index] = { ...demoData.tasks[index], ...data, updatedAt: new Date() };
      return demoData.tasks[index];
    }
    return null;
  },
  deleteTask: (id) => {
    const index = demoData.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      demoData.tasks.splice(index, 1);
      demoData.subtasks = demoData.subtasks.filter(s => s.taskId !== id);
      demoData.attachments = demoData.attachments.filter(a => a.taskId !== id);
      return true;
    }
    return false;
  },

  // Labels
  findLabelsByProject: (projectId) => demoData.labels.filter(l => l.projectId === projectId),
  findLabelById: (id) => demoData.labels.find(l => l.id === id),
  createLabel: (data) => {
    const label = {
      id: getNextId('label'),
      ...data
    };
    demoData.labels.push(label);
    return label;
  },
  updateLabel: (id, data) => {
    const index = demoData.labels.findIndex(l => l.id === id);
    if (index !== -1) {
      demoData.labels[index] = { ...demoData.labels[index], ...data };
      return demoData.labels[index];
    }
    return null;
  },
  deleteLabel: (id) => {
    const index = demoData.labels.findIndex(l => l.id === id);
    if (index !== -1) {
      demoData.labels.splice(index, 1);
      // Remove label from tasks
      demoData.tasks.forEach(t => {
        if (t.labelId === id) t.labelId = null;
      });
      return true;
    }
    return false;
  },

  // Members
  findMembersByProject: (projectId) => demoData.members.filter(m => m.projectId === projectId),
  findMemberByUserAndProject: (userId, projectId) => demoData.members.find(m => m.userId === userId && m.projectId === projectId),
  createMember: (data) => {
    const member = {
      id: getNextId('member'),
      ...data,
      joinedAt: new Date()
    };
    demoData.members.push(member);
    return member;
  },
  deleteMember: (id) => {
    const index = demoData.members.findIndex(m => m.id === id);
    if (index !== -1) {
      demoData.members.splice(index, 1);
      return true;
    }
    return false;
  },

  // Subtasks
  findSubtasksByTask: (taskId) => demoData.subtasks.filter(s => s.taskId === taskId),
  createSubtask: (data) => {
    const subtask = {
      id: getNextId('subtask'),
      ...data,
      completed: false,
      createdAt: new Date()
    };
    demoData.subtasks.push(subtask);
    return subtask;
  },
  updateSubtask: (id, data) => {
    const index = demoData.subtasks.findIndex(s => s.id === id);
    if (index !== -1) {
      demoData.subtasks[index] = { ...demoData.subtasks[index], ...data };
      return demoData.subtasks[index];
    }
    return null;
  },
  deleteSubtask: (id) => {
    const index = demoData.subtasks.findIndex(s => s.id === id);
    if (index !== -1) {
      demoData.subtasks.splice(index, 1);
      return true;
    }
    return false;
  },

  // Attachments
  findAttachmentsByTask: (taskId) => demoData.attachments.filter(a => a.taskId === taskId),
  createAttachment: (data) => {
    const attachment = {
      id: getNextId('attachment'),
      ...data,
      uploadedAt: new Date()
    };
    demoData.attachments.push(attachment);
    return attachment;
  },
  deleteAttachment: (id) => {
    const index = demoData.attachments.findIndex(a => a.id === id);
    if (index !== -1) {
      demoData.attachments.splice(index, 1);
      return true;
    }
    return false;
  },

  // Get all data (for debugging)
  getAllData: () => demoData,
  
  // Get stats
  getStats: () => ({
    users: demoData.users.length,
    projects: demoData.projects.length,
    lists: demoData.lists.length,
    tasks: demoData.tasks.length,
    labels: demoData.labels.length,
    members: demoData.members.length,
    subtasks: demoData.subtasks.length,
    attachments: demoData.attachments.length,
    timeUntilReset: getTimeUntilReset()
  })
};

// Also export functions individually
export const {
  findUserByEmail,
  findUserById,
  findAllProjects,
  findProjectById,
  createProject,
  updateProject,
  deleteProject,
  findListsByProject,
  findListById,
  createList,
  updateList,
  findTasksByList,
  findTaskById,
  createTask,
  updateTask,
  deleteTask,
  findLabelsByProject,
  findLabelById,
  createLabel,
  updateLabel,
  deleteLabel,
  findMembersByProject,
  findMemberByUserAndProject,
  createMember,
  deleteMember,
  findSubtasksByTask,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  findAttachmentsByTask,
  createAttachment,
  deleteAttachment,
  getAllData,
  getStats
} = DemoDataService;

export default DemoDataService;

