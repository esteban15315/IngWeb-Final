// Validación de tareas (RN-05).
// "partial: true" se usa en PATCH: solo se validan los campos que vienen en el body.
import { textLength, oneOf, collectErrors, UUID_REGEX } from './rules.js';
import { STATUS_VALUES, PRIORITY_VALUES } from '../constants.js';
import { parseIsoDate } from '../utils/dates.js';

export function validateTask(body = {}, { partial = false } = {}) {
  // ¿Hay que validar este campo? En creación: siempre (si es obligatorio). En PATCH: solo si viene.
  const has = (field) => body[field] !== undefined;
  const required = (field) => !partial || has(field);

  const errors = collectErrors({
    title: required('title') ? textLength(body.title, 3, 100, 'El título') : null,
    description: has('description') && (typeof body.description !== 'string' || body.description.length > 500)
      ? 'La descripción no puede superar 500 caracteres'
      : null,
    status: has('status') ? oneOf(body.status, STATUS_VALUES, 'El estado') : null,
    priority: has('priority') ? oneOf(body.priority, PRIORITY_VALUES, 'La prioridad') : null,
    dueDate: required('dueDate') && !parseIsoDate(body.dueDate)
      ? 'La fecha límite es obligatoria y debe estar en formato ISO 8601'
      : null,
    assigneeId: has('assigneeId') && !UUID_REGEX.test(String(body.assigneeId))
      ? 'Responsable inválido'
      : null,
  });

  // En PATCH, un body vacío no tiene sentido
  if (partial && !Object.keys(body).length) errors.body = 'No se enviaron cambios';
  return errors;
}
