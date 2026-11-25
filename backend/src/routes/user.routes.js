// Rutas de usuarios: /api/users/... → RF-10
// RBAC a nivel de ruta: solo el rol ADMIN puede entrar (los demás reciben 403).
import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateBody, validateIdParam } from '../middlewares/validate.js';
import { validateCreateUser } from '../validators/user.validator.js';
import { ROLES } from '../constants.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', userController.list);
router.post('/', validateBody(validateCreateUser), userController.create);
router.delete('/:id', validateIdParam, userController.remove);

export default router;
