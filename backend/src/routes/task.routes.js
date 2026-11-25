// Rutas de tareas: /api/tasks/...
// Todas requieren token. Ambos roles pueden usarlas; el SERVICIO limita qué tareas
// ve/modifica cada rol (RN-02) y quién puede asignar a otros (RN-03).
import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validateBody, validateIdParam } from '../middlewares/validate.js';
import { validateTask } from '../validators/task.validator.js';

const router = Router();

router.use(authenticate); // RS-02: protege todas las rutas de este archivo

router.get('/', taskController.list);                                                        // RF-04
router.get('/stats', taskController.stats);                                                  // RF-09
router.get('/:id', validateIdParam, taskController.getOne);                                  // RF-06
router.post('/', validateBody(validateTask), taskController.create);                         // RF-05
router.patch('/:id', validateIdParam, validateBody(validateTask, { partial: true }), taskController.update); // RF-07
router.delete('/:id', validateIdParam, taskController.remove);                               // RF-08

export default router;
