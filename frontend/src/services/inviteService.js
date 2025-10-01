import api from './api'

export const inviteService = {
  async createInviteLink(projectId, email) {
    const response = await api.post(`/projects/${projectId}/invite`, { email })
    return response.data
  },

  async joinProject(inviteLink) {
    const response = await api.post(`/projects/join/${inviteLink}`)
    return response.data
  }
}
