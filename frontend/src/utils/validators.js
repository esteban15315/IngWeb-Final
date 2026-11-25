// Validaciones en el CLIENTE (RS-05). Son las mismas reglas que el backend,
// así el usuario ve el error al instante sin esperar al servidor.
// Cada función devuelve un objeto { campo: 'mensaje' }. Si está vacío, todo es válido.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Quita las claves sin error
function clean(errors) {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
}

function textLength(value, min, max, label) {
  const length = (value || '').trim().length;
  if (length < min) return `${label} debe tener al menos ${min} caracteres`;
  if (length > max) return `${label} no puede superar ${max} caracteres`;
  return null;
}

const emailError = (value) => (EMAIL_REGEX.test(value || '') ? null : 'Email inválido');

// RN-07
function passwordError(value = '') {
  if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'La contraseña debe incluir letras y números';
  return null;
}

export function validateLogin({ email, password }) {
  return clean({
    email: emailError(email),
    password: password ? null : 'La contraseña es obligatoria',
  });
}

export function validateRegister(values) {
  return clean({
    organizationName: textLength(values.organizationName, 2, 80, 'El nombre de la organización'),
    name: textLength(values.name, 2, 60, 'El nombre'),
    email: emailError(values.email),
    password: passwordError(values.password),
  });
}

export function validateUser(values) {
  return clean({
    name: textLength(values.name, 2, 60, 'El nombre'),
    email: emailError(values.email),
    password: passwordError(values.password),
  });
}

// RN-04 y RN-05. "dueDateIso" ya viene convertida a UTC.
export function validateTask(values, dueDateIso, { mustBeFuture }) {
  let dueDate = null;
  if (!values.dueDate) dueDate = 'La fecha límite es obligatoria';
  else if (mustBeFuture && new Date(dueDateIso).getTime() <= Date.now()) dueDate = 'La fecha límite debe ser futura';

  return clean({
    title: textLength(values.title, 3, 100, 'El título'),
    description: (values.description || '').length > 500 ? 'La descripción no puede superar 500 caracteres' : null,
    dueDate,
  });
}
