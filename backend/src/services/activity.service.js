import { prisma } from "../config/database.js";

/**
 * Activity Logging Service
 * Handles logging of all user activities in projects
 */

export class ActivityService {
  /**
   * Log an activity
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID who performed the action
   * @param {string} action - Activity type (from ActivityType enum)
   * @param {string} entityType - Type of entity (e.g., 'task', 'list', 'board')
   * @param {string} entityId - ID of the entity
   * @param {object} details - Additional details as object (will be JSON stringified)
   */
  static async logActivity(projectId, userId, action, entityType, entityId = null, details = null) {
    try {
      const detailsString = details ? JSON.stringify(details) : null;
      
      const activity = await prisma.activityLog.create({
        data: {
          projectId,
          userId,
          action,
          entityType,
          entityId,
          details: detailsString
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true
            }
          }
        }
      });
      
      return activity;
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw - activity logging shouldn't break the main operation
      return null;
    }
  }

  /**
   * Get activity logs for a project (paginated)
   * @param {string} projectId - Project ID
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 50)
   */
  static async getProjectActivities(projectId, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const [activities, total] = await Promise.all([
        prisma.activityLog.findMany({
          where: { projectId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.activityLog.count({
          where: { projectId }
        })
      ]);
      
      // Parse details from JSON strings
      const activitiesWithParsedDetails = activities.map(activity => ({
        ...activity,
        details: activity.details ? JSON.parse(activity.details) : null
      }));
      
      return {
        activities: activitiesWithParsedDetails,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Failed to get activities:', error);
      throw error;
    }
  }

  /**
   * Get recent activities for a project (last 20)
   * @param {string} projectId - Project ID
   */
  static async getRecentActivities(projectId) {
    try {
      const activities = await prisma.activityLog.findMany({
        where: { projectId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      
      // Parse details from JSON strings
      return activities.map(activity => ({
        ...activity,
        details: activity.details ? JSON.parse(activity.details) : null
      }));
    } catch (error) {
      console.error('Failed to get recent activities:', error);
      throw error;
    }
  }

  /**
   * Delete old activity logs (older than specified days)
   * @param {number} daysToKeep - Number of days to keep logs (default: 90)
   */
  static async cleanupOldActivities(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const result = await prisma.activityLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });
      
      return result.count;
    } catch (error) {
      console.error('Failed to cleanup activities:', error);
      throw error;
    }
  }
}

