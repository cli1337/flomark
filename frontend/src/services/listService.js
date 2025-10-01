import api from './api'

export const listService = {
  async getListsByProject(projectId) {
    const response = await api.get(`/projects/${projectId}/lists`)
    return response.data
  },

  async createList(projectId, name) {
    const response = await api.post(`/projects/${projectId}/lists`, { name })
    return response.data
  },

  async updateList(listId, data) {
    const response = await api.put(`/lists/${listId}`, data)
    return response.data
  },

  async deleteList(listId) {
    const response = await api.delete(`/lists/${listId}`)
    return response.data
  }
}
