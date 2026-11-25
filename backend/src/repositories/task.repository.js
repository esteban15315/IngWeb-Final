// REPOSITORY de tareas: única capa que accede a la colección "tasks".
//
// RN-01 (aislamiento SaaS): cada método recibe tenantId y lo pone en el filtro.
// "scope" es un filtro extra que decide el servicio según el rol (RN-02):
//   - ADMIN  → {}                        (todas las tareas de su organización)
//   - MEMBER → { assigneeId: <su id> }   (solo las suyas)
// IMPORTANTE: tenantId se escribe AL FINAL del objeto para que ningún "scope"
// o filtro pueda sobrescribirlo.
import { Task } from '../models/Task.js';
import { TASK_STATUS } from '../constants.js';

export const taskRepository = {
  create(data) {
    return Task.create(data);
  },

  // filters = { status, priority } ya validados por el servicio
  findAll(tenantId, scope = {}, filters = {}) {
    return Task.find({ ...filters, ...scope, tenantId }).sort({ dueDate: 1 });
  },

  findById(tenantId, id, scope = {}) {
    return Task.findOne({ ...scope, id, tenantId });
  },

  updateById(tenantId, id, changes) {
    return Task.findOneAndUpdate(
      { id, tenantId },
      { $set: changes },
      { new: true, runValidators: true } // devuelve la versión nueva y valida el esquema
    );
  },

  removeById(tenantId, id) {
    return Task.deleteOne({ id, tenantId });
  },

  // RN-08: pasa todas las tareas de un usuario a otro (dentro de la misma organización)
  reassignAll(tenantId, fromUserId, toUserId) {
    return Task.updateMany({ tenantId, assigneeId: fromUserId }, { $set: { assigneeId: toUserId } });
  },

  // Cuenta tareas agrupadas por un campo ("status" o "priority") para el dashboard
  countGroupedBy(tenantId, scope, field) {
    return Task.aggregate([
      { $match: { ...scope, tenantId } },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    ]);
  },

  // RN-09: tareas vencidas = fecha límite pasada y no completadas
  countOverdue(tenantId, scope, now = new Date()) {
    return Task.countDocuments({
      ...scope,
      tenantId,
      status: { $ne: TASK_STATUS.DONE },
      dueDate: { $lt: now },
    });
  },
};
