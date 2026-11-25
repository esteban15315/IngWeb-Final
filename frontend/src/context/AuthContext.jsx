// Contexto de autenticación: guarda el usuario logueado y lo comparte con toda la app.
// Cualquier componente puede usar: const { user, login, logout } = useAuth();
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/services.js';
import { tokenStorage } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true mientras revisamos si ya había sesión

  // Guarda el token y el usuario después de login/registro
  const startSession = useCallback(({ token, user: loggedUser }) => {
    tokenStorage.save(token);
    setUser(loggedUser);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  // Al abrir la app: si hay token guardado, pedimos el perfil para restaurar la sesión
  useEffect(() => {
    if (!tokenStorage.get()) {
      setLoading(false);
      return;
    }
    authApi.me()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  // Si alguna petición recibe 401 (token vencido), cerramos la sesión
  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const value = useMemo(() => ({
    user,
    loading,
    isAdmin: user?.role === 'ADMIN',
    login: async (credentials) => startSession(await authApi.login(credentials)),
    register: async (data) => startSession(await authApi.register(data)),
    logout,
  }), [user, loading, startSession, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
