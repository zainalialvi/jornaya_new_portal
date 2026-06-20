import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedRole = localStorage.getItem('role');
    const storedCompanyId = localStorage.getItem('company_id');
    const storedCompanyName = localStorage.getItem('company_name');
    const storedUsername = localStorage.getItem('username');

    if (storedToken) {
      setToken(storedToken);
      setRole(storedRole);
      setCompanyId(storedCompanyId);
      setCompanyName(storedCompanyName || null);
      setUser({ username: storedUsername });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { access_token, refresh_token, role, company_id, company_name } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('role', role);
      localStorage.setItem('company_id', company_id || '');
      localStorage.setItem('company_name', company_name || '');
      localStorage.setItem('username', username);

      setToken(access_token);
      setRole(role);
      setCompanyId(company_id);
      setCompanyName(company_name || null);
      setUser({ username });

      return { role, company_id, company_name };
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setCompanyId(null);
    setCompanyName(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role, companyId, companyName, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
