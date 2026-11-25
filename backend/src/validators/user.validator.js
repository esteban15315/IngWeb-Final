// Validación para que un ADMIN cree usuarios.
import { textLength, email, password, oneOf, collectErrors } from './rules.js';
import { ROLE_VALUES } from '../constants.js';
import { isValidTimeZone } from '../utils/dates.js';

export function validateCreateUser(body = {}) {
  return collectErrors({
    name: textLength(body.name, 2, 60, 'El nombre'),
    email: email(body.email),
    password: password(body.password), // RN-07
    role: body.role ? oneOf(body.role, ROLE_VALUES, 'El rol') : null,
    timezone: body.timezone && !isValidTimeZone(body.timezone) ? 'Zona horaria inválida' : null,
  });
}
