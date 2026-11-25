// REPOSITORY de usuarios: única capa que accede a la colección "users".
//
// RN-01 (aislamiento SaaS): todos los métodos reciben tenantId como PRIMER parámetro
// y lo agregan al filtro. Así es imposible consultar usuarios de otra organización.
// Única excepción: findByEmailWithPassword, porque en el login aún no sabemos
// a qué organización pertenece la persona (el email es único global, RN-06).
import { User } from '../models/User.js';

export const userRepository = {
  create(data) {
    return User.create(data);
  },

  // Login: busca por email e incluye el hash (que normalmente está oculto)
  findByEmailWithPassword(email) {
    return User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  },

  existsByEmail(email) {
    return User.exists({ email: email.toLowerCase() });
  },

  findById(tenantId, id) {
    return User.findOne({ id, tenantId });
  },

  findAll(tenantId) {
    return User.find({ tenantId }).sort({ createdAt: 1 });
  },

  removeById(tenantId, id) {
    return User.deleteOne({ id, tenantId });
  },
};
