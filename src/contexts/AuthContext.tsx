import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('isAuthenticated') === 'true');
  const navigate = useNavigate();

  const login = useCallback((username: string, password: string): boolean => {
    if (username === 'admin' && password === 'canki123') {
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate]);
  const value = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
