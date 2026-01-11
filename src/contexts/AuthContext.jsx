import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, menusAPI, fetchCsrfToken } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in
  const checkAuth = useCallback(async () => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    
    if (storedUser && accessToken) {
      try {
        // Verify token is still valid
        const response = await authAPI.getMe();
        const userData = response.data.data;
        setUser(userData);
        setIsAuthenticated(true);
        
        // Fetch user's menu
        await fetchUserMenu();
      } catch (error) {
        // Token invalid, clear storage
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  }, []);

  // Fetch user's menu based on role
  const fetchUserMenu = async () => {
    try {
      const response = await menusAPI.getMyMenu();
      setMenu(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      setMenu([]);
    }
  };

  // Login
  const login = async (username, password) => {
    try {
      // Ensure we have a CSRF token
      await fetchCsrfToken();
      
      const response = await authAPI.login({ username, password });
      const { user: userData, accessToken } = response.data.data;
      
      // Store in state and localStorage
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', accessToken);
      
      // Fetch menu after login
      await fetchUserMenu();
      
      toast.success(`Welcome back, ${userData.username}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and storage regardless of API response
      setUser(null);
      setMenu([]);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      toast.success('Logged out successfully');
    }
  };

  // Logout from all devices
  const logoutAll = async () => {
    try {
      await authAPI.logoutAll();
      setUser(null);
      setMenu([]);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      toast.success('Logged out from all devices');
    } catch (error) {
      toast.error('Failed to logout from all devices');
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      // Password change forces logout
      setUser(null);
      setMenu([]);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      toast.success('Password changed. Please login again.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Check if user has super admin role
  const isSuperAdmin = () => {
    return user?.isSystemRole === true;
  };

  // Refresh menu (useful after menu changes)
  const refreshMenu = async () => {
    await fetchUserMenu();
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    menu,
    loading,
    isAuthenticated,
    login,
    logout,
    logoutAll,
    changePassword,
    isSuperAdmin,
    refreshMenu,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
