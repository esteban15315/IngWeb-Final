// SERVICE de tareas: aquí viven las reglas de negocio (RN-xx) y los permisos por rol.
// El controlador le pasa "auth" = { userId, tenantId, role } que viene del JWT.
import { ROLES, TASK_STATUS, STATUS_VALUES, PRIORITY_VALUES } from '../constants.js';
import { AppError } from '../utils/AppError.js';
import { parseIsoDate, isFutureDate } from '../utils/dates.js';
import { pick } from '../utils/object.js';
import { taskRepository } from '../repositories/task.repository.js';
import { userRepository } from '../repositories/user.repository.js';

// Campos que el cliente puede enviar. Todo lo demás (tenantId, createdBy, id...) se ignora.
const EDITABLE_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate', 'assigneeId'];

// RN-02: qué tareas puede ver cada rol (RBAC a nivel de servicio)
function buildScope(auth) {
  return auth.role === ROLES.ADMIN ? {} : { assigneeId: auth.userId };
}

// RN-04: la fecha límite debe ser futura
function ensureFutureDueDate(date) {
  if (!isFutureDate(date)) {
    throw AppError.badRequest('Datos inválidos', { dueDate: 'La fecha límite debe ser futura' });
  }
}

// RN-03: decide a quién se asigna la tarea
async function resolveAssignee(auth, requestedId) {
  // Un MEMBER solo puede asignarse tareas a sí mismo
  if (auth.role !== ROLES.ADMIN) {
    if (requestedId && requestedId !== auth.userId) {
      throw AppError.forbidden('Solo un administrador puede asignar tareas a otros usuarios');
    }
    return auth.userId;
  }

  // Un ADMIN puede asignar a cualquiera… pero solo de SU organización
  if (!requestedId) return auth.userId;
  const assignee = await userRepository.findById(auth.tenantId, requestedId);
  if (!assignee) {
    throw AppError.badRequest('Datos inválidos', {
      assigneeId: 'El usuario asignado no existe en tu organización',
    });
  }
  return requestedId;
}

// Convierte el resultado de aggregate [{_id:'ALTA', count:2}] en { BAJA:0, MEDIA:0, ALTA:2 }
function toCountMap(groups, keys) {
  const result = Object.fromEntries(keys.map((key) => [key, 0]));
  for (const group of groups) result[group._id] = group.count;
  return result;
}

export const taskService = {
  // RF-04
  listTasks(auth, query = {}) {
    const filters = {};
    if (query.status) {
      if (!STATUS_VALUES.includes(query.status)) throw AppError.badRequest('Filtro de estado inválido');
      filters.status = query.status;
    }
    if (query.priority) {
      if (!PRIORITY_VALUES.includes(query.priority)) throw AppError.badRequest('Filtro de prioridad inválido');
      filters.priority = query.priority;
    }
    return taskRepository.findAll(auth.tenantId, buildScope(auth), filters);
  },

  // RF-06: si la tarea es de otra organización u otro miembro, respondemos 404
  // (no 403) para no revelar que existe.
  async getTask(auth, taskId) {
    const task = await taskRepository.findById(auth.tenantId, taskId, buildScope(auth));
    if (!task) throw AppError.notFound('Tarea no encontrada');
    return task;
  },

  // RF-05
  async createTask(auth, body) {
    const data = pick(body, EDITABLE_FIELDS);
    const dueDate = parseIsoDate(data.dueDate);
    ensureFutureDueDate(dueDate); // RN-04

    return taskRepository.create({
      ...data,
      dueDate,
      assigneeId: await resolveAssignee(auth, data.assigneeId), // RN-03
      tenantId: auth.tenantId, // RN-01
      createdBy: auth.userId,
    });
  },

  // RF-07: actualización parcial
  async updateTask(auth, taskId, body) {
    const current = await this.getTask(auth, taskId); // valida que exista y que pueda verla
    const changes = pick(body, EDITABLE_FIELDS);

    if (changes.dueDate !== undefined) {
      changes.dueDate = parseIsoDate(changes.dueDate);
      // RN-04: solo se exige fecha futura si realmente se cambió
      if (changes.dueDate.getTime() !== current.dueDate.getTime()) {
        ensureFutureDueDate(changes.dueDate);
      }
    }

    if (changes.assigneeId !== undefined) {
      changes.assigneeId = await resolveAssignee(auth, changes.assigneeId); // RN-03
    }

    return taskRepository.updateById(auth.tenantId, taskId, changes);
  },

  // RF-08
  async deleteTask(auth, taskId) {
    await this.getTask(auth, taskId); // 404 si no existe o no le pertenece
    await taskRepository.removeById(auth.tenantId, taskId);
  },

  // RF-09: estadísticas para el dashboard (respetan el mismo scope por rol)
  async getStats(auth) {
    const scope = buildScope(auth);
    const [byStatusRaw, byPriorityRaw, overdue] = await Promise.all([
      taskRepository.countGroupedBy(auth.tenantId, scope, 'status'),
      taskRepository.countGroupedBy(auth.tenantId, scope, 'priority'),
      taskRepository.countOverdue(auth.tenantId, scope),
    ]);

    const byStatus = toCountMap(byStatusRaw, STATUS_VALUES);
    const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);
    const completionRate = total === 0 ? 0 : Math.round((byStatus[TASK_STATUS.DONE] / total) * 100);

    return {
      total,
      overdue,
      completionRate, // porcentaje de tareas completadas
      byStatus,
      byPriority: toCountMap(byPriorityRaw, PRIORITY_VALUES),
    };
  },
};
