// Middlewares de seguridad: autenticación (JWT) y autorización por roles (RBAC).
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { userRepository } from '../repositories/user.repository.js';

// RS-02: verifica el token "Authorization: Bearer <token>".
// Si es válido, deja en req.auth los datos del usuario para las siguientes capas.
export async function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(AppError.unauthorized('Token no proporcionado'));
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret); // valida firma y expiración
  } catch (error) {
    const message = error.name === 'TokenExpiredError'
      ? 'La sesión expiró, inicia sesión nuevamente'
      : 'Token inválido';
    return next(AppError.unauthorized(message));
  }

  try {
    // Comprobamos que el usuario siga existiendo (si lo eliminaron, el token ya no sirve)
    // y tomamos el rol ACTUAL de la base de datos, no el que quedó guardado en el token.
    const user = await userRepository.findById(payload.tenantId, payload.sub);
    if (!user) return next(AppError.unauthorized('El usuario ya no existe'));

    req.auth = { userId: user.id, tenantId: user.tenantId, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
}

// RBAC: authorize('ADMIN') deja pasar solo a los roles indicados → si no, 403.
export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.auth?.role)) {
    return next(AppError.forbidden());
  }
  next();
};
