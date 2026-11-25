// Cliente HTTP único para toda la app (DRY).
// - Agrega el token JWT a cada petición.
// - Convierte las respuestas { success, data } / { success, error } en datos o excepciones.

const TOKEN_KEY = 'taskflow_token';

// ----- Manejo del token en el navegador -----
export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  save: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Error con el código HTTP y los errores por campo que envía el backend
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details; // ej: { title: 'El título debe tener al menos 3 caracteres' }
  }
}

// Función base: apiRequest('/tasks', { method: 'POST', body: {...} })
export async function apiRequest(path, { method = 'GET', body } = {}) {
  const token = tokenStorage.get();

  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0);
  }

  // 204 No Content → no hay cuerpo que leer
  if (response.status === 204) return null;

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    // Si el token expiró o es inválido, avisamos a AuthContext para cerrar la sesión
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new ApiError(json?.error?.message || 'Error inesperado', response.status, json?.error?.details);
  }

  return json.data;
}

// Convierte { status: 'PENDIENTE', priority: '' } en "?status=PENDIENTE" (ignora vacíos)
export function toQueryString(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== '' && value != null)
  ).toString();
  return query ? `?${query}` : '';
}
