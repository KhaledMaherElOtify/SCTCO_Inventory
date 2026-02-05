// Frontend environment configuration
// Loads from .env and provides API configuration

const getApiUrl = () => {
  // In production, derive from window location
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = import.meta.env.VITE_API_PORT || '3001';
    return `${protocol}//${host}:${port}`;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

export const apiConfig = {
  baseURL: getApiUrl(),
  timeout: 10000,
  withCredentials: false,
};

export const authConfig = {
  storageKey: 'auth_token',
  refreshKey: 'refresh_token',
  userKey: 'user_data',
};

export default {
  apiConfig,
  authConfig,
};
