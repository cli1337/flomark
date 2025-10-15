import api from './api'

export const authService = {
  async login(email, password) {
    const response = await api.post('/user/auth', { email, password })
    return response.data
  },

  async register(name, email, password, confirmPassword) {
    const response = await api.post('/user/create', {
      name,
      email,
      password,
      confirmPassword
    })
    return response.data
  },

  async getProfile() {
    const response = await api.get('/user/profile')
    return response.data.data
  },

  async refreshToken(refreshToken) {
    const response = await api.post('/user/refresh', { refreshToken })
    return response.data.data
  },

  async init2FA() {
    const response = await api.post('/user/2fa/init')
    return response.data
  },

  async verify2FASetup(code) {
    const response = await api.post('/user/2fa/verify-setup', { code })
    return response.data
  },

  async disable2FA(code) {
    const response = await api.post('/user/2fa/disable', { code })
    return response.data
  },

  async verify2FALogin(pendingToken, code) {
    const response = await api.post('/user/2fa/verify-login', { pendingToken, code })
    return response.data
  },

  async updateProfile(name) {
    const response = await api.put('/user/profile', { name })
    return response.data
  },

  async updatePassword(currentPassword, newPassword) {
    const response = await api.put('/user/password', { currentPassword, newPassword })
    return response.data
  },

  async uploadProfileImage(file) {
    const formData = new FormData()
    formData.append('profileImage', file)
    const response = await api.post('/user/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async removeProfileImage() {
    const response = await api.delete('/user/profile/image')
    return response.data
  }
}
