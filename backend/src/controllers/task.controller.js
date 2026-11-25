// CONTROLLER de tareas: traduce HTTP ↔ servicio.
// req.auth (puesto por el middleware authenticate) identifica al usuario y su organización.
import { taskService } from '../services/task.service.js';
import { asyncHandler, sendSuccess, sendNoContent } from '../utils/http.js';

export const taskController = {
  list: asyncHandler(async (req, res) => {
    sendSuccess(res, await taskService.listTasks(req.auth, req.query));
  }),

  stats: asyncHandler(async (req, res) => {
    sendSuccess(res, await taskService.getStats(req.auth));
  }),

  getOne: asyncHandler(async (req, res) => {
    sendSuccess(res, await taskService.getTask(req.auth, req.params.id));
  }),

  create: asyncHandler(async (req, res) => {
    sendSuccess(res, await taskService.createTask(req.auth, req.body), 201);
  }),

  update: asyncHandler(async (req, res) => {
    sendSuccess(res, await taskService.updateTask(req.auth, req.params.id, req.body));
  }),

  remove: asyncHandler(async (req, res) => {
    await taskService.deleteTask(req.auth, req.params.id);
    sendNoContent(res); // 204 No Content
  }),
};
