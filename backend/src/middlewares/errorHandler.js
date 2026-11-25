// Manejo centralizado de errores (RS-05 y RS-06).
// Todos los errores terminan aquí y salen con el mismo formato JSON:
// { success: false, error: { message, details } }
import { AppError } from '../utils/AppError.js';

// Ruta que no existe → 404
export function notFoundHandler(req, res, next) {
  next(AppError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let error = err;

  // JSON mal escrito en el body → 400
  if (err.type === 'entity.parse.failed') {
    error = AppError.badRequest('El cuerpo de la petición no es un JSON válido');
  }
  // Índice único duplicado en MongoDB (ej: email repetido) → 409
  else if (err.code === 11000) {
    error = AppError.conflict('El registro ya existe', err.keyValue);
  }
  // Error de validación de Mongoose (última barrera) → 400
  else if (err.name === 'ValidationError') {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.message])
    );
    error = AppError.badRequest('Datos inválidos', details);
  }

  // Cualquier otro error inesperado → 500 (sin mostrar detalles internos al cliente)
  if (!(error instanceof AppError)) {
    console.error('❌ Error no controlado:', err);
    error = new AppError(500, 'Error interno del servidor');
  }

  res.status(error.statusCode).json({
    success: false,
    error: { message: error.message, details: error.details },
  });
}
