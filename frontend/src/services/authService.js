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
  }
}
