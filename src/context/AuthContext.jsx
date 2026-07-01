import { createContext, useContext, useState } from 'react';
import { authStorage, backendApi } from '../api/backendApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStorage.getUser());
  const [token, setToken] = useState(() => authStorage.getToken());
  const loading = false;

  const completeSession = (session) => {
    authStorage.setSession(session.token, session.user);
    setUser(session.user);
    setToken(session.token);
    return session;
  };

  const signIn = async (email, password) => {
    const session = await backendApi.login(email, password);
    return completeSession(session);
  };

  const signUp = async (email, password, profileDetails) => {
    const session = await backendApi.register(email, password, profileDetails);
    return completeSession(session);
  };

  const beginOAuth = async (provider, flow = 'login') => {
    const authorizationUrl = await backendApi.getOAuthStartUrl(provider, flow);
    window.location.assign(authorizationUrl);
  };

  const completeOAuthCallback = async (provider, code, redirectUri) => {
    const session = await backendApi.exchangeOAuthCode(provider, code, redirectUri);
    return completeSession(session);
  };

  const signOut = async () => {
    authStorage.clear();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedFields) => {
    const merged = { ...user, ...updatedFields };
    authStorage.setSession(token, merged);
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, token, signIn, signUp, signOut, updateUser, beginOAuth, completeOAuthCallback, isAuthenticated: !!user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
