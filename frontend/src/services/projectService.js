import api from './api'
import axios from 'axios'
import demoApi from './demoApiService'
import demoDataService from './demoDataService'

const API_BASE_URL = '/api'


const createFileApiInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
  })
  

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  
  return instance
}

export const projectService = {
  async getAllProjects(page = 1, limit = 5) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.getProjects();
      return response.data;
    }
    const response = await api.get(`/projects?page=${page}&limit=${limit}`)
    return response.data
  },

  async getProjectById(id) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.getProjectById(id);
      return response.data;
    }
    const response = await api.get(`/projects/${id}`)
    return response.data
  },

  async createProject(projectName) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.createProject({ name: projectName });
      return response.data;
    }
    const response = await api.post('/projects', { name: projectName })
    return response.data
  },

  async updateProject(id, projectName) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.updateProject(id, { name: projectName });
      return response.data;
    }
    const response = await api.put(`/projects/${id}`, { name: projectName })
    return response.data
  },

  async uploadProjectImage(id, file) {
    const formData = new FormData()
    formData.append('image', file)
    
    const fileApi = createFileApiInstance()
    const response = await fileApi.post(`/projects/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async getProjectImage(id) {
    const project = await this.getProjectById(id)
    if (project.success && project.data.imageHash) {
      let filename = project.data.imageHash
      if (filename.includes('/')) {
        filename = filename.split('/').pop()
      }
      
      const fileApi = createFileApiInstance()
      const response = await fileApi.get(`/storage/photos/${id}/${filename}`, {
        responseType: 'blob'
      })
      
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(response.data)
      })
    }
    return null
  },

  async getProjectImageDirect(id, imageHash) {
    if (!imageHash) return null
    
    try {
      let filename = imageHash
      if (filename.includes('/')) {
        filename = filename.split('/').pop()
      }
      
      const fileApi = createFileApiInstance()
      const response = await fileApi.get(`/storage/photos/${id}/${filename}`, {
        responseType: 'blob'
      })
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(response.data)
      })
    } catch (error) {
      console.error('Error loading project image:', error)
      return null
    }
  },

  async getLabelsByProject(projectId) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.getLabelsByProject(projectId);
      return response.data;
    }
    const response = await api.get(`/projects/${projectId}/labels`)
    return response.data
  },

  async createLabel(projectId, labelData) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.createLabel(projectId, labelData);
      return response.data;
    }
    const response = await api.post(`/projects/${projectId}/labels`, labelData)
    return response.data
  },

  async updateLabel(labelId, labelData) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.updateLabel(labelId, labelData);
      return response.data;
    }
    const response = await api.put(`/labels/${labelId}`, labelData)
    return response.data
  },

  async deleteLabel(labelId) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.deleteLabel(labelId);
      return response.data;
    }
    const response = await api.delete(`/labels/${labelId}`)
    return response.data
  },

  async getMembersByProject(projectId) {
    if (demoDataService.isDemoMode()) {
      // Return demo user as member
      const user = demoDataService.getDemoUser();
      return {
        success: true,
        data: [{ id: 'demo-member-1', userId: user.id, projectId, role: 'OWNER', user }]
      };
    }
    const response = await api.get(`/projects/${projectId}/members`)
    return response.data
  },

  async deleteProject(projectId) {
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.deleteProject(projectId);
      return response.data;
    }
    const response = await api.delete(`/projects/${projectId}`)
    return response.data
  },

  async getProjectDataOptimized(projectId) {
    if (demoDataService.isDemoMode()) {
      // Get all related data for the project
      const projectRes = await demoApi.getProjectById(projectId);
      const listsRes = await demoApi.getListsByProject(projectId);
      const labelsRes = await demoApi.getLabelsByProject(projectId);
      
      return {
        success: true,
        data: {
          project: projectRes.data.data,
          lists: listsRes.data.data,
          labels: labelsRes.data.data
        }
      };
    }
    const response = await api.get(`/projects/${projectId}/data`)
    return response.data
  }
}
