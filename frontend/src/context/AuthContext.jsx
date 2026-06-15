import { createContext, useContext, useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (!stored) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(stored);
    if (!parsed?.token) {
      localStorage.removeItem('auth');
      setLoading(false);
      return;
    }

    setAuthToken(parsed.token);

    api
      .get('/api/auth/me')
      .then((response) => {
        setUser(response.data.user);
        setToken(parsed.token);
        localStorage.setItem('auth', JSON.stringify({ token: parsed.token, user: response.data.user }));
      })
      .catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth');
        setAuthToken(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (data) => {
    setUser(data.user);
    setToken(data.token);
    setAuthToken(data.token);
    localStorage.setItem('auth', JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
