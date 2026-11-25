// Página de inicio de sesión (RF-02).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField from '../components/FormField.jsx';
import { useForm } from '../hooks/useForm.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { validateLogin } from '../utils/validators.js';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const { values, errors, setErrors, handleChange, applyServerError } = useForm({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const clientErrors = validateLogin(values);
    if (Object.keys(clientErrors).length) return setErrors(clientErrors);

    setLoading(true);
    try {
      await login(values); // si sale bien, PublicOnlyRoute redirige al dashboard
      showToast('¡Bienvenido!');
    } catch (error) {
      applyServerError(error);
      showToast(error.message, 'error');
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card form" onSubmit={handleSubmit} noValidate>
        <h1 className="brand-lg">✔ TaskFlow</h1>
        <p className="muted">Inicia sesión para gestionar las tareas de tu equipo</p>

        <FormField label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} error={errors.email} />
        <FormField label="Contraseña" name="password" type="password" autoComplete="current-password" value={values.password} onChange={handleChange} error={errors.password} />

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p className="muted center">
          ¿No tienes cuenta? <Link to="/register">Registra tu organización</Link>
        </p>

        {/* Ayuda para la demostración (usuarios creados con npm run seed) */}
        <details className="demo-users">
          <summary>Usuarios de prueba</summary>
          <ul>
            <li><b>admin@acme.com</b> / Admin123 (ADMIN)</li>
            <li><b>ana@acme.com</b> / Member123 (MEMBER)</li>
            <li><b>admin@globex.com</b> / Admin123 (otra organización)</li>
          </ul>
        </details>
      </form>
    </div>
  );
}
