import api from './api'
import axios from 'axios'

const API_BASE_URL = '/api'

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

  async uploadProjectImage(id, file) {
    const formData = new FormData()
    formData.append('image', file)
    
    const token = localStorage.getItem('token')
    const response = await axios.post(`${API_BASE_URL}/projects/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': token ? `Bearer ${token}` : ''
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
      
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/storage/photos/${id}/${filename}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
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
  }
}
