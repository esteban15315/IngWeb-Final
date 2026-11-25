// Piezas comunes a todos los modelos (DRY).
import { randomUUID } from 'node:crypto';

// Campo "id" público con UUID v4 (RS-03).
// Es lo único que ve el cliente; el _id interno de MongoDB nunca sale de la API.
export const publicIdField = {
  type: String,
  default: () => randomUUID(),
  unique: true,
  immutable: true,
};

// Opciones compartidas para todos los esquemas
export const baseSchemaOptions = {
  id: false,          // desactiva el "id" virtual de Mongoose (usamos el nuestro)
  versionKey: false,  // quita el campo __v
  timestamps: true,   // agrega createdAt y updatedAt (se guardan en UTC)
  toJSON: {
    // Se ejecuta cada vez que un documento se convierte a JSON (res.json)
    transform(doc, ret) {
      delete ret._id;          // nunca exponer la clave interna (RS-03)
      delete ret.passwordHash; // nunca exponer la contraseña cifrada (RS-01)
      return ret;
    },
  },
};
