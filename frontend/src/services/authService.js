import api from './api'
import demoApi from './demoApiService'
import demoDataService from './demoDataService'

export const authService = {
  async login(email, password) {
    // Use demo API if demo mode is enabled
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.login({ email, password });
      return response.data;
    }
    
    const response = await api.post('/user/auth', { email, password })
    return response.data
  },

  async register(name, email, password, confirmPassword) {
    // Use demo API if demo mode is enabled
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.register({ name, email, password });
      return response.data;
    }
    
    const response = await api.post('/user/create', {
      name,
      email,
      password,
      confirmPassword
    })
    return response.data
  },

  async getProfile() {
    // Use demo API if demo mode is enabled
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.getProfile();
      return response.data.data;
    }
    
    const response = await api.get('/user/profile')
    return response.data.data
  },

  async refreshToken(refreshToken) {
    // Use demo API if demo mode is enabled
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.refreshToken();
      return response.data.data;
    }
    
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
    // Use demo API if demo mode is enabled
    if (demoDataService.isDemoMode()) {
      const response = await demoApi.updateProfile({ name });
      return response.data;
    }
    
    const response = await api.put('/user/profile', { name })
    return response.data
  },

  async updatePassword(currentPassword, newPassword) {
    // In demo mode, just return success
    if (demoDataService.isDemoMode()) {
      return { success: true, message: 'Password updated (demo mode)' };
    }
    
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
  }
}
