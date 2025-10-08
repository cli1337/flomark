import api from './api'

export const adminService = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/user/admin/users')
      return response.data
    } catch (error) {
      throw error
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/user/admin/users/${userId}`, userData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  promoteUser: async (userId) => {
    try {
      const response = await api.post(`/user/admin/users/${userId}/promote`)
      return response.data
    } catch (error) {
      throw error
    }
  },
}

