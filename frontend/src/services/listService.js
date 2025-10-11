import api from './api'
import demoApi from './demoApiService'
import demoDataService from './demoDataService'

export const listService = {
  async getListsByProject(projectId) {
    if (demoDataService.isDemoMode()) {
      return await demoApi.getListsByProject(projectId);
    }
    const response = await api.get(`/projects/${projectId}/lists`)
    return response.data
  },

  async createList(projectId, name, color = '#3b82f6') {
    if (demoDataService.isDemoMode()) {
      return await demoApi.createList(projectId, { name, color });
    }
    const response = await api.post(`/projects/${projectId}/list`, { name, color })
    return response.data
  },

  async updateList(listId, data) {
    if (demoDataService.isDemoMode()) {
      return await demoApi.updateList(listId, data);
    }
    const response = await api.put(`/projects/lists/${listId}`, data)
    return response.data
  },

  async reorderLists(projectId, listIds) {
    if (demoDataService.isDemoMode()) {
      // Update order in demo data
      const demoData = demoDataService.getDemoData();
      listIds.forEach((listId, index) => {
        const list = demoData.lists.find(l => l.id === listId);
        if (list) list.order = index;
      });
      demoDataService.saveDemoData(demoData);
      return { success: true };
    }
    const response = await api.put(`/projects/${projectId}/lists/reorder`, { listIds })
    return response.data
  },

  async deleteList(listId) {
    if (demoDataService.isDemoMode()) {
      const data = demoDataService.getDemoData();
      // Remove list and its tasks
      data.lists = data.lists.filter(l => l.id !== listId);
      data.tasks = data.tasks.filter(t => t.listId !== listId);
      demoDataService.saveDemoData(data);
      return { success: true, message: 'List deleted' };
    }
    const response = await api.delete(`/projects/lists/${listId}`)
    return response.data
  }
}
