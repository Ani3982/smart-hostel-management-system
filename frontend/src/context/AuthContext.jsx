import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

const normalizeUser = (data) => {
  if (!data) return null;
  const idVal = data.id || data.userId;
  const rawRole = (data.role || 'STUDENT').toUpperCase().replace(/^ROLE_/, '');
  if (rawRole === 'SUPER_ADMIN' || rawRole === 'ADMIN') {
    return null;
  }
  
  let hostelTypeVal = data.hostelType;
  if (!hostelTypeVal) {
    if (rawRole === 'BOYS_WARDEN' || data.hostelId === 1) hostelTypeVal = 'BOYS';
    else if (rawRole === 'GIRLS_WARDEN' || data.hostelId === 2) hostelTypeVal = 'GIRLS';
    else hostelTypeVal = null;
  }

  return {
    ...data,
    id: idVal,
    userId: idVal,
    role: rawRole,
    hostelType: hostelTypeVal,
    hostelId: data.hostelId || (hostelTypeVal === 'GIRLS' ? 2 : hostelTypeVal === 'BOYS' ? 1 : null)
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('hostel_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('hostel_token');
      const storedUser = localStorage.getItem('hostel_user');

      if (storedToken && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const normalized = normalizeUser(parsed);
          setUser(normalized);
          setToken(storedToken);
          localStorage.setItem('hostel_user', JSON.stringify(normalized));
        } catch (e) {
          console.error("Failed to parse stored user", e);
          localStorage.removeItem('hostel_token');
          localStorage.removeItem('hostel_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data.success) {
      const authData = res.data.user || res.data.data?.user || res.data.data;
      const tokenVal = res.data.token || res.data.data?.token;
      const normalized = normalizeUser({ ...authData, token: tokenVal });
      
      setToken(tokenVal);
      setUser(normalized);
      localStorage.setItem('hostel_token', tokenVal);
      localStorage.setItem('hostel_user', JSON.stringify(normalized));
      return normalized;
    } else {
      throw new Error(res.data.message || 'Invalid email or password.');
    }
  };

  const register = async (formData, autoLogin = false) => {
    const res = await authService.register(formData);
    if (res.data.success) {
      const authData = res.data.user || res.data.data?.user || res.data.data;
      const tokenVal = res.data.token || res.data.data?.token;
      const normalized = normalizeUser({ ...authData, token: tokenVal });
      if (autoLogin && tokenVal) {
        setToken(tokenVal);
        setUser(normalized);
        localStorage.setItem('hostel_token', tokenVal);
        localStorage.setItem('hostel_user', JSON.stringify(normalized));
      }
      return normalized;
    } else {
      throw new Error(res.data.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hostel_token');
    localStorage.removeItem('hostel_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
