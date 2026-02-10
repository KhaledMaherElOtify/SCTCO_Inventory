// Frontend environment configuration
// Loads from .env and provides API configuration

const getApiUrl = () => {
  // Check for explicit API URL configuration first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development: use localhost
  if (!import.meta.env.PROD) {
    const port = import.meta.env.VITE_API_PORT || '3001';
    return `http://localhost:${port}`;
  }
  
  // Production: must be configured via VITE_API_URL environment variable
  console.warn('VITE_API_URL not configured for production');
  return 'http://localhost:3001'; // Fallback (should not reach here in production)
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
