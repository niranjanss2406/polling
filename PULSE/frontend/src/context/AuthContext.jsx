import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [token, setToken] = useState(() => authService.getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('pulse_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark'; // default to dark SaaS look
  });

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('pulse_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Check auth session on startup
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = authService.getStoredToken();
      if (!storedToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.getCurrentUser();
        if (response && response.user) {
          setUser(response.user);
          localStorage.setItem('pulse_user', JSON.stringify(response.user));
        }
      } catch (err) {
        console.error('Session expired or invalid:', err);
        authService.logout();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      setToken(data.token);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.register({ name, email, password });
      setUser(data.user);
      setToken(data.token);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'niranjanss2406@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

