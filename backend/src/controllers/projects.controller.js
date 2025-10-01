import { prisma } from "../config/database.js";
import { ObjectId } from "mongodb";
import fs from "fs";
import crypto from "crypto";
import { ENV } from "../config/env.js";

export const getProjects = async (req, res, next) => {
    try {

        const projects = await prisma.project.findMany({
            where: {
                members: {
                    some: {
                        userId: req.user.id
                    }
                }
            }
        });
        res.json({ data: projects, success: true });
    } catch (err) {
        next(err);
    }
};

export const getProjectById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Project ID is required", key: "project_id_required", success: false });
        }
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid project ID", key: "invalid_project_id", success: false });
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

        if (project.members.some(member => member.userId !== req.user.id)) {
            return res.status(403).json({ message: "You are not authorized to update this project", key: "unauthorized", success: false });
        }
        res.json({ data: project, success: true });
    } catch (err) {
        next(err);
    }
};

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

        const project = await prisma.project.create({
            data: { 
                name,
                members: {
                    create: {
                        userId: req.user.id,
                        role: 'OWNER'
                    }
                }
            }
        });
        
        res.json({ data: project, success: true });
    } catch (err) {
        next(err);
    }
};

export const uploadProjectImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "File is required", key: "file_required", success: false });
        }
        
        if (!ObjectId.isValid(req.params.id)) {
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

export const createList = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Name is required", key: "name_required", success: false });
        }
        const list = await prisma.list.create({
            data: { name, projectId: id }
        });
        res.json({ data: list, success: true });
    } catch (err) {
        next(err);
    }
};

export const getListsByProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const lists = await prisma.list.findMany({ where: { projectId: id } });
        if (!lists) {
            return res.status(404).json({ message: "Lists not found", key: "lists_not_found", success: false });
        }
        if (lists.some(list => list.projectId !== id)) {
            return res.status(403).json({ message: "You are not authorized to get this list", key: "unauthorized", success: false });
        }
        res.json({ data: lists, success: true });
    } catch (err) {
        next(err);
    }
};