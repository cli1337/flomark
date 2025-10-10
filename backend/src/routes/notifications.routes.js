import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  getNotifications,
  getUnreadCount,
  getUnreadCountsByProject,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createTestNotification,
} from "../controllers/notifications.controller.js";

/**
 * Notifications Routes
 * Base path: /api/notifications
 * 
 * Handles user notifications with real-time Socket.IO integration
 * All routes require authentication
 */

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// ===== Query Operations =====
router.get("/", getNotifications);                 // Get all notifications (paginated) - supports ?limit=50&skip=0&unreadOnly=false
router.get("/unread-count", getUnreadCount);       // Get unread notification count
router.get("/unread-count-by-project", getUnreadCountsByProject); // Get unread notification counts by project

// ===== Bulk Operations =====
router.put("/mark-all-read", markAllAsRead);       // Mark all notifications as read
router.delete("/delete-all", deleteAllNotifications); // Delete all notifications

// ===== Single Notification Operations =====
router.put("/:id/read", markAsRead);               // Mark specific notification as read
router.delete("/:id", deleteNotification);         // Delete specific notification

// ===== Testing =====
router.post("/test", createTestNotification);      // Create test notification (development only)

export default router;

