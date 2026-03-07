import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();
const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 hours

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vulnexus-user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed?.expiresAt && parsed.expiresAt < Date.now()) {
        localStorage.removeItem('vulnexus-user');
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem('vulnexus-user');
      return null;
    }
  });

  const login = (userData) => {
    const u = {
      id: '1',
      name: userData.name || 'Alex Morgan',
      email: userData.email || 'alex@vulnexus.io',
      role: 'Admin',
      avatar: null,
      expiresAt: Date.now() + SESSION_TTL,
    };
    setUser(u);
    localStorage.setItem('vulnexus-user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vulnexus-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
