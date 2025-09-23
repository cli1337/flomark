import api from './api'

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
  }
}
