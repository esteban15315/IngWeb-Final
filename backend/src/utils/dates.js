// Manejo estandarizado de fechas y zonas horarias (RS-04).
// Regla: en el servidor TODO se guarda en UTC. La conversión a la hora local
// del usuario se hace en el frontend usando su "timezone".

// Convierte un texto ISO 8601 en Date. Devuelve null si no es válido.
export function parseIsoDate(value) {
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Comprueba si un texto es una zona horaria IANA válida (ej: "America/Lima").
// Intl lanza un error si la zona no existe.
export function isValidTimeZone(timeZone) {
  if (typeof timeZone !== 'string' || timeZone.length === 0) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

// ¿La fecha es posterior al momento actual?
export function isFutureDate(date) {
  return date instanceof Date && date.getTime() > Date.now();
}
