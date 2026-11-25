// Modelo User. Cada usuario pertenece a un solo tenant (organización).
import mongoose from 'mongoose';
import { publicIdField, baseSchemaOptions } from './schemaHelpers.js';
import { ROLES, ROLE_VALUES, DEFAULT_TIMEZONE } from '../constants.js';

const userSchema = new mongoose.Schema(
  {
    id: publicIdField,
    tenantId: { type: String, required: true, index: true }, // RN-01
    name: { type: String, required: true, trim: true, maxlength: 60 },
    // RN-06: email único en todo el sistema (se usa para el login)
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // RS-01: solo se guarda el hash. "select: false" evita que salga en las consultas normales.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLE_VALUES, default: ROLES.MEMBER },
    // RS-04: zona horaria IANA del usuario para mostrarle las fechas en su hora local
    timezone: { type: String, default: DEFAULT_TIMEZONE },
  },
  baseSchemaOptions
);

export const User = mongoose.model('User', userSchema);
