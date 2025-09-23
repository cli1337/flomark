import { prisma } from "../config/database.js";

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
                userId: req.user.id
            }
        });
        if (projects.length >= 5) {
            return res.status(400).json({ message: "You can only have 5 projects", key: "max_projects", success: false });
        }

        if (name.length < 3 || name.length > 20) {
            return res.status(400).json({ message: "Name must be between 3 and 20 characters", key: "invalid_name", success: false });
        }

        const project = await prisma.project.create({
            data: { name, userId: req.user.id }
        });
        res.json({ data: project, success: true });
    } catch (err) {
        next(err);
    }
};