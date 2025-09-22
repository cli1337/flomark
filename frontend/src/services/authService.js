import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/user/refresh`, {
            refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api.request(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.resolve({
      error: true,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      config: originalRequest,
    });
  }
);


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
  }
}
