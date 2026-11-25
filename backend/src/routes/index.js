// Junta todas las rutas bajo el prefijo /api
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import taskRoutes from './task.routes.js';
import userRoutes from './user.routes.js';
import { sendSuccess } from '../utils/http.js';

const router = Router();

// Ruta simple para comprobar que la API está viva
router.get('/health', (req, res) => sendSuccess(res, { status: 'ok', time: new Date().toISOString() }));

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);

export default router;
