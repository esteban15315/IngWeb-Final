// Ayudantes HTTP reutilizables por todos los controladores (DRY).

// Envuelve un controlador async: si ocurre un error, lo pasa a next()
// para que lo maneje errorHandler (así no repetimos try/catch en cada controlador).
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Respuesta exitosa con formato estándar (RS-05): { success: true, data }
export function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

// Respuesta sin contenido (por ejemplo, después de eliminar)
export function sendNoContent(res) {
  return res.status(204).end();
}
