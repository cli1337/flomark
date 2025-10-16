import { prisma } from "../config/database.js";
import fs from "fs";
import crypto from "crypto";
import { SocketService } from "../services/socket.service.js";
import { ActivityService } from "../services/activity.service.js";
import { isValidId } from "../utils/id-validator.js";
import { safeUserSelect, sanitizeProject, sanitizeProjects, sanitizeMembers } from "../utils/user-sanitizer.js";

/**
 * Projects Controller
 * Handles project management, lists, labels, members, and invitations
 * All endpoints require authentication unless specified
 */

// In-memory cache for invite links (consider using Redis in production)
const cache = new Map();

/**
 * Broadcast project updates to all connected clients in real-time
 * @param {string} projectId - Project ID
 * @param {string} type - Update type (e.g., 'project-created', 'list-created')
 * @param {object} payload - Update payload
 * @param {string} userId - User who made the change
 * @param {string} userName - Name of user who made the change
 */
const broadcastProjectUpdate = (projectId, type, payload, userId, userName) => {
  if (SocketService.instance) {

    SocketService.instance.broadcastToProject(projectId, "project-updated", {
      projectId,
      type,
      payload,
      userId,
      userName,
      timestamp: new Date().toISOString()
    });
    

    const importantTypes = ['project-created', 'project-updated', 'project-deleted', 'project-image-updated', 'member-joined', 'member-removed'];
    if (importantTypes.includes(type)) {
      SocketService.instance.broadcastToAll("project-updated", {
        projectId,
        type,
        payload,
        userId,
        userName,
        timestamp: new Date().toISOString()
      });
    }
  }
};

/**
 * Get all projects for authenticated user (paginated)
 * GET /api/projects?page=1&limit=5
 * 
 * Query: { page, limit }
 * Returns: { data: projects[], success: true, total, page, limit, totalPages }
 */
export const getProjects = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const total = await prisma.project.count({
            where: {
                members: {
                    some: {
                        userId: req.user.id
                    }
                }
            }
        });

        const projects = await prisma.project.findMany({
            where: {
                members: {
                    some: {
                        userId: req.user.id
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: safeUserSelect
                        }
                    }
                },
                boards: {
                    include: {
                        lists: {
                            include: {
                                tasks: true
                            }
                        }
                    }
                }
            },
            skip: skip,
            take: limit,
            orderBy: {
                updatedAt: 'desc'
            }
        });
        
        res.json({ 
            data: projects, 
            success: true,
            total: total,
            page: page,
            limit: limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get project by ID with members
 * GET /api/projects/:id
 * 
 * Returns: { data: project, success: true }
 */
export const getProjectById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Project ID is required", key: "project_id_required", success: false });
        }
        
        if (!isValidId(id)) {
            return res.status(400).json({ message: "Invalid project ID", key: "invalid_project_id", success: false });
        }

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: safeUserSelect
                        }
                    }
                }
            }
        });
        
        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }

        const isMember = project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to access this project", key: "unauthorized", success: false });
        }
        res.json({ data: project, success: true });
    } catch (err) {
        next(err);
    }
};

/**
 * Create a new project
 * POST /api/projects
 * 
 * Body: { name }
 * Returns: { data: project, success: true }
 * Note: Creator is automatically added as OWNER
 */
export const createProject = async (req, res, next) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: "Body is required", key: "body_required", success: false });
          }

        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Name is required", key: "name_required", success: false });
        }

        const projects = await prisma.project.findMany({
            where: {
                members: {
                    some: {
                        userId: req.user.id
                    }
                }
            }
        });

        if (name.length < 3 || name.length > 20) {
            return res.status(400).json({ message: "Name must be between 3 and 20 characters", key: "invalid_name", success: false });
        }

        // Determine labels format based on database type
        const dbUrl = process.env.DATABASE_URL || '';
        const isSQLite = dbUrl.startsWith('file:') || dbUrl.startsWith('sqlite:');
        const defaultLabels = isSQLite ? '[]' : [];

        const project = await prisma.project.create({
            data: { 
                name,
                labels: defaultLabels,
                members: {
                    create: {
                        userId: req.user.id,
                        role: 'OWNER'
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: true
                    }
                }
            }
        });
        

        broadcastProjectUpdate(project.id, "project-created", {
            project: project
        }, req.user.id, req.user.name);
        
        res.json({ data: project, success: true });
    } catch (err) {
        next(err);
    }
};

export const updateProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Project ID is required", key: "project_id_required", success: false });
        }

        if (!isValidId(id)) {
            return res.status(400).json({ message: "Invalid project ID", key: "invalid_project_id", success: false });
        }

        if (!name) {
            return res.status(400).json({ message: "Name is required", key: "name_required", success: false });
        }

        if (name.length < 3 || name.length > 20) {
            return res.status(400).json({ message: "Name must be between 3 and 20 characters", key: "invalid_name", success: false });
        }

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                members: true
            }
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }

        const isMember = project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to update this project", key: "unauthorized", success: false });
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: { name },
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                lists: {
                    include: {
                        tasks: true
                    }
                }
            }
        });


        broadcastProjectUpdate(id, "project-updated", {
            project: updatedProject,
            changes: { name: name }
        }, req.user.id, req.user.name);

        res.json({ 
            data: updatedProject, 
            success: true,
            message: "Project updated successfully"
        });
    } catch (err) {
        next(err);
    }
};

export const uploadProjectImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "File is required", key: "file_required", success: false });
        }
        
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid project ID", key: "invalid_project_id", success: false });
        }

        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: {
                members: true
            }
        });
        
        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }
        
        const isMember = project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to update this project", key: "unauthorized", success: false });
        }

        const imageId = crypto.randomBytes(16).toString('hex');
        const fileExtension = req.file.originalname.split('.').pop();
        const imagePath = `${imageId}.${fileExtension}`;

        const targetPath = `./storage/photos/${imagePath}`;
        fs.renameSync(req.file.path, targetPath);

        const updatedProject = await prisma.project.update({
            where: { id: req.params.id },
            data: { imageHash: imagePath }
        });

        if (!updatedProject) {
            return res.status(400).json({ message: "Failed to update project image", key: "failed_to_update_project_image", success: false });
        }


        broadcastProjectUpdate(req.params.id, "project-image-updated", {
            project: updatedProject,
            imageHash: imagePath
        }, req.user.id, req.user.name);
        
        res.json({ 
            data: updatedProject, 
            success: true,
            message: "Project image updated successfully"
        });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(err);
    }
};

/**
 * Create a list within a project
 * POST /api/projects/:id/lists
 * 
 * Body: { name, color }
 * Returns: { data: list, success: true }
 */
export const createList = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, color, boardId } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: "Name is required", key: "name_required", success: false });
        }
        
        if (name.length < 2 || name.length > 25) {
            return res.status(400).json({ message: "List name must be between 2 and 25 characters", key: "invalid_name", success: false });
        }

        if (!isValidId(id)) {
            return res.status(400).json({ message: "Invalid project ID", key: "invalid_project_id", success: false });
        }

        const project = await prisma.project.findUnique({
            where: { id },
            include: { members: true }
        });
        
        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }
        
        const isMember = project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to create lists in this project", key: "unauthorized", success: false });
        }

        const lastList = await prisma.list.findFirst({
            where: { 
                boardId: boardId || null,
                projectId: boardId ? null : id
            },
            orderBy: { order: 'desc' }
        });
        
        const nextOrder = lastList ? lastList.order + 1 : 0;

        const list = await prisma.list.create({
            data: { 
                name, 
                projectId: boardId ? null : id,
                boardId: boardId || null,
                color: color || "#3b82f6",
                order: nextOrder
            }
        });

        // Log activity
        await ActivityService.logActivity(
            id,
            req.user.id,
            'LIST_CREATED',
            'list',
            list.id,
            { listName: list.name, boardId: boardId || null }
        );

        broadcastProjectUpdate(id, "list-created", {
            list: list
        }, req.user.id, req.user.name);

        res.json({ data: list, success: true });
    } catch (err) {
        next(err);
    }
};

export const getListsByProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!isValidId(id)) {
            return res.status(400).json({ message: "Invalid project ID", key: "invalid_project_id", success: false });
        }

        const project = await prisma.project.findUnique({
            where: { id },
            include: { members: true }
        });
        
        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }
        
        const isMember = project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to access this project", key: "unauthorized", success: false });
        }

        // Get lists that belong directly to project (no board) - for backward compatibility
        const lists = await prisma.list.findMany({ 
            where: { 
                projectId: id,
                boardId: null
            },
            orderBy: { order: 'asc' }
        });
        
        res.json({ data: lists, success: true });
    } catch (err) {
        next(err);
    }
};

/**
 * Create an invite link for a project (Owner only)
 * POST /api/projects/:id/invite
 * 
 * Body: { email } (optional - restrict invite to specific email)
 * Returns: { data: inviteLink, success: true }
 */
export const createInviteLink = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Project ID is required", key: "project_id_required", success: false });
        }
        if (!isValidId(id)) {
            return res.status(400).json({ message: "Invalid project ID", key: "invalid_project_id", success: false });
        }
        const project = await prisma.project.findUnique({ 
            where: { id },
            include: { members: true }
        });
        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }
        if (!project.members.some(member => member.userId === req.user.id && member.role === "OWNER")) {
            return res.status(403).json({ message: "You are not authorized to create invite for this project", key: "unauthorized", success: false });
        }

        const inviteLink = crypto.randomBytes(16).toString('hex');
        res.json({ data: inviteLink, success: true });
        cache.set(inviteLink, {
            projectId: req.params.id,
            email: req.body.email || null
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Join a project using an invite link
 * POST /api/projects/join/:inviteLink
 * 
 * Returns: { data: { member, project }, success: true }
 */
export const joinProject = async (req, res, next) => {
    try {
        const { inviteLink } = req.params;
        const invite = cache.get(inviteLink);
        if (!invite) {
            return res.status(404).json({ message: "Invite link not found", key: "invite_link_not_found", success: false });
        }
        const project = await prisma.project.findUnique({ 
            where: { id: invite.projectId },
            include: { members: true }
        });
        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }

        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "User not authenticated", key: "user_not_authenticated", success: false });
        }

        if (invite.email && user.email !== invite.email) {
            return res.status(403).json({ 
                message: "This invite is only valid for the email address it was sent to", 
                key: "email_mismatch", 
                success: false 
            });
        }

        const existingMember = await prisma.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: user.id,
                    projectId: project.id
                }
            },
            include: {
                user: true
            }
        });

        if (existingMember) {
            const updatedProject = await prisma.project.findUnique({
                where: { id: project.id },
                include: {
                    members: {
                        include: {
                            user: true
                        }
                    }
                }
            });
            
            res.json({ 
                data: { member: existingMember, project: updatedProject }, 
                success: true,
                message: "User is already a member of this project"
            });
            cache.delete(inviteLink);
            return;
        }
        
        let member;
        try {
            member = await prisma.projectMember.create({
                data: { projectId: project.id, userId: user.id, role: "MEMBER" },
                include: {
                    user: true
                }
            });
            
            // Log activity
            await ActivityService.logActivity(
                project.id,
                user.id,
                'MEMBER_ADDED',
                'member',
                member.id,
                { memberName: user.name }
            );
        } catch (createError) {
            if (createError.code === 'P2002' && createError.meta?.target?.includes('userId_projectId')) {
                const existingMember = await prisma.projectMember.findUnique({
                    where: {
                        userId_projectId: {
                            userId: user.id,
                            projectId: project.id
                        }
                    },
                    include: {
                        user: true
                    }
                });
                
                if (existingMember) {
                    const updatedProject = await prisma.project.findUnique({
                        where: { id: project.id },
                        include: {
                            members: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    });
                    
                    res.json({ 
                        data: { member: existingMember, project: updatedProject }, 
                        success: true,
                        message: "User is already a member of this project"
                    });
                    cache.delete(inviteLink);
                    return;
                }
            }
            throw createError;
        }
        
        const updatedProject = await prisma.project.findUnique({
            where: { id: project.id },
            include: {
                members: {
                    include: {
                        user: true
                    }
                }
            }
        });
        

        broadcastProjectUpdate(project.id, "member-joined", {
            member: member,
            project: updatedProject
        }, user.id, user.name);

        res.json({ data: { member, project: updatedProject }, success: true });
        cache.delete(inviteLink);
    } catch (err) {
        next(err);
    }
};

export const getMembersByProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!isValidId(id)) {
            return res.status(400).json({ message: "Invalid project ID", key: "invalid_project_id", success: false });
        }

        const project = await prisma.project.findUnique({
            where: { id },
            include: { members: true }
        });
        
        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }
        
        const isMember = project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to access this project", key: "unauthorized", success: false });
        }

        const members = await prisma.projectMember.findMany({ 
            where: { projectId: id },
            include: {
                user: {
                    select: safeUserSelect
                }
            }
        });
        
        res.json({ data: members, success: true });
    } catch (err) {
        next(err);
    }
};

/**
 * Remove a member from a project
 * DELETE /api/projects/:id/members/:memberId
 * 
 * Returns: { data: member, success: true }
 * Note: Cannot remove project owner
 */
export const removeMemberFromProject = async (req, res, next) => {
    try {
        const { id, memberId } = req.params;
        if (!memberId) {
            return res.status(400).json({ message: "Member ID is required", key: "member_id_required", success: false });
        }
        if (!id) {
            return res.status(400).json({ message: "Project ID is required", key: "project_id_required", success: false });
        }
        if (!isValidId(id)) {
            return res.status(400).json({ message: "Invalid project ID", key: "invalid_project_id", success: false });
        }
        if (!isValidId(memberId)) {
            return res.status(400).json({ message: "Invalid member ID", key: "invalid_member_id", success: false });
        }
        const member = await prisma.projectMember.delete({
            where: { id: memberId }
        });
        if (member.projectId !== id) {
            return res.status(403).json({ message: "You are not authorized to remove this member", key: "unauthorized", success: false });
        }

        if (member.role === "OWNER") {
            return res.status(403).json({ message: "You are not authorized to remove the owner", key: "unauthorized", success: false });
        }

        // Log activity
        await ActivityService.logActivity(
            id,
            req.user.id,
            'MEMBER_REMOVED',
            'member',
            member.id,
            { memberId: member.userId }
        );

        broadcastProjectUpdate(id, "member-removed", {
            member: member
        }, req.user.id, req.user.name);

        res.json({ data: member, success: true });
    } catch (err) {
        next(err);
    }
};

export const updateMemberRole = async (req, res, next) => {
    try {
        const { id, memberId } = req.params;
        const { role } = req.body;
        
        if (!memberId) {
            return res.status(400).json({ message: "Member ID is required", key: "member_id_required", success: false });
        }
        if (!id) {
            return res.status(400).json({ message: "Project ID is required", key: "project_id_required", success: false });
        }
        if (!isValidId(id)) {
            return res.status(400).json({ message: "Invalid project ID", key: "invalid_project_id", success: false });
        }
        if (!isValidId(memberId)) {
            return res.status(400).json({ message: "Invalid member ID", key: "invalid_member_id", success: false });
        }
        if (!role || !['ADMIN', 'MEMBER'].includes(role)) {
            return res.status(400).json({ message: "Valid role is required. Cannot promote to OWNER.", key: "invalid_role", success: false });
        }

        const project = await prisma.project.findUnique({
            where: { id },
            include: { members: true }
        });
        
        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }

        const currentUserMember = project.members.find(member => member.userId === req.user.id);
        const isOwner = currentUserMember?.role === 'OWNER';
        const isAdmin = currentUserMember?.role === 'ADMIN';
        
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "You are not authorized to update member roles", key: "unauthorized", success: false });
        }

        const memberToUpdate = await prisma.projectMember.findUnique({
            where: { id: memberId }
        });

        if (!memberToUpdate) {
            return res.status(404).json({ message: "Member not found", key: "member_not_found", success: false });
        }

        if (memberToUpdate.projectId !== id) {
            return res.status(403).json({ message: "You are not authorized to update this member", key: "unauthorized", success: false });
        }

        if (memberToUpdate.role === "OWNER") {
            return res.status(403).json({ message: "You are not authorized to update the owner", key: "unauthorized", success: false });
        }

        if (role === 'ADMIN' && !isOwner) {
            return res.status(403).json({ message: "Only project owners can promote members to admin", key: "unauthorized", success: false });
        }

        const member = await prisma.projectMember.update({
            where: { id: memberId },
            data: { role },
            include: {
                user: true
            }
        });


        broadcastProjectUpdate(id, "member-role-updated", {
            member: member
        }, req.user.id, req.user.name);

        res.json({ data: member, success: true });
    } catch (err) {
        next(err);
    }
};

export const getMemberById = async (req, res, next) => {
    try {
        const { id, memberId } = req.params;
        const member = await prisma.projectMember.findUnique({ where: { id: memberId } });
        if (member.projectId !== id) {
            return res.status(403).json({ message: "You are not authorized to get this member", key: "unauthorized", success: false });
        }
        res.json({ data: member, success: true });
    } catch (err) {
        next(err);
    }
};

export const getLabelsByProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const project = await prisma.project.findUnique({
            where: { id },
            include: { members: true }
        });
        
        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }
        
        const isMember = project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to access this project", key: "unauthorized", success: false });
        }
        
        // Parse labels based on database type
        let labelsArray = project.labels || [];
        if (typeof labelsArray === 'string') {
            try {
                labelsArray = JSON.parse(labelsArray);
            } catch (e) {
                labelsArray = [];
            }
        }
        
        const labels = labelsArray.map((label, index) => ({
            id: label.id || `label-${index}`,
            name: label.name || 'Unnamed Label',
            color: label.color || '#3b82f6'
        }));
        res.json({ data: labels, success: true });
    } catch (err) {
        console.error('getLabelsByProject error:', err);
        next(err);
    }
};

/**
 * Create a label for a project
 * POST /api/projects/:id/labels
 * 
 * Body: { name, color }
 * Returns: { data: label, success: true }
 */
export const createLabel = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, color } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: "Label name is required", key: "name_required", success: false });
        }
        
        if (!color) {
            return res.status(400).json({ message: "Label color is required", key: "color_required", success: false });
        }
        
        const project = await prisma.project.findUnique({
            where: { id },
            include: { members: true }
        });
        
        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }
        
        const isMember = project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to access this project", key: "unauthorized", success: false });
        }
        
        // Parse existing labels
        let existingLabels = project.labels || [];
        if (typeof existingLabels === 'string') {
            try {
                existingLabels = JSON.parse(existingLabels);
            } catch (e) {
                existingLabels = [];
            }
        }
        
        const labelExists = existingLabels.some(label => 
            (typeof label === 'string' ? label : label.name) === name
        );
        
        if (labelExists) {
            return res.status(400).json({ message: "Label already exists", key: "label_exists", success: false });
        }
        
        const newLabel = {
            id: `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            color
        };
        
        const updatedLabels = [...existingLabels, newLabel];
        
        // Determine labels format based on database type
        const dbUrl = process.env.DATABASE_URL || '';
        const isSQLite = dbUrl.startsWith('file:') || dbUrl.startsWith('sqlite:');
        const labelsToSave = isSQLite ? JSON.stringify(updatedLabels) : updatedLabels;
        
        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                labels: labelsToSave
            }
        });


        broadcastProjectUpdate(id, "label-created", {
            label: newLabel
        }, req.user.id, req.user.name);
        
        res.json({ data: newLabel, success: true });
    } catch (err) {
        console.error('createLabel error:', err);
        next(err);
    }
};

export const updateLabel = async (req, res, next) => {
    try {
        const { labelId } = req.params;
        const { name, color } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: "Label name is required", key: "name_required", success: false });
        }
        
        if (!color) {
            return res.status(400).json({ message: "Label color is required", key: "color_required", success: false });
        }
        
        const allProjects = await prisma.project.findMany({
            include: { members: true }
        });
        
        const project = allProjects.find(p => 
            p.labels && p.labels.some(label => label.id === labelId)
        );
        
        if (!project) {
            return res.status(404).json({ message: "Label not found", key: "label_not_found", success: false });
        }
        const isMember = project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to update this label", key: "unauthorized", success: false });
        }
        
        const existingLabels = project.labels || [];
        const updatedLabels = existingLabels.map(label => {
            if (label.id === labelId) {
                return { ...label, name, color };
            }
            return label;
        });
        
        const updatedProject = await prisma.project.update({
            where: { id: project.id },
            data: {
                labels: updatedLabels
            }
        });
        
        const tasks = await prisma.task.findMany({
            where: {
                list: {
                    projectId: project.id
                }
            }
        });

        for (const task of tasks) {
            if (task.labels && Array.isArray(task.labels)) {
                const taskLabels = task.labels.map(label => {
                    if (label.id === labelId) {
                        return { ...label, name, color };
                    }
                    return label;
                });
                
                await prisma.task.update({
                    where: { id: task.id },
                    data: { labels: taskLabels }
                });
            }
        }
        
        const updatedLabel = updatedLabels.find(label => label.id === labelId);


        broadcastProjectUpdate(project.id, "label-updated", {
            label: updatedLabel
        }, req.user.id, req.user.name);

        res.json({ data: updatedLabel, success: true });
    } catch (err) {
        console.error('updateLabel error:', err);
        next(err);
    }
};

export const deleteLabel = async (req, res, next) => {
    try {
        const { labelId } = req.params;
        
        const allProjects = await prisma.project.findMany({
            include: { members: true }
        });
        
        const project = allProjects.find(p => 
            p.labels && p.labels.some(label => label.id === labelId)
        );
        
        if (!project) {
            return res.status(404).json({ message: "Label not found", key: "label_not_found", success: false });
        }
        const isMember = project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to delete this label", key: "unauthorized", success: false });
        }
        
        const existingLabels = project.labels || [];
        const updatedLabels = existingLabels.filter(label => label.id !== labelId);
        
        const updatedProject = await prisma.project.update({
            where: { id: project.id },
            data: {
                labels: updatedLabels
            }
        });


        broadcastProjectUpdate(project.id, "label-deleted", {
            labelId: labelId
        }, req.user.id, req.user.name);
        
        res.json({ data: { id: labelId }, success: true });
    } catch (err) {
        console.error('deleteLabel error:', err);
        next(err);
    }
};

export const updateList = async (req, res, next) => {
    try {
        const { listId } = req.params;
        const { name, color, order } = req.body;
        
        if (!listId) {
            return res.status(400).json({ message: "List ID is required", key: "list_id_required", success: false });
        }
        
        if (!isValidId(listId)) {
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
            return res.status(403).json({ message: "You are not authorized to update this list", key: "unauthorized", success: false });
        }
        
        const updateData = {};
        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ message: "List name is required", key: "name_required", success: false });
            }
            if (name.trim().length > 25) {
                return res.status(400).json({ message: "List name must be 25 characters or less", key: "name_too_long", success: false });
            }
            updateData.name = name.trim();
        }
        if (color !== undefined) {
            updateData.color = color;
        }
        if (order !== undefined) {
            updateData.order = order;
        }
        
        const updatedList = await prisma.list.update({
            where: { id: listId },
            data: updateData
        });

        // Log activity
        const changes = {};
        if (name !== undefined) changes.name = name;
        if (color !== undefined) changes.color = color;
        if (order !== undefined) changes.order = order;
        
        await ActivityService.logActivity(
            list.project.id,
            req.user.id,
            'LIST_UPDATED',
            'list',
            listId,
            { listName: updatedList.name, changes }
        );

        broadcastProjectUpdate(list.project.id, "list-updated", {
            list: updatedList
        }, req.user.id, req.user.name);
        
        res.json({ data: updatedList, success: true });
    } catch (err) {
        console.error('updateList error:', err);
        next(err);
    }
};

export const reorderLists = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { listIds } = req.body;
        
        if (!id) {
            return res.status(400).json({ message: "Project ID is required", key: "project_id_required", success: false });
        }
        
        if (!isValidId(id)) {
            return res.status(400).json({ message: "Invalid project ID", key: "invalid_project_id", success: false });
        }
        
        if (!listIds || !Array.isArray(listIds)) {
            return res.status(400).json({ message: "List IDs array is required", key: "list_ids_required", success: false });
        }
        
        const project = await prisma.project.findUnique({
            where: { id },
            include: { members: true }
        });
        
        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }
        
        const isMember = project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to reorder lists in this project", key: "unauthorized", success: false });
        }
        
        const updatePromises = listIds.map((listId, index) => {
            return prisma.list.update({
                where: { id: listId },
                data: { order: index }
            });
        });
        
        await Promise.all(updatePromises);
        
        const updatedLists = await prisma.list.findMany({
            where: { 
                projectId: id,
                boardId: null
            },
            orderBy: { order: 'asc' }
        });

        // Log activity
        await ActivityService.logActivity(
            id,
            req.user.id,
            'LIST_MOVED',
            'list',
            null,
            { listIds, action: 'reorder' }
        );

        broadcastProjectUpdate(id, "lists-reordered", {
            lists: updatedLists
        }, req.user.id, req.user.name);
        
        res.json({ data: updatedLists, success: true });
    } catch (err) {
        console.error('reorderLists error:', err);
        next(err);
    }
};

export const deleteProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "Project ID is required", key: "project_id_required", success: false });
        }
        
        if (!isValidId(id)) {
            return res.status(400).json({ message: "Invalid project ID", key: "invalid_project_id", success: false });
        }
        
        const project = await prisma.project.findUnique({
            where: { id },
            include: { members: true }
        });
        
        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }
        
        const isOwner = project.members.some(member => 
            member.userId === req.user.id && member.role === 'OWNER'
        );
        
        if (!isOwner) {
            return res.status(403).json({ message: "Only project owners can delete projects", key: "unauthorized", success: false });
        }
        

        await prisma.project.delete({
            where: { id }
        });
        

        broadcastProjectUpdate(id, "project-deleted", {
            projectId: id,
            projectName: project.name
        }, req.user.id, req.user.name);
        
        res.json({ 
            message: "Project deleted successfully", 
            success: true 
        });
    } catch (err) {
        console.error('deleteProject error:', err);
        next(err);
    }
};

/**
 * Get complete project data (project, lists, tasks, members) - Optimized
 * GET /api/projects/:id/data
 * 
 * Returns: { data: { project, lists, tasks, members }, success: true }
 * Note: This is an optimized endpoint that fetches all project data in minimal queries
 */
export const getProjectDataOptimized = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "Project ID is required", key: "project_id_required", success: false });
        }
        
        if (!isValidId(id)) {
            return res.status(400).json({ message: "Invalid project ID", key: "invalid_project_id", success: false });
        }

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: safeUserSelect
                        }
                    }
                }
            }
        });
        
        if (!project) {
            return res.status(404).json({ message: "Project not found", key: "project_not_found", success: false });
        }
        
        const isMember = project.members.some(member => member.userId === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "You are not authorized to access this project", key: "unauthorized", success: false });
        }

        const lists = await prisma.list.findMany({
            where: { projectId: id },
            orderBy: { order: 'asc' }
        });

        const allTasks = await prisma.task.findMany({
            where: {
                listId: {
                    in: lists.map(list => list.id)
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: safeUserSelect
                        }
                    }
                },
                subTasks: true,
                attachments: true
            },
            orderBy: { createdAt: 'asc' }
        });

        const tasksByList = {};
        lists.forEach(list => {
            tasksByList[list.id] = allTasks.filter(task => task.listId === list.id);
        });
        
        // Parse labels from string to array for all tasks
        Object.keys(tasksByList).forEach(listId => {
            tasksByList[listId] = tasksByList[listId].map(task => {
                let labelsArray = task.labels || [];
                if (typeof labelsArray === 'string') {
                    try {
                        labelsArray = JSON.parse(labelsArray);
                    } catch (e) {
                        labelsArray = [];
                    }
                }
                return {
                    ...task,
                    labels: labelsArray
                };
            });
        });
        
        // Parse project labels from string to array
        let projectLabels = project.labels || [];
        if (typeof projectLabels === 'string') {
            try {
                projectLabels = JSON.parse(projectLabels);
            } catch (e) {
                projectLabels = [];
            }
        }
        
        res.json({ 
            data: {
                project: {
                    ...project,
                    labels: projectLabels
                },
                lists,
                tasks: tasksByList,
                members: project.members
            },
            success: true 
        });
    } catch (err) {
        console.error('getProjectDataOptimized error:', err);
        next(err);
    }
};