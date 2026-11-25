// Valores fijos del dominio. Se definen una sola vez y se reutilizan (DRY).

// Roles del sistema (RBAC)
export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
});

// Estados posibles de una tarea (RN-05)
export const TASK_STATUS = Object.freeze({
  PENDING: 'PENDIENTE',
  IN_PROGRESS: 'EN_PROGRESO',
  DONE: 'COMPLETADA',
});

// Prioridades posibles de una tarea (RN-05)
export const TASK_PRIORITY = Object.freeze({
  LOW: 'BAJA',
  MEDIUM: 'MEDIA',
  HIGH: 'ALTA',
});

// Listas útiles para validar con .includes()
export const ROLE_VALUES = Object.values(ROLES);
export const STATUS_VALUES = Object.values(TASK_STATUS);
export const PRIORITY_VALUES = Object.values(TASK_PRIORITY);

// Zona horaria por defecto para los usuarios nuevos (RS-04)
export const DEFAULT_TIMEZONE = 'America/Lima';
