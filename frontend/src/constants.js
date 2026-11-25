// Valores fijos del dominio para el frontend (deben coincidir con backend/src/constants.js).

export const ROLES = { ADMIN: 'ADMIN', MEMBER: 'MEMBER' };

export const ROLE_LABELS = { ADMIN: 'Administrador', MEMBER: 'Miembro' };

// Cada opción tiene: valor que se envía a la API, texto visible y color
export const STATUS_OPTIONS = [
  { value: 'PENDIENTE', label: 'Pendiente', color: '#f59e0b' },
  { value: 'EN_PROGRESO', label: 'En progreso', color: '#3b82f6' },
  { value: 'COMPLETADA', label: 'Completada', color: '#10b981' },
];

export const PRIORITY_OPTIONS = [
  { value: 'BAJA', label: 'Baja', color: '#94a3b8' },
  { value: 'MEDIA', label: 'Media', color: '#8b5cf6' },
  { value: 'ALTA', label: 'Alta', color: '#ef4444' },
];

// Zonas horarias que se ofrecen en los formularios (formato IANA)
export const TIMEZONES = [
  'America/Lima',
  'America/Bogota',
  'America/Mexico_City',
  'America/Santiago',
  'America/Argentina/Buenos_Aires',
  'America/New_York',
  'Europe/Madrid',
  'UTC',
];

// Busca la opción por su valor (ej: findOption(STATUS_OPTIONS, 'PENDIENTE'))
export function findOption(options, value) {
  return options.find((option) => option.value === value) || { label: value, color: '#999' };
}
