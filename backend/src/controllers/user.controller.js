// CONTROLLER de usuarios (solo ADMIN, ver user.routes.js).
import { userService } from '../services/user.service.js';
import { asyncHandler, sendSuccess, sendNoContent } from '../utils/http.js';

export const userController = {
  list: asyncHandler(async (req, res) => {
    sendSuccess(res, await userService.listUsers(req.auth));
  }),

  create: asyncHandler(async (req, res) => {
    sendSuccess(res, await userService.createUser(req.auth, req.body), 201);
  }),

  remove: asyncHandler(async (req, res) => {
    await userService.deleteUser(req.auth, req.params.id);
    sendNoContent(res);
  }),
};
