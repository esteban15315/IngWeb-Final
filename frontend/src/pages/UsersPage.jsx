// Gestión de usuarios de la organización (RF-10). Solo ADMIN.
import { useState } from 'react';
import { usersApi } from '../api/services.js';
import { useAsync } from '../hooks/useAsync.js';
import { useForm } from '../hooks/useForm.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';
import FormField from '../components/FormField.jsx';
import { ROLE_LABELS, ROLES, TIMEZONES } from '../constants.js';
import { formatDate } from '../utils/dates.js';
import { validateUser } from '../utils/validators.js';

const EMPTY_USER = { name: '', email: '', password: '', role: ROLES.MEMBER, timezone: 'America/Lima' };

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const { data: users, loading, error: loadError, reload } = useAsync(() => usersApi.list(), []);
  const { values, setValues, errors, setErrors, handleChange, applyServerError } = useForm(EMPTY_USER);
  const [saving, setSaving] = useState(false);

  async function handleCreate(event) {
    event.preventDefault();

    const clientErrors = validateUser(values);
    if (Object.keys(clientErrors).length) return setErrors(clientErrors);

    setSaving(true);
    try {
      await usersApi.create(values);
      showToast(`Usuario ${values.name} creado`);
      setValues(EMPTY_USER); // limpia el formulario
      reload();
    } catch (error) {
      applyServerError(error);
      showToast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`¿Eliminar a ${user.name}? Sus tareas pasarán a ti.`)) return;
    try {
      await usersApi.remove(user.id);
      showToast('Usuario eliminado y tareas reasignadas');
      reload();
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Usuarios</h1>
          <p className="muted">Miembros de tu organización</p>
        </div>
      </div>

      <div className="users-layout">
        {/* Formulario para agregar usuario */}
        <form className="card form" onSubmit={handleCreate} noValidate>
          <h3>Agregar usuario</h3>
          <FormField label="Nombre" name="name" value={values.name} onChange={handleChange} error={errors.name} />
          <FormField label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} />
          <FormField label="Contraseña" name="password" type="password" autoComplete="new-password" value={values.password} onChange={handleChange} error={errors.password} hint="Mínimo 8 caracteres, con letras y números" />
          <div className="form-row">
            <FormField label="Rol" name="role" as="select" value={values.role} onChange={handleChange}>
              {Object.values(ROLES).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </FormField>
            <FormField label="Zona horaria" name="timezone" as="select" value={values.timezone} onChange={handleChange}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </FormField>
          </div>
          <button className="btn btn-primary btn-block" disabled={saving}>
            {saving ? 'Guardando...' : 'Agregar usuario'}
          </button>
        </form>

        {/* Lista de usuarios */}
        <div className="card">
          <h3>Equipo ({users?.length ?? 0})</h3>
          {loading && <Spinner />}
          {!loading && loadError && <p className="field-error">{loadError}</p>}
          {!loading && !loadError && (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Zona horaria</th><th>Desde</th><th /></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}{u.id === currentUser.id && <span className="muted"> (tú)</span>}</td>
                      <td>{u.email}</td>
                      <td><span className={`badge role-${u.role.toLowerCase()}`}>{ROLE_LABELS[u.role]}</span></td>
                      <td>{u.timezone}</td>
                      <td>{formatDate(u.createdAt, currentUser.timezone)}</td>
                      <td>
                        {/* RN-08: no puedes eliminarte a ti mismo */}
                        {u.id !== currentUser.id && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u)}>Eliminar</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
