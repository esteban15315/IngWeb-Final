// Script de datos de prueba: npm run seed
// Crea DOS organizaciones para demostrar en vivo el aislamiento de datos (RN-01).
// ⚠️ Borra todos los datos existentes de la base configurada en .env.
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { Tenant } from './models/Tenant.js';
import { User } from './models/User.js';
import { Task } from './models/Task.js';
import { hashPassword } from './services/auth.service.js';
import { ROLES, TASK_STATUS, TASK_PRIORITY } from './constants.js';

const DAY = 24 * 60 * 60 * 1000;
const daysFromNow = (days) => new Date(Date.now() + days * DAY); // fechas en UTC

async function createUser(tenant, name, email, password, role, timezone = 'America/Lima') {
  return User.create({
    tenantId: tenant.id,
    name,
    email,
    passwordHash: await hashPassword(password),
    role,
    timezone,
  });
}

async function seed() {
  await connectDB();

  // Limpiamos las colecciones
  await Promise.all([Tenant.deleteMany({}), User.deleteMany({}), Task.deleteMany({})]);

  // ----- Organización 1: Acme -----
  const acme = await Tenant.create({ name: 'Acme S.A.C.' });
  const acmeAdmin = await createUser(acme, 'Laura Admin', 'admin@acme.com', 'Admin123', ROLES.ADMIN);
  const ana = await createUser(acme, 'Ana Torres', 'ana@acme.com', 'Member123', ROLES.MEMBER);
  const luis = await createUser(acme, 'Luis Ramos', 'luis@acme.com', 'Member123', ROLES.MEMBER, 'America/Bogota');

  const base = { tenantId: acme.id, createdBy: acmeAdmin.id };
  await Task.create([
    { ...base, title: 'Diseñar la base de datos', description: 'Modelo de colecciones en MongoDB', status: TASK_STATUS.DONE, priority: TASK_PRIORITY.HIGH, dueDate: daysFromNow(-3), assigneeId: ana.id },
    { ...base, title: 'Implementar login con JWT', description: 'Middleware authenticate y bcrypt', status: TASK_STATUS.IN_PROGRESS, priority: TASK_PRIORITY.HIGH, dueDate: daysFromNow(2), assigneeId: ana.id },
    { ...base, title: 'Pantalla de dashboard', description: 'Tarjetas y gráficos de tareas', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.MEDIUM, dueDate: daysFromNow(5), assigneeId: luis.id },
    { ...base, title: 'Revisar validaciones', description: 'Cliente y servidor', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.LOW, dueDate: daysFromNow(-1), assigneeId: luis.id },
    { ...base, title: 'Preparar la sustentación', description: 'Explicar Controller - Service - Repository', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.HIGH, dueDate: daysFromNow(7), assigneeId: acmeAdmin.id },
  ]);

  // ----- Organización 2: Globex (sus datos NUNCA deben verse desde Acme) -----
  const globex = await Tenant.create({ name: 'Globex Corp' });
  const globexAdmin = await createUser(globex, 'Carlos Globex', 'admin@globex.com', 'Admin123', ROLES.ADMIN, 'Europe/Madrid');
  await Task.create([
    { tenantId: globex.id, createdBy: globexAdmin.id, assigneeId: globexAdmin.id, title: 'Tarea SECRETA de Globex', description: 'No debería verse desde Acme', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.HIGH, dueDate: daysFromNow(4) },
  ]);

  console.log('🌱 Datos de prueba creados:');
  console.table([
    { email: 'admin@acme.com', password: 'Admin123', rol: 'ADMIN', organizacion: 'Acme' },
    { email: 'ana@acme.com', password: 'Member123', rol: 'MEMBER', organizacion: 'Acme' },
    { email: 'luis@acme.com', password: 'Member123', rol: 'MEMBER', organizacion: 'Acme' },
    { email: 'admin@globex.com', password: 'Admin123', rol: 'ADMIN', organizacion: 'Globex' },
  ]);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Error en el seed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
