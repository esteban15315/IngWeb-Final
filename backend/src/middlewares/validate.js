// Middlewares de validación: se ejecutan ANTES del controlador.
// Si hay errores, cortan la petición con 400 y la lista de errores por campo.
import { AppError } from '../utils/AppError.js';
import { UUID_REGEX } from '../validators/rules.js';

// validateBody(validateTask, { partial: true }) → valida req.body con esa función
export const validateBody = (validatorFn, options) => (req, res, next) => {
  const errors = validatorFn(req.body ?? {}, options);
  if (Object.keys(errors).length > 0) {
    return next(AppError.badRequest('Datos inválidos', errors));
  }
  next();
};

// Verifica que el :id de la URL sea un UUID válido (RS-03)
export function validateIdParam(req, res, next) {
  if (!UUID_REGEX.test(req.params.id)) {
    return next(AppError.badRequest('Identificador inválido'));
  }
  next();
}
