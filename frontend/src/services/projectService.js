import api from './api'
import axios from 'axios'

const API_BASE_URL = '/api'

export const projectService = {
  async getAllProjects() {
    const response = await api.get('/projects')
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
    
    // Create a separate axios instance for file uploads
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
      // Extract filename from imageHash (handle both URL and filename cases)
      let filename = project.data.imageHash
      if (filename.includes('/')) {
        // If it's a URL, extract the filename
        filename = filename.split('/').pop()
      }
      
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/storage/photos/${id}/${filename}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        responseType: 'blob'
      })
      
      // Convert blob to data URL
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(response.data)
      })
    }
    return null
  }
}
