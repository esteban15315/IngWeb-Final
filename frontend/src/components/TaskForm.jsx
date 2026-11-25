// Formulario para crear o editar una tarea (se reutiliza para ambos casos).
// - task: tarea a editar (o null para crear una nueva)
// - users: usuarios para el selector de responsable (solo ADMIN lo ve)
// - onSubmit(datos): función async que guarda en la API
import { useState } from 'react';
import FormField from './FormField.jsx';
import { useForm } from '../hooks/useForm.js';
import { useAuth } from '../context/AuthContext.jsx';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../constants.js';
import { isoToZonedInput, zonedInputToIso } from '../utils/dates.js';
import { validateTask } from '../utils/validators.js';

export default function TaskForm({ task, users = [], onSubmit, onCancel }) {
  const { user, isAdmin } = useAuth();
  const timeZone = user.timezone;
  const isEditing = Boolean(task);

  // La fecha UTC se muestra en la zona horaria del usuario (RS-04)
  const initialDueDate = task ? isoToZonedInput(task.dueDate, timeZone) : '';

  // Valores iniciales: los de la tarea (si editamos) o valores por defecto
  const { values, errors, setErrors, handleChange, applyServerError } = useForm({
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? 'PENDIENTE',
    priority: task?.priority ?? 'MEDIA',
    dueDate: initialDueDate,
    assigneeId: task?.assigneeId ?? user.id,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); // evita que el navegador recargue la página

    // Convertimos la fecha local del usuario a UTC antes de enviarla
    const dueDateIso = values.dueDate ? zonedInputToIso(values.dueDate, timeZone) : null;

    // 1) Validación en el cliente (RN-04: la fecha debe ser futura solo si es nueva o si cambió)
    const dueDateChanged = values.dueDate !== initialDueDate;
    const clientErrors = validateTask(values, dueDateIso, { mustBeFuture: dueDateChanged });
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }

    // 2) Armamos los datos a enviar
    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      status: values.status,
      priority: values.priority,
    };
    if (dueDateChanged) payload.dueDate = dueDateIso; // al editar, solo se envía si cambió
    if (isAdmin) payload.assigneeId = values.assigneeId; // RN-03: solo ADMIN asigna

    // 3) Enviamos. Si el servidor responde con errores por campo, los mostramos.
    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (error) {
      applyServerError(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="form">
      <FormField label="Título *" name="title" value={values.title} onChange={handleChange} error={errors.title} maxLength={100} autoFocus />

      <FormField label="Descripción" name="description" as="textarea" rows={3} value={values.description} onChange={handleChange} error={errors.description} maxLength={500} />

      <div className="form-row">
        <FormField label="Estado" name="status" as="select" value={values.status} onChange={handleChange} error={errors.status}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </FormField>

        <FormField label="Prioridad" name="priority" as="select" value={values.priority} onChange={handleChange} error={errors.priority}>
          {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </FormField>
      </div>

      <FormField
        label="Fecha límite *"
        name="dueDate"
        type="datetime-local"
        value={values.dueDate}
        onChange={handleChange}
        error={errors.dueDate}
        hint={`Hora en tu zona horaria: ${timeZone}`}
      />

      {/* Solo el ADMIN puede elegir el responsable */}
      {isAdmin && (
        <FormField label="Responsable" name="assigneeId" as="select" value={values.assigneeId} onChange={handleChange} error={errors.assigneeId}>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </FormField>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear tarea'}
        </button>
      </div>
    </form>
  );
}
