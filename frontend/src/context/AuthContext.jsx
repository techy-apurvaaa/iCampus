import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cpip_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(r => setUser(r.data.user))
      .catch(() => { localStorage.removeItem('cpip_token'); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email: email.trim(), password });
    if (!r.data?.token || !r.data?.user) throw new Error('Server returned an incomplete login response');
    localStorage.setItem('cpip_token', r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };

  const register = async (details) => {
    const r = await api.post('/auth/register', details);
    if (!r.data?.token || !r.data?.user) throw new Error('Server returned an incomplete registration response');
    localStorage.setItem('cpip_token', r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };

  const logout = () => {
    localStorage.removeItem('cpip_token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
