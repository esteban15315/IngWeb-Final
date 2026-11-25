// Configuración de la aplicación Express (sin arrancar el servidor).
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors({ origin: env.corsOrigin }));   // permite peticiones desde el frontend
app.use(express.json({ limit: '100kb' }));   // convierte el body JSON en req.body

app.use('/api', routes);                     // todas las rutas de la API

app.use(notFoundHandler);                    // 404 para rutas desconocidas
app.use(errorHandler);                       // manejo central de errores (siempre al final)

export default app;
