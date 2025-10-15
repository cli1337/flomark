import { notificationService } from "../services/notification.service.js";

/**
 * Notifications Controller
 * Handles all notification-related operations
 * All endpoints require authentication
 */

/**
 * Get all notifications for the authenticated user (paginated)
 * GET /api/notifications?limit=50&skip=0&unreadOnly=false
 * 
 * Query: { limit, skip, unreadOnly }
 * Returns: { success: true, notifications[], total, unreadCount, hasMore }
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 50, skip = 0, unreadOnly = false } = req.query;

    const result = await notificationService.getUserNotifications(userId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      unreadOnly: unreadOnly === "true",
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count for authenticated user
 * GET /api/notifications/unread-count
 * 
 * Returns: { success: true, unreadCount }
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification counts grouped by project
 * GET /api/notifications/unread-count-by-project
 * 
 * Returns: { success: true, countsByProject: { projectId: count } }
 */
export const getUnreadCountsByProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const countsByProject = await notificationService.getUnreadCountsByProject(userId);

    res.json({
      success: true,
      countsByProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a specific notification as read
 * PUT /api/notifications/:id/read
 * 
 * Returns: { success: true, message }
 */
export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await notificationService.markAsRead(id, userId);

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read for authenticated user
 * PUT /api/notifications/mark-all-read
 * 
 * Returns: { success: true, message, count }
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: "All notifications marked as read",
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a specific notification
 * DELETE /api/notifications/:id
 * 
 * Returns: { success: true, message }
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await notificationService.deleteNotification(id, userId);

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all notifications for authenticated user
 * DELETE /api/notifications/delete-all
 * 
 * Returns: { success: true, message, count }
 */
export const deleteAllNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await notificationService.deleteAllNotifications(userId);

    res.json({
      success: true,
      message: "All notifications deleted",
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a test notification (for development/testing)
 * POST /api/notifications/test
 * 
 * Body: { type, title, message, data } (all optional)
 * Returns: { success: true, notification }
 */
export const createTestNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type = "GENERAL", title, message, data } = req.body;

    const notification = await notificationService.createNotification({
      userId,
      type,
      title: title || "Test Notification",
      message: message || "This is a test notification",
      data: data || null,
    });

    res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

