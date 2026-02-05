// Axios instance with automatic token injection

import axios from 'axios';
import { apiConfig, authConfig } from '../config/apiConfig';

const api = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: apiConfig.withCredentials,
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(authConfig.storageKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(authConfig.refreshKey);
        if (refreshToken) {
          const response = await axios.post(`${apiConfig.baseURL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem(authConfig.storageKey, accessToken);
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (err) {
        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem(authConfig.storageKey);
        localStorage.removeItem(authConfig.refreshKey);
        localStorage.removeItem(authConfig.userKey);
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
