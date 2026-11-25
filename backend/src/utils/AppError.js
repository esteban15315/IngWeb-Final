// Error personalizado que lleva el código HTTP (RS-06).
// Los servicios lanzan AppError y el middleware errorHandler lo convierte en respuesta JSON.
export class AppError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details; // ej: { title: 'El título es obligatorio' }
  }

  // Atajos para no repetir números mágicos en todo el código
  static badRequest(message, details) { return new AppError(400, message, details); }
  static unauthorized(message = 'No autenticado') { return new AppError(401, message); }
  static forbidden(message = 'No tienes permisos para esta acción') { return new AppError(403, message); }
  static notFound(message = 'Recurso no encontrado') { return new AppError(404, message); }
  static conflict(message, details) { return new AppError(409, message, details); }
}
