  import api from './api'

const labelService = {
  async getProjectLabels(projectId) {
    try {
      const response = await api.get(`/projects/${projectId}/labels`)
      return response.data
    } catch (error) {
      console.error('Error fetching project labels:', error)
      throw error
    }
  },

  async createLabel(projectId, labelData) {
    try {
      const response = await api.post(`/projects/${projectId}/labels`, labelData)
      return response.data
    } catch (error) {
      console.error('Error creating label:', error)
      throw error
    }
  },

  async updateLabel(labelId, labelData) {
    try {
      const response = await api.put(`/labels/${labelId}`, labelData)
      return response.data
    } catch (error) {
      console.error('Error updating label:', error)
      throw error
    }
  },

  async deleteLabel(labelId) {
    try {
      const response = await api.delete(`/labels/${labelId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting label:', error)
      throw error
    }
  }
}

export { labelService }
