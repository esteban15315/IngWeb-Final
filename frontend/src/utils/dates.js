// Manejo de fechas con zona horaria (RS-04).
// La API envía y recibe fechas en UTC (ISO 8601). Aquí las convertimos a la
// zona horaria del usuario (user.timezone, ej: "America/Lima") y viceversa.

// Muestra una fecha ISO en la hora local del usuario. Ej: "24 nov 2026, 10:30"
export function formatDateTime(iso, timeZone) {
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(iso));
}

// Solo la fecha. Ej: "24 nov 2026"
export function formatDate(iso, timeZone) {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeZone }).format(new Date(iso));
}

// Obtiene año, mes, día, hora y minuto de una fecha "vista" en cierta zona horaria
function getZonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(date);
  // Convierte [{type:'year', value:'2026'}, ...] en { year: '2026', ... }
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

// UTC (ISO) → texto para <input type="datetime-local"> en la zona del usuario
// Ej: "2026-11-24T15:30:00.000Z" con "America/Lima" → "2026-11-24T10:30"
export function isoToZonedInput(iso, timeZone) {
  const p = getZonedParts(new Date(iso), timeZone);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

// Texto del <input type="datetime-local"> en la zona del usuario → UTC (ISO)
// Ej: "2026-11-24T10:30" con "America/Lima" → "2026-11-24T15:30:00.000Z"
export function zonedInputToIso(inputValue, timeZone) {
  const [datePart, timePart] = inputValue.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  // 1) Suponemos que la hora escrita es UTC
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  // 2) Vemos qué hora marca ese instante en la zona del usuario y calculamos la diferencia
  const p = getZonedParts(new Date(guess), timeZone);
  const shown = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  const offset = shown - guess;
  // 3) Corregimos la diferencia
  return new Date(guess - offset).toISOString();
}

// RN-09: ¿la tarea está vencida?
export function isOverdue(task) {
  return task.status !== 'COMPLETADA' && new Date(task.dueDate).getTime() < Date.now();
}
