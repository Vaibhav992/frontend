import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests and prevent caching for auth endpoints
api.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Prevent caching for auth endpoints (root cause of 304 issue)
    if (config.url?.includes('/auth/')) {
      config.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, private';
      config.headers['Pragma'] = 'no-cache';
      config.headers['Expires'] = '0';
      // Add timestamp to prevent browser caching
      if (config.method === 'get') {
        config.params = {
          ...config.params,
          _t: Date.now()
        };
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

