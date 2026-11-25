// Modelo Tenant (inquilino / organización). Cada organización tiene sus propios datos.
import mongoose from 'mongoose';
import { publicIdField, baseSchemaOptions } from './schemaHelpers.js';

const tenantSchema = new mongoose.Schema(
  {
    id: publicIdField,
    name: { type: String, required: true, trim: true, maxlength: 80 },
  },
  baseSchemaOptions
);

export const Tenant = mongoose.model('Tenant', tenantSchema);
