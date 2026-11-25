// Definición de las rutas (páginas) de la SPA.
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { ROLES } from './constants.js';

export default function App() {
  return (
    <Routes>
      {/* Páginas públicas: si ya hay sesión, redirigen al dashboard */}
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

      {/* Páginas privadas: requieren sesión iniciada. Comparten el Layout (barra de navegación) */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        {/* RBAC en el frontend: solo ADMIN entra a usuarios (el backend también lo bloquea) */}
        <Route path="users" element={<ProtectedRoute roles={[ROLES.ADMIN]}><UsersPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
