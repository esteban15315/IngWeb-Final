// Modelo Task (tarea).
import mongoose from 'mongoose';
import { publicIdField, baseSchemaOptions } from './schemaHelpers.js';
import { TASK_STATUS, STATUS_VALUES, TASK_PRIORITY, PRIORITY_VALUES } from '../constants.js';

const taskSchema = new mongoose.Schema(
  {
    id: publicIdField,
    tenantId: { type: String, required: true }, // RN-01: a qué organización pertenece
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 }, // RN-05
    description: { type: String, trim: true, maxlength: 500, default: '' },
    status: { type: String, enum: STATUS_VALUES, default: TASK_STATUS.PENDING },
    priority: { type: String, enum: PRIORITY_VALUES, default: TASK_PRIORITY.MEDIUM },
    dueDate: { type: Date, required: true }, // RS-04: se guarda en UTC
    assigneeId: { type: String, required: true }, // id (UUID) del usuario responsable
    createdBy: { type: String, required: true },  // id (UUID) de quien la creó
  },
  baseSchemaOptions
);

// Índice compuesto: acelera las consultas filtradas por organización y responsable
taskSchema.index({ tenantId: 1, assigneeId: 1, dueDate: 1 });

export const Task = mongoose.model('Task', taskSchema);
