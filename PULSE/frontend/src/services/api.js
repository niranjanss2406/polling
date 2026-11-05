import axios from 'axios';

function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  // If an external backend URL is configured (e.g. deployed on Render / Railway), use it
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }
  // Otherwise, use relative path so Vite proxy or single-domain hosting handles /api
  return '';
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    // Dynamic baseURL evaluation in case of host shifts
    config.baseURL = getApiBaseUrl();

    const token = localStorage.getItem('pulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach anonymous voter ID for public voting if available
    const voterId = localStorage.getItem('pulse_voter_id');
    if (voterId) {
      config.headers['X-Voter-ID'] = voterId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear it
      const hadToken = !!localStorage.getItem('pulse_token');
      if (hadToken && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/poll/')) {
        localStorage.removeItem('pulse_token');
        localStorage.removeItem('pulse_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
