import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { prisma } from "../config/database.js";
import { ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const checkProjectAccess = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({ 
        message: "Project ID is required", 
        key: "project_id_required", 
        success: false 
      });
    }

    if (!ObjectId.isValid(projectId)) {
      return res.status(400).json({ 
        message: "Invalid project ID", 
        key: "invalid_project_id", 
        success: false 
      });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: true
      }
    });

    if (!project) {
      return res.status(404).json({ 
        message: "Project not found", 
        key: "project_not_found", 
        success: false 
      });
    }

    const isMember = project.members.some(member => member.userId === req.user.id);
    
    if (!isMember) {
      return res.status(403).json({ 
        message: "You are not authorized to access this project's resources", 
        key: "unauthorized_project_access", 
        success: false 
      });
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

// Public endpoint for serving images (no auth required for now)
router.get("/photos/:projectId/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const { projectId } = req.params;
    
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ 
        message: "Invalid filename", 
        key: "invalid_filename", 
        success: false 
      });
    }

    const filePath = path.join(__dirname, "../../storage/photos", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        message: "Image not found", 
        key: "image_not_found", 
        success: false 
      });
    }

    const stats = fs.statSync(filePath);
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg'; // default
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Cache-Control", "public, max-age=31536000"); 

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error("Error serving image:", error);
    res.status(500).json({ 
      message: "Error serving image", 
      key: "image_serve_error", 
      success: false 
    });
  }
});

// Authenticated endpoint for serving images (with project access check)
router.get("/photos/:projectId/:filename/auth", authenticateToken, checkProjectAccess, (req, res) => {
  try {
    const { filename } = req.params;
    const { projectId } = req.params;
    
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ 
        message: "Invalid filename", 
        key: "invalid_filename", 
        success: false 
      });
    }

    const filePath = path.join(__dirname, "../../storage/photos", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        message: "Image not found", 
        key: "image_not_found", 
        success: false 
      });
    }

    const stats = fs.statSync(filePath);
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg'; // default
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Cache-Control", "public, max-age=31536000"); 

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error("Error serving image:", error);
    res.status(500).json({ 
      message: "Error serving image", 
      key: "image_serve_error", 
      success: false 
    });
  }
});

export default router;
