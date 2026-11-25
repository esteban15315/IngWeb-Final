// Rutas de autenticación: /api/auth/...
import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { validateRegister, validateLogin } from '../validators/auth.validator.js';

const router = Router();

// Orden de ejecución: middleware(s) de validación → controlador
router.post('/register', validateBody(validateRegister), authController.register); // RF-01
router.post('/login', validateBody(validateLogin), authController.login);          // RF-02
router.get('/me', authenticate, authController.me);                                // RF-03

export default router;
