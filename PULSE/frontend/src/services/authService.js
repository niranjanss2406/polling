import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/api/auth/register', userData);
    if (response.data?.token) {
      localStorage.setItem('pulse_token', response.data.token);
      localStorage.setItem('pulse_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/api/auth/login', credentials);
    if (response.data?.token) {
      localStorage.setItem('pulse_token', response.data.token);
      localStorage.setItem('pulse_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('pulse_token');
    localStorage.removeItem('pulse_user');
  },

  getStoredToken() {
    return localStorage.getItem('pulse_token');
  },

  getStoredUser() {
    const userStr = localStorage.getItem('pulse_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
};

export default authService;

