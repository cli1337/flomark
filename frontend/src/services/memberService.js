import api from './api'

const memberService = {
  async getProjectMembers(projectId) {
    try {
      const response = await api.get(`/projects/${projectId}/members`)
      return response.data
    } catch (error) {
      console.error('Error fetching project members:', error)
      throw error
    }
  },

  async addMemberToProject(projectId, userId) {
    try {
      const response = await api.post(`/projects/${projectId}/members`, { userId })
      return response.data
    } catch (error) {
      console.error('Error adding member to project:', error)
      throw error
    }
  },

  async removeMemberFromProject(projectId, userId) {
    try {
      const response = await api.delete(`/projects/${projectId}/members/${userId}`)
      return response.data
    } catch (error) {
      console.error('Error removing member from project:', error)
      throw error
    }
  },

  async searchUsers(query) {
    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`)
      return response.data
    } catch (error) {
      console.error('Error searching users:', error)
      throw error
    }
  }
}

export { memberService }
