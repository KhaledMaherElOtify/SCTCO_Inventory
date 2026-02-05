// Authentication context for global state management

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../api/services';
import { authConfig } from '../config/apiConfig';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(authConfig.userKey);
    const token = localStorage.getItem(authConfig.storageKey);

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem(authConfig.userKey);
        localStorage.removeItem(authConfig.storageKey);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(username, password);
      const { accessToken, refreshToken, user: userData } = response.data;

      localStorage.setItem(authConfig.storageKey, accessToken);
      localStorage.setItem(authConfig.refreshKey, refreshToken);
      localStorage.setItem(authConfig.userKey, JSON.stringify(userData));

      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      localStorage.removeItem(authConfig.storageKey);
      localStorage.removeItem(authConfig.refreshKey);
      localStorage.removeItem(authConfig.userKey);
      setUser(null);
      setError(null);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setError(null);

    try {
      await authApi.changePassword(currentPassword, newPassword);
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Password change failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
