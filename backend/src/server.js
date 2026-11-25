// Punto de entrada: conecta a MongoDB y arranca el servidor HTTP.
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

try {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`🚀 API escuchando en http://localhost:${env.port}/api`);
  });
} catch (error) {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exit(1);
}
