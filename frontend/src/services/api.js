import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const createApiInstance = (contentType = 'application/json') => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': contentType,
    },
  })
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  

  if (token && token.trim() !== '') {
    config.headers.Authorization = `Bearer ${token}`
  } else {

    console.warn(`Request to ${config.url} made without valid token`)
  }
  
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      

      if (refreshToken && refreshToken.trim() !== '') {
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
          console.log('Token refresh failed, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {

        console.log('No valid refresh token, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
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

export default api
