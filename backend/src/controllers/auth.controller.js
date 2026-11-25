// CONTROLLER de autenticación.
// Responsabilidad única: leer la petición, llamar al servicio y responder con el código HTTP.
// No contiene reglas de negocio (esas están en auth.service.js).
import { authService } from '../services/auth.service.js';
import { asyncHandler, sendSuccess } from '../utils/http.js';

export const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 201); // 201 Created
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.auth);
    sendSuccess(res, user);
  }),
};
