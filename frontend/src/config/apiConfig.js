// Frontend environment configuration
// Loads from .env and provides API configuration

const getApiUrl = () => {
  // Check for explicit API URL configuration first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If running in Electron, get backend URL from main process
  if (window.electron) {
    return window.electron.getBackendUrl();
  }
  
  // Development: auto-detect API URL based on access method
  if (!import.meta.env.PROD) {
    const host = window.location.hostname;
    const port = import.meta.env.VITE_API_PORT || '3001';
    
    // If accessed via localhost, use localhost API
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://localhost:${port}`;
    }
    
    // If accessed via IP address (network), use same IP for API
    return `http://${host}:${port}`;
  }
  
  // Production web: must be configured via VITE_API_URL environment variable
  console.warn('VITE_API_URL not configured for production');
  return 'http://localhost:3001'; // Fallback
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
