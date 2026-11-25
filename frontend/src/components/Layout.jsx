// Estructura común de las páginas privadas: barra de navegación + contenido.
// <Outlet /> es el lugar donde React Router dibuja la página actual.
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_LABELS } from '../constants.js';

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <>
      <header className="navbar">
        <span className="brand">✔ TaskFlow</span>

        <nav className="nav-links">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/tasks">Tareas</NavLink>
          {/* El enlace de usuarios solo aparece para ADMIN */}
          {isAdmin && <NavLink to="/users">Usuarios</NavLink>}
        </nav>

        <div className="nav-user">
          <span className="nav-user-name">{user.name}</span>
          <span className={`badge role-${user.role.toLowerCase()}`}>{ROLE_LABELS[user.role]}</span>
          <button className="btn btn-ghost" onClick={logout}>Salir</button>
        </div>
      </header>

      <main className="page">
        <Outlet />
      </main>
    </>
  );
}
