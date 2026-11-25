// SERVICE de autenticación: reglas de negocio de registro, login y tokens.
// No conoce Express (no usa req/res) → se puede reutilizar y probar por separado.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ROLES, DEFAULT_TIMEZONE } from '../constants.js';
import { AppError } from '../utils/AppError.js';
import { userRepository } from '../repositories/user.repository.js';
import { tenantRepository } from '../repositories/tenant.repository.js';

const SALT_ROUNDS = 10; // costo del cifrado bcrypt

// RS-01: cifra la contraseña (función reutilizada también por user.service)
export function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

// RS-02: genera el JWT. Guarda el id público, la organización y el rol.
function signToken(user) {
  return jwt.sign(
    { sub: user.id, tenantId: user.tenantId, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

// RN-06: el email no puede repetirse
export async function ensureEmailIsFree(email) {
  if (await userRepository.existsByEmail(email)) {
    throw AppError.conflict('Ya existe una cuenta con ese email', { email: 'Email ya registrado' });
  }
}

export const authService = {
  // RF-01: crea organización + primer usuario ADMIN
  async register({ organizationName, name, email, password, timezone }) {
    await ensureEmailIsFree(email);

    const tenant = await tenantRepository.create({ name: organizationName.trim() });

    try {
      const user = await userRepository.create({
        tenantId: tenant.id,
        name: name.trim(),
        email,
        passwordHash: await hashPassword(password),
        role: ROLES.ADMIN,
        timezone: timezone || DEFAULT_TIMEZONE,
      });
      return { token: signToken(user), user };
    } catch (error) {
      // Si falla la creación del usuario, no dejamos una organización "huérfana"
      await tenantRepository.removeById(tenant.id);
      throw error;
    }
  },

  // RF-02: inicio de sesión
  async login({ email, password }) {
    const user = await userRepository.findByEmailWithPassword(email);

    // Mismo mensaje si falla el email o la contraseña: no revelamos qué cuentas existen
    const isValid = user && (await bcrypt.compare(password, user.passwordHash));
    if (!isValid) throw AppError.unauthorized('Email o contraseña incorrectos');

    return { token: signToken(user), user };
  },

  // RF-03: perfil del usuario autenticado
  async getProfile(auth) {
    const user = await userRepository.findById(auth.tenantId, auth.userId);
    if (!user) throw AppError.notFound('Usuario no encontrado');
    return user;
  },
};
