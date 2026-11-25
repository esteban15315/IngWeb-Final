// Componentes "guardia" para las rutas.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

// Solo deja pasar si hay sesión (y, opcionalmente, si el rol está permitido)
export function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}

// Para login/registro: si ya hay sesión, no tiene sentido mostrarlas
export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner fullScreen />;
  if (user) return <Navigate to="/" replace />;

  return children;
}
