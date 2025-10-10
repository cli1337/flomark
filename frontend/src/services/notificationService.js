import api from './api'

export const notificationService = {
  /**
   * Get all notifications for the current user
   */
  async getNotifications(limit = 50, skip = 0, unreadOnly = false) {
    try {
      const response = await api.get('/notifications', {
        params: { limit, skip, unreadOnly }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }
  },

  /**
   * Get total unread notification count
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count')
      return response.data
    } catch (error) {
      console.error('Error fetching unread count:', error)
      throw error
    }
  },

  /**
   * Get unread notification counts grouped by project
   */
  async getUnreadCountsByProject() {
    try {
      const response = await api.get('/notifications/unread-count-by-project')
      return response.data
    } catch (error) {
      console.error('Error fetching unread counts by project:', error)
      throw error
    }
  },

  /**
   * Mark a specific notification as read
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`)
      return response.data
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/mark-all-read')
      return response.data
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  },

  /**
   * Delete a specific notification
   */
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  },

  /**
   * Delete all notifications
   */
  async deleteAllNotifications() {
    try {
      const response = await api.delete('/notifications/delete-all')
      return response.data
    } catch (error) {
      console.error('Error deleting all notifications:', error)
      throw error
    }
  },

  /**
   * Create a test notification (development only)
   */
  async createTestNotification(data) {
    try {
      const response = await api.post('/notifications/test', data)
      return response.data
    } catch (error) {
      console.error('Error creating test notification:', error)
      throw error
    }
  }
}

