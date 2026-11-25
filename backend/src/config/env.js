// Lee las variables del archivo .env y las exporta en un solo objeto.
// Así el resto del código no usa process.env directamente (un solo lugar de configuración).
import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Sin secreto no se pueden firmar tokens: detenemos la app con un mensaje claro.
if (!env.jwtSecret) {
  throw new Error('Falta la variable JWT_SECRET en el archivo .env');
}
