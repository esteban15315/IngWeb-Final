// SERVICE de usuarios (RF-10). Solo lo usa el rol ADMIN (las rutas lo restringen).
import { ROLES, DEFAULT_TIMEZONE } from '../constants.js';
import { AppError } from '../utils/AppError.js';
import { userRepository } from '../repositories/user.repository.js';
import { taskRepository } from '../repositories/task.repository.js';
import { hashPassword, ensureEmailIsFree } from './auth.service.js';

export const userService = {
  listUsers(auth) {
    return userRepository.findAll(auth.tenantId); // RN-01
  },

  async createUser(auth, { name, email, password, role, timezone }) {
    await ensureEmailIsFree(email); // RN-06

    return userRepository.create({
      tenantId: auth.tenantId, // RN-01: siempre la organización del ADMIN, nunca la del body
      name: name.trim(),
      email,
      passwordHash: await hashPassword(password), // RS-01
      role: role || ROLES.MEMBER,
      timezone: timezone || DEFAULT_TIMEZONE,
    });
  },

  async deleteUser(auth, userId) {
    // RN-08: un admin no puede eliminarse a sí mismo
    if (userId === auth.userId) {
      throw AppError.badRequest('No puedes eliminar tu propia cuenta');
    }

    const user = await userRepository.findById(auth.tenantId, userId);
    if (!user) throw AppError.notFound('Usuario no encontrado');

    // RN-08: sus tareas pasan al admin que lo elimina, para no perder información
    await taskRepository.reassignAll(auth.tenantId, userId, auth.userId);
    await userRepository.removeById(auth.tenantId, userId);
  },
};
