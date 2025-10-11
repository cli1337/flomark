import api from './api'

export const listService = {
  async getListsByProject(projectId) {
    const response = await api.get(`/projects/${projectId}/lists`)
    return response.data
  },

  async createList(projectId, name, color = '#3b82f6') {
    const response = await api.post(`/projects/${projectId}/list`, { name, color })
    return response.data
  },

  async updateList(listId, data) {
    const response = await api.put(`/projects/lists/${listId}`, data)
    return response.data
  },

  async reorderLists(projectId, listIds) {
    const response = await api.put(`/projects/${projectId}/lists/reorder`, { listIds })
    return response.data
  },

  async deleteList(listId) {
    const response = await api.delete(`/projects/lists/${listId}`)
    return response.data
  }
}
