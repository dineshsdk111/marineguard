import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('marineguard_token'));
  const [loading, setLoading] = useState(true);

  const normalizeUser = (u) => {
    if (!u) return null;
    const id = u.id || u._id;
    return { ...u, id, _id: id };
  };

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(res => { setUser(normalizeUser(res.data.user)); setLoading(false); })
        .catch(() => { logout(); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const normalized = normalizeUser(res.data.user);
    localStorage.setItem('marineguard_token', res.data.token);
    localStorage.setItem('marineguard_user', JSON.stringify(normalized));
    setToken(res.data.token);
    setUser(normalized);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    if (res.data.user?.isApproved && res.data.token) {
      const normalized = normalizeUser(res.data.user);
      localStorage.setItem('marineguard_token', res.data.token);
      localStorage.setItem('marineguard_user', JSON.stringify(normalized));
      setToken(res.data.token);
      setUser(normalized);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('marineguard_token');
    localStorage.removeItem('marineguard_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
