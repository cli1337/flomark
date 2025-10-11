import api from './api'
import demoApi from './demoApiService'
import demoDataService from './demoDataService'

export const taskService = {
  async getTasksByList(listId) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.getTasksByList(listId);
      return response.data;
    }
    const response = await api.get(`/tasks/lists/${listId}/tasks`)
    return response.data
  },

  async createTask(listId, data) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.createTask(listId, data);
      return response.data;
    }
    const response = await api.post(`/tasks/lists/${listId}/tasks`, data)
    return response.data
  },

  async updateTask(taskId, data) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.updateTask(taskId, data);
      return response.data;
    }
    const response = await api.put(`/tasks/${taskId}`, data)
    return response.data
  },

  async deleteTask(taskId) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.deleteTask(taskId);
      return response.data;
    }
    const response = await api.delete(`/tasks/${taskId}`)
    return response.data
  },

  async getTaskById(taskId) {
    if (demoDataService.isDemoMode()) {
      const data = demoDataService.getDemoData();
      const task = data.tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');
      return {
        success: true,
        data: {
          ...task,
          label: task.labelId ? data.labels.find(l => l.id === task.labelId) : null,
          subTasks: data.subtasks.filter(st => st.taskId === taskId),
          attachments: []
        }
      };
    }
    const response = await api.get(`/tasks/${taskId}`)
    return response.data
  },

  async moveTask(taskId, newListId) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.moveTask(taskId, newListId);
      return response.data;
    }
    const response = await api.put(`/tasks/${taskId}/move`, { listId: newListId })
    return response.data
  },

  async reorderTasks(listId, taskIds) {
    if (demoDataService.isDemoMode()) {
      // In demo mode, just update task orders
      const data = demoDataService.getDemoData();
      taskIds.forEach((taskId, index) => {
        const task = data.tasks.find(t => t.id === taskId);
        if (task) task.order = index;
      });
      demoDataService.saveDemoData(data);
      return { success: true };
    }
    const response = await api.put(`/tasks/lists/${listId}/reorder`, { taskIds })
    return response.data
  },

  async assignMember(taskId, userId) {
    if (demoDataService.isDemoMode()) {
      // In demo mode, no-op since we only have one user
      return { success: true };
    }
    const response = await api.post(`/tasks/${taskId}/members`, { userId })
    return response.data
  },

  async removeMember(taskId, userId) {
    if (demoDataService.isDemoMode()) {
      return { success: true };
    }
    const response = await api.delete(`/tasks/${taskId}/members/${userId}`)
    return response.data
  },

  async addSubTask(taskId, name) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.createSubtask(taskId, { title: name });
      return response.data;
    }
    const response = await api.post(`/tasks/${taskId}/subtasks`, { name })
    return response.data
  },

  async updateSubTask(subTaskId, data) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.updateSubtask(subTaskId, data);
      return response.data;
    }
    const response = await api.put(`/tasks/subtasks/${subTaskId}`, data)
    return response.data
  },

  async deleteSubTask(subTaskId) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.deleteSubtask(subTaskId);
      return response.data;
    }
    const response = await api.delete(`/tasks/subtasks/${subTaskId}`)
    return response.data
  },

  async removeLabel(taskId, labelId) {
    if (demoDataService.isDemoMode()) {
      const data = demoDataService.getDemoData();
      const task = data.tasks.find(t => t.id === taskId);
      if (task) task.labelId = null;
      demoDataService.saveDemoData(data);
      return { success: true };
    }
    const response = await api.delete(`/tasks/${taskId}/labels/${labelId}`)
    return response.data
  },

  async uploadAttachment(taskId, file) {
    if (demoDataService.isDemoMode()) {
      // In demo mode, just return success (no file upload)
      return { success: true, message: 'File upload not available in demo mode' };
    }
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async getAttachments(taskId) {
    if (demoDataService.isDemoMode()) {
      return { success: true, data: [] };
    }
    const response = await api.get(`/tasks/${taskId}/attachments`)
    return response.data
  },

  async deleteAttachment(attachmentId) {
    if (demoDataService.isDemoMode()) {
      return { success: true };
    }
    const response = await api.delete(`/tasks/attachments/${attachmentId}`)
    return response.data
  }
}
