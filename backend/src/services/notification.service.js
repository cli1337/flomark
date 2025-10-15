import { prisma } from "../config/database.js";
import { SocketService } from "./socket.service.js";

/**
 * Notification Service - Handles creating, reading, and managing notifications
 */
export const notificationService = {
  /**
   * Create a notification
   * @param {Object} data - Notification data
   * @param {string} data.userId - User ID to send notification to
   * @param {string} data.type - Notification type
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification message
   * @param {Object} [data.data] - Additional data (optional)
   * @param {boolean} [sendRealtime=true] - Whether to send via socket
   * @returns {Promise<Object>} Created notification
   */
  async createNotification({ userId, type, title, message, data = null }, sendRealtime = true) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          data,
          isRead: false,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
      });

      // Send real-time notification via Socket.IO
      if (sendRealtime && SocketService.instance) {
        SocketService.instance.broadcastToUser(userId, "notification", notification);
      }

      return notification;
    } catch (error) {
      console.error("Failed to create notification:", error);
      throw error;
    }
  },

  /**
   * Create notifications for multiple users
   * @param {Array<string>} userIds - Array of user IDs
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Array>} Created notifications
   */
  async createBulkNotifications(userIds, notificationData) {
    try {
      const notifications = await Promise.all(
        userIds.map((userId) =>
          this.createNotification({
            userId,
            ...notificationData,
          })
        )
      );

      return notifications;
    } catch (error) {
      console.error("Failed to create bulk notifications:", error);
      throw error;
    }
  },

  /**
   * Get all notifications for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @param {number} [options.limit=50] - Limit number of results
   * @param {number} [options.skip=0] - Skip number of results
   * @param {boolean} [options.unreadOnly=false] - Only return unread notifications
   * @returns {Promise<Object>} Notifications and metadata
   */
  async getUserNotifications(userId, { limit = 50, skip = 0, unreadOnly = false } = {}) {
    try {
      const where = {
        userId,
        ...(unreadOnly && { isRead: false }),
      };

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip,
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({ where: { userId, isRead: false } }),
      ]);

      return {
        notifications,
        total,
        unreadCount,
        hasMore: skip + notifications.length < total,
      };
    } catch (error) {
      console.error("Failed to get user notifications:", error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId, // Ensure user owns this notification
        },
        data: {
          isRead: true,
        },
      });

      // Get unread count and broadcast to user
      const unreadCount = await this.getUnreadCount(userId);
      if (SocketService.instance) {
        SocketService.instance.broadcastToUser(userId, "notification-read", {
          notificationId,
          unreadCount,
        });
      }

      return notification;
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Update result
   */
  async markAllAsRead(userId) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      // Broadcast to user
      if (SocketService.instance) {
        SocketService.instance.broadcastToUser(userId, "notifications-all-read", {
          unreadCount: 0,
        });
      }

      return result;
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      throw error;
    }
  },

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<Object>} Deleted notification
   */
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId, // Ensure user owns this notification
        },
      });

      return notification;
    } catch (error) {
      console.error("Failed to delete notification:", error);
      throw error;
    }
  },

  /**
   * Delete all notifications for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteAllNotifications(userId) {
    try {
      const result = await prisma.notification.deleteMany({
        where: { userId },
      });

      return result;
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
      throw error;
    }
  },

  /**
   * Get unread notification count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userId) {
    try {
      return await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });
    } catch (error) {
      console.error("Failed to get unread count:", error);
      throw error;
    }
  },

  /**
   * Get unread notification counts grouped by project
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Object with projectId as keys and counts as values
   */
  async getUnreadCountsByProject(userId) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          isRead: false,
        },
        select: {
          data: true,
        },
      });

      // Group by projectId from the data field
      const countsByProject = {};
      notifications.forEach((notification) => {
        if (notification.data && notification.data.projectId) {
          const projectId = notification.data.projectId;
          countsByProject[projectId] = (countsByProject[projectId] || 0) + 1;
        }
      });

      return countsByProject;
    } catch (error) {
      console.error("Failed to get unread counts by project:", error);
      throw error;
    }
  },

  // ===== Helper methods for common notification types =====

  /**
   * Notify user when assigned to a task
   */
  async notifyTaskAssigned(userId, taskName, projectName, assignedBy, taskId, projectId) {
    return this.createNotification({
      userId,
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: `${assignedBy} assigned you to "${taskName}" in ${projectName}`,
      data: { taskId, projectId, assignedBy },
    });
  },

  /**
   * Notify user when a task is updated
   */
  async notifyTaskUpdated(userId, taskName, projectName, updatedBy, taskId, projectId) {
    return this.createNotification({
      userId,
      type: "TASK_UPDATED",
      title: "Task Updated",
      message: `${updatedBy} updated "${taskName}" in ${projectName}`,
      data: { taskId, projectId, updatedBy },
    });
  },

  /**
   * Notify user when a task is completed
   */
  async notifyTaskCompleted(userId, taskName, projectName, completedBy, taskId, projectId) {
    return this.createNotification({
      userId,
      type: "TASK_COMPLETED",
      title: "Task Completed",
      message: `${completedBy} completed "${taskName}" in ${projectName}`,
      data: { taskId, projectId, completedBy },
    });
  },

  /**
   * Notify user when a task is due soon
   */
  async notifyTaskDueSoon(userId, taskName, projectName, dueDate, taskId, projectId) {
    return this.createNotification({
      userId,
      type: "TASK_DUE_SOON",
      title: "Task Due Soon",
      message: `"${taskName}" in ${projectName} is due soon (${dueDate})`,
      data: { taskId, projectId, dueDate },
    });
  },

  /**
   * Notify user about project invitation
   */
  async notifyProjectInvitation(userId, projectName, invitedBy, projectId) {
    return this.createNotification({
      userId,
      type: "PROJECT_INVITATION",
      title: "Project Invitation",
      message: `${invitedBy} invited you to join "${projectName}"`,
      data: { projectId, invitedBy },
    });
  },

  /**
   * Notify project members when someone joins
   */
  async notifyMemberJoined(userIds, memberName, projectName, projectId) {
    return this.createBulkNotifications(userIds, {
      type: "MEMBER_JOINED",
      title: "New Member",
      message: `${memberName} joined "${projectName}"`,
      data: { projectId, memberName },
    });
  },

  /**
   * Notify project members when someone leaves
   */
  async notifyMemberLeft(userIds, memberName, projectName, projectId) {
    return this.createBulkNotifications(userIds, {
      type: "MEMBER_LEFT",
      title: "Member Left",
      message: `${memberName} left "${projectName}"`,
      data: { projectId, memberName },
    });
  },

  /**
   * Notify user when mentioned
   */
  async notifyMention(userId, mentionedBy, location, taskId, projectId) {
    return this.createNotification({
      userId,
      type: "MENTION",
      title: "You were mentioned",
      message: `${mentionedBy} mentioned you in ${location}`,
      data: { taskId, projectId, mentionedBy },
    });
  },
};

