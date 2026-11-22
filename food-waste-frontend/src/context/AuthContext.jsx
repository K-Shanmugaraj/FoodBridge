import { createContext, useContext, useState, useMemo } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('fb_token'));
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem('fb_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const saveSession = (authData) => {
    sessionStorage.setItem('fb_token', authData.token);
    sessionStorage.setItem('fb_user', JSON.stringify(authData.user));
    setToken(authData.token);
    setUser(authData.user);
  };

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    saveSession(data);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    saveSession(data);
    return data.user;
  };

  const logout = () => {
    sessionStorage.removeItem('fb_token');
    sessionStorage.removeItem('fb_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}