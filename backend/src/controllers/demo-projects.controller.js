import { DemoDataService } from '../services/demo-data.service.js';

/**
 * Demo Projects Controller
 * Handles project operations using in-memory data (NO DATABASE)
 */

// Get all projects for user
export const getProjects = async (req, res) => {
  try {
    console.log('🎭 Demo getProjects - req.user:', req.user);
    
    if (!req.user || !req.user.id) {
      console.error('❌ Demo getProjects: req.user is undefined or missing id');
      return res.status(401).json({ message: 'User not authenticated', success: false });
    }
    
    const userId = req.user.id;
    console.log('🎭 Finding projects for user:', userId);
    
    const projects = DemoDataService.findAllProjects(userId);
    console.log('🎭 Found projects:', projects.length);
    
    // Add members count to each project
    const projectsWithCounts = projects.map(project => ({
      ...project,
      _count: {
        members: DemoDataService.findMembersByProject(project.id).length
      }
    }));
    
    res.json({ 
      data: projectsWithCounts,
      total: projects.length,
      success: true 
    });
  } catch (err) {
    console.error('Demo getProjects error:', err);
    res.status(500).json({ message: 'Failed to fetch projects', success: false });
  }
};

// Get project by ID
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🎭 Demo getProjectById - looking for project:', id);
    
    const allProjects = DemoDataService.getAllData().projects;
    console.log('🎭 All available projects:', allProjects.map(p => p.id));
    
    const project = DemoDataService.findProjectById(id);
    
    if (!project) {
      console.error('❌ Project not found:', id);
      return res.status(404).json({ message: 'Project not found', success: false });
    }
    
    console.log('✅ Found project:', project.name);
    
    // Add members with user info
    const members = DemoDataService.findMembersByProject(id).map(member => ({
      ...member,
      user: DemoDataService.findUserById(member.userId)
    }));
    
    res.json({ 
      data: {
        ...project,
        members
      },
      success: true 
    });
  } catch (err) {
    console.error('Demo getProjectById error:', err);
    res.status(500).json({ message: 'Failed to fetch project', success: false });
  }
};

// Get optimized project data
export const getProjectDataOptimized = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🎭 Demo getProjectDataOptimized - project id:', id);
    
    const project = DemoDataService.findProjectById(id);
    
    if (!project) {
      console.error('❌ Project not found in optimized fetch:', id);
      return res.status(404).json({ message: 'Project not found', success: false });
    }
    
    console.log('✅ Found project for optimized fetch:', project.name);
    
    // Get all related data
    const lists = DemoDataService.findListsByProject(id);
    const members = DemoDataService.findMembersByProject(id).map(member => ({
      ...member,
      user: DemoDataService.findUserById(member.userId)
    }));
    const labels = DemoDataService.findLabelsByProject(id);
    
    // Get tasks for each list - organize by list
    const tasksObj = {};
    lists.forEach(list => {
      const listTasks = DemoDataService.findTasksByList(list.id).map(task => {
        const subtasks = DemoDataService.findSubtasksByTask(task.id);
        console.log(`  📋 Task ${task.id}: "${task.name}" has ${subtasks.length} subtasks`);
        return {
          ...task,
          label: task.labelId ? DemoDataService.findLabelById(task.labelId) : null,
          subtasks: subtasks, // lowercase for frontend
          attachments: DemoDataService.findAttachmentsByTask(task.id)
        };
      });
      tasksObj[list.id] = listTasks;
      console.log(`  📝 List ${list.id} (${list.name}): ${listTasks.length} tasks`);
    });
    
    res.json({
      data: {
        project,
        lists,
        tasks: tasksObj,
        members,
        labels
      },
      success: true
    });
  } catch (err) {
    console.error('Demo getProjectDataOptimized error:', err);
    res.status(500).json({ message: 'Failed to fetch project data', success: false });
  }
};

// Create project
export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;
    
    const project = DemoDataService.createProject({
      name,
      description: description || '',
      ownerId: userId,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Add owner as member
    DemoDataService.createMember({
      userId,
      projectId: project.id,
      role: 'OWNER'
    });
    
    res.json({ data: project, success: true });
  } catch (err) {
    console.error('Demo createProject error:', err);
    res.status(500).json({ message: 'Failed to create project', success: false });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const updated = DemoDataService.updateProject(id, { name, description });
    if (!updated) {
      return res.status(404).json({ message: 'Project not found', success: false });
    }
    
    res.json({ data: updated, success: true });
  } catch (err) {
    console.error('Demo updateProject error:', err);
    res.status(500).json({ message: 'Failed to update project', success: false });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = DemoDataService.deleteProject(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Project not found', success: false });
    }
    
    res.json({ message: 'Project deleted', success: true });
  } catch (err) {
    console.error('Demo deleteProject error:', err);
    res.status(500).json({ message: 'Failed to delete project', success: false });
  }
};

// Get lists for project
export const getListsByProject = async (req, res) => {
  try {
    const { id } = req.params;
    const lists = DemoDataService.findListsByProject(id);
    
    res.json({ data: lists, success: true });
  } catch (err) {
    console.error('Demo getListsByProject error:', err);
    res.status(500).json({ message: 'Failed to fetch lists', success: false });
  }
};

// Create list
export const createList = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const lists = DemoDataService.findListsByProject(id);
    const order = lists.length;
    
    const list = DemoDataService.createList({
      name,
      projectId: id,
      order
    });
    
    res.json({ data: list, success: true });
  } catch (err) {
    console.error('Demo createList error:', err);
    res.status(500).json({ message: 'Failed to create list', success: false });
  }
};

// Update list
export const updateList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { name } = req.body;
    
    const updated = DemoDataService.updateList(listId, { name });
    if (!updated) {
      return res.status(404).json({ message: 'List not found', success: false });
    }
    
    res.json({ data: updated, success: true });
  } catch (err) {
    console.error('Demo updateList error:', err);
    res.status(500).json({ message: 'Failed to update list', success: false });
  }
};

// Get labels for project
export const getLabelsByProject = async (req, res) => {
  try {
    const { id } = req.params;
    const labels = DemoDataService.findLabelsByProject(id);
    
    res.json({ data: labels, success: true });
  } catch (err) {
    console.error('Demo getLabelsByProject error:', err);
    res.status(500).json({ message: 'Failed to fetch labels', success: false });
  }
};

// Create label
export const createLabel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    
    const label = DemoDataService.createLabel({
      name,
      color,
      projectId: id
    });
    
    res.json({ data: label, success: true });
  } catch (err) {
    console.error('Demo createLabel error:', err);
    res.status(500).json({ message: 'Failed to create label', success: false });
  }
};

// Update label
export const updateLabel = async (req, res) => {
  try {
    const { labelId } = req.params;
    const { name, color } = req.body;
    
    const updated = DemoDataService.updateLabel(labelId, { name, color });
    if (!updated) {
      return res.status(404).json({ message: 'Label not found', success: false });
    }
    
    res.json({ data: updated, success: true });
  } catch (err) {
    console.error('Demo updateLabel error:', err);
    res.status(500).json({ message: 'Failed to update label', success: false });
  }
};

// Delete label
export const deleteLabel = async (req, res) => {
  try {
    const { labelId } = req.params;
    
    const deleted = DemoDataService.deleteLabel(labelId);
    if (!deleted) {
      return res.status(404).json({ message: 'Label not found', success: false });
    }
    
    res.json({ message: 'Label deleted', success: true });
  } catch (err) {
    console.error('Demo deleteLabel error:', err);
    res.status(500).json({ message: 'Failed to delete label', success: false });
  }
};

// Get members
export const getMembersByProject = async (req, res) => {
  try {
    const { id } = req.params;
    const members = DemoDataService.findMembersByProject(id).map(member => ({
      ...member,
      user: DemoDataService.findUserById(member.userId)
    }));
    
    res.json({ data: members, success: true });
  } catch (err) {
    console.error('Demo getMembersByProject error:', err);
    res.status(500).json({ message: 'Failed to fetch members', success: false });
  }
};

// Upload project image (not supported in demo)
export const uploadProjectImage = async (req, res) => {
  res.status(403).json({ message: 'Image uploads not available in demo mode', success: false });
};

// Reorder lists
export const reorderLists = async (req, res) => {
  try {
    const { id } = req.params;
    const { listIds } = req.body;
    
    listIds.forEach((listId, index) => {
      DemoDataService.updateList(listId, { order: index });
    });
    
    const updatedLists = DemoDataService.findListsByProject(id);
    res.json({ data: updatedLists, success: true });
  } catch (err) {
    console.error('Demo reorderLists error:', err);
    res.status(500).json({ message: 'Failed to reorder lists', success: false });
  }
};

// Create invite link (not supported in demo)
export const createInviteLink = async (req, res) => {
  res.status(403).json({ message: 'Invitations not available in demo mode', success: false });
};

// Join project (not supported in demo)
export const joinProject = async (req, res) => {
  res.status(403).json({ message: 'Joining projects not available in demo mode', success: false });
};

// Remove member
export const removeMemberFromProject = async (req, res) => {
  res.status(403).json({ message: 'Member management not available in demo mode', success: false });
};

// Update member role
export const updateMemberRole = async (req, res) => {
  res.status(403).json({ message: 'Role management not available in demo mode', success: false });
};

export default {
  getProjects,
  getProjectById,
  getProjectDataOptimized,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectImage,
  getListsByProject,
  createList,
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
};

