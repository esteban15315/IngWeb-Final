// Reglas de validación pequeñas y reutilizables (DRY).
// Cada función devuelve un mensaje de error (string) o null si el valor es correcto.

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Texto con longitud entre min y max
export function textLength(value, min, max, label) {
  if (typeof value !== 'string' || value.trim().length < min) {
    return `${label} debe tener al menos ${min} caracteres`;
  }
  if (value.trim().length > max) return `${label} no puede superar ${max} caracteres`;
  return null;
}

export function email(value) {
  return typeof value === 'string' && EMAIL_REGEX.test(value) ? null : 'Email inválido';
}

// RN-07: mínimo 8 caracteres, una letra y un número
export function password(value) {
  if (typeof value !== 'string' || value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'La contraseña debe incluir letras y números';
  return null;
}

// El valor debe estar dentro de una lista permitida
export function oneOf(value, allowed, label) {
  return allowed.includes(value) ? null : `${label} debe ser: ${allowed.join(', ')}`;
}

// Junta los errores en un objeto { campo: mensaje }, ignorando los null
export function collectErrors(checks) {
  const errors = {};
  for (const [field, message] of Object.entries(checks)) {
    if (message) errors[field] = message;
  }
  return errors;
}
