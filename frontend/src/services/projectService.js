import api from './api'
import axios from 'axios'

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
    const response = await api.get(`/projects?page=${page}&limit=${limit}`)
    return response.data
  },

  async getProjectById(id) {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },

  async createProject(projectName) {
    const response = await api.post('/projects', { name: projectName })
    return response.data
  },

  async updateProject(id, projectName) {
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
    const response = await api.get(`/projects/${projectId}/labels`)
    return response.data
  },

  async createLabel(projectId, labelData) {
    const response = await api.post(`/projects/${projectId}/labels`, labelData)
    return response.data
  },

  async updateLabel(labelId, labelData) {
    const response = await api.put(`/labels/${labelId}`, labelData)
    return response.data
  },

  async deleteLabel(labelId) {
    const response = await api.delete(`/labels/${labelId}`)
    return response.data
  },

  async getMembersByProject(projectId) {
    const response = await api.get(`/projects/${projectId}/members`)
    return response.data
  },

  async deleteProject(projectId) {
    const response = await api.delete(`/projects/${projectId}`)
    return response.data
  },

  async getProjectDataOptimized(projectId) {
    const response = await api.get(`/projects/${projectId}/data`)
    return response.data
  }
}
