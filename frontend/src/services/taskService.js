import api from './api'

export const taskService = {
  async getTasksByList(listId) {
    const response = await api.get(`/lists/${listId}/tasks`)
    return response.data
  },

  async createTask(listId, data) {
    const response = await api.post(`/lists/${listId}/tasks`, data)
    return response.data
  },

  async updateTask(taskId, data) {
    const response = await api.put(`/tasks/${taskId}`, data)
    return response.data
  },

  async deleteTask(taskId) {
    const response = await api.delete(`/tasks/${taskId}`)
    return response.data
  },

  async getTaskById(taskId) {
    const response = await api.get(`/tasks/${taskId}`)
    return response.data
  },

  async moveTask(taskId, newListId) {
    const response = await api.put(`/tasks/${taskId}/move`, { listId: newListId })
    return response.data
  },

  async assignMember(taskId, userId) {
    const response = await api.post(`/tasks/${taskId}/members`, { userId })
    return response.data
  },

  async removeMember(taskId, userId) {
    const response = await api.delete(`/tasks/${taskId}/members/${userId}`)
    return response.data
  },

  async addSubTask(taskId, name) {
    const response = await api.post(`/tasks/${taskId}/subtasks`, { name })
    return response.data
  },

  async updateSubTask(subTaskId, data) {
    const response = await api.put(`/subtasks/${subTaskId}`, data)
    return response.data
  },

  async deleteSubTask(subTaskId) {
    const response = await api.delete(`/subtasks/${subTaskId}`)
    return response.data
  }
}
