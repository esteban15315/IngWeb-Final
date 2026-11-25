// Validaciones de los datos de autenticación (RS-05: validación en el servidor).
import { textLength, email, password, collectErrors } from './rules.js';
import { isValidTimeZone } from '../utils/dates.js';

export function validateRegister(body = {}) {
  return collectErrors({
    organizationName: textLength(body.organizationName, 2, 80, 'El nombre de la organización'),
    name: textLength(body.name, 2, 60, 'El nombre'),
    email: email(body.email),
    password: password(body.password), // RN-07
    timezone: body.timezone && !isValidTimeZone(body.timezone) ? 'Zona horaria inválida' : null,
  });
}

export function validateLogin(body = {}) {
  return collectErrors({
    email: email(body.email),
    password: typeof body.password === 'string' && body.password ? null : 'La contraseña es obligatoria',
  });
}
