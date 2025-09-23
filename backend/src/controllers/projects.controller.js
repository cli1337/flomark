import { prisma } from "../config/database.js";

export const getProjects = async (req, res, next) => {
    try {
        console.log("Prisma in controller:", !!prisma);
        console.log("Prisma project property:", !!prisma?.project);
        
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
        console.error("Error in getProjects:", err);
        next(err);
    }
};