// Registro de una nueva organización + su usuario ADMIN (RF-01).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField from '../components/FormField.jsx';
import { useForm } from '../hooks/useForm.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { validateRegister } from '../utils/validators.js';
import { TIMEZONES } from '../constants.js';

// Zona horaria del navegador (si no está en la lista, la agregamos)
const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const timeZoneOptions = TIMEZONES.includes(browserTimeZone) ? TIMEZONES : [browserTimeZone, ...TIMEZONES];

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const { values, errors, setErrors, handleChange, applyServerError } = useForm({
    organizationName: '',
    name: '',
    email: '',
    password: '',
    timezone: browserTimeZone,
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const clientErrors = validateRegister(values);
    if (Object.keys(clientErrors).length) return setErrors(clientErrors);

    setLoading(true);
    try {
      await register(values);
      showToast('Organización creada. ¡Ya eres administrador!');
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
        <p className="muted">Crea tu organización. Serás su administrador.</p>

        <FormField label="Organización" name="organizationName" value={values.organizationName} onChange={handleChange} error={errors.organizationName} />
        <FormField label="Tu nombre" name="name" autoComplete="name" value={values.name} onChange={handleChange} error={errors.name} />
        <FormField label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} error={errors.email} />
        <FormField label="Contraseña" name="password" type="password" autoComplete="new-password" value={values.password} onChange={handleChange} error={errors.password} hint="Mínimo 8 caracteres, con letras y números" />
        <FormField label="Zona horaria" name="timezone" as="select" value={values.timezone} onChange={handleChange} error={errors.timezone}>
          {timeZoneOptions.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
        </FormField>

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Creando...' : 'Crear organización'}
        </button>

        <p className="muted center">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
