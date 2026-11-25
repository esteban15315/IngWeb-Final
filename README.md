# ✔ TaskFlow — SaaS de gestión de tareas (MERN)

Proyecto final de Ingeniería Web. Aplicación **multi-inquilino** (cada organización ve solo sus datos)
construida con **MongoDB + Express + React + Node.js**, con autenticación JWT y control de acceso por roles.

---

## 🚀 Cómo ejecutarlo

**Requisitos:** Node.js 18+ y MongoDB corriendo en `localhost:27017`.

```bash
# 1) Backend (terminal 1)
cd backend
npm install
cp .env.example .env      # (ya viene un .env de desarrollo)
npm run seed              # crea datos de prueba (¡borra la base taskflow!)
npm run dev               # API en http://localhost:4000/api

# 2) Frontend (terminal 2)
cd frontend
npm install
npm run dev               # App en http://localhost:5173
```

### Usuarios de prueba (`npm run seed`)
| Email | Contraseña | Rol | Organización |
|-------|-----------|-----|--------------|
| admin@acme.com | Admin123 | ADMIN | Acme |
| ana@acme.com | Member123 | MEMBER | Acme |
| luis@acme.com | Member123 | MEMBER | Acme |
| admin@globex.com | Admin123 | ADMIN | Globex |

---

## 🗂️ Estructura del proyecto

```
specs/SPEC.md            ← Especificación SDD (requisitos RF, reglas RN, seguridad RS)
backend/src/
  config/                ← variables de entorno y conexión a MongoDB
  models/                ← esquemas Mongoose (Tenant, User, Task)
  repositories/          ← ÚNICA capa que habla con MongoDB (filtra por tenantId)
  services/              ← reglas de negocio y permisos por rol
  controllers/           ← traducen HTTP ↔ servicio
  routes/                ← endpoints + middlewares
  middlewares/           ← authenticate (JWT), authorize (RBAC), validate, errorHandler
  validators/            ← validación de datos del servidor
  utils/                 ← AppError, respuestas HTTP, fechas, pick
  seed.js                ← datos de prueba
frontend/src/
  api/                   ← cliente HTTP con JWT + funciones por endpoint
  context/               ← AuthContext (sesión) y ToastContext (notificaciones)
  hooks/                 ← useAsync (carga de datos) y useForm (formularios)
  components/            ← componentes reutilizables (TaskCard, Modal, BarChart, FormField...)
  pages/                 ← Login, Registro, Dashboard, Tareas, Usuarios
  utils/                 ← fechas con zona horaria y validaciones del cliente
```

## 🔄 Flujo de una petición (ejemplo: crear tarea)

```
TaskForm.jsx  → valida en el cliente → tasksApi.create() → fetch POST /api/tasks + JWT
  ↓
task.routes.js → authenticate (verifica JWT) → validateBody(validateTask)
  ↓
task.controller.create → taskService.createTask(req.auth, req.body)
  ↓
task.service → pick() (lista blanca) → RN-04 fecha futura → RN-03 resolveAssignee
  ↓
task.repository.create → MongoDB (con tenantId del token, nunca del body)
  ↓
201 { success: true, data: { id: "uuid", ... } } → toast "Tarea creada" en pantalla
```

---

## ✅ Cómo cumple cada criterio de la rúbrica

### 1. Demostración funcional del stack MERN (peso 6)
- CRUD completo de tareas: `GET/POST/PATCH/DELETE /api/tasks` + estadísticas.
- Validación en **cliente** ([frontend/src/utils/validators.js](frontend/src/utils/validators.js)) y **servidor** ([backend/src/validators/](backend/src/validators/)).
- Respuestas estandarizadas `{ success, data }` / `{ success, error: { message, details } }` y códigos HTTP 200, 201, 204, 400, 401, 403, 404, 409, 500 ([errorHandler.js](backend/src/middlewares/errorHandler.js)).
- Errores por campo mostrados debajo de cada input + toasts.

### 2. Arquitectura y dominio (peso 6)
- Capas **Controller → Service → Repository** separadas (ver diagrama arriba).
- **SDD**: [specs/SPEC.md](specs/SPEC.md) define requisitos con códigos. El código los cita en comentarios para trazabilidad.
  Prueba: `grep -rn "RN-02" backend/src` muestra dónde se implementa cada regla.

### 3. Seguridad JWT / RBAC y aislamiento SaaS (peso 4)
- **JWT** firmado con expiración ([auth.service.js](backend/src/services/auth.service.js)); contraseñas con **bcrypt**.
- `authenticate` verifica el token **y** que el usuario siga existiendo ([middlewares/auth.js](backend/src/middlewares/auth.js)).
- **RBAC en rutas**: `/api/users` solo `ADMIN` (`authorize`). **RBAC en servicios**: `buildScope()` hace que un `MEMBER` solo vea sus tareas.
- **Aislamiento por tenant**: todos los métodos de [repositories/](backend/src/repositories/) reciben `tenantId` y lo ponen al final del filtro.
- **Demo en vivo**: entra como `admin@globex.com` → solo ves la "Tarea SECRETA de Globex". Entra como `admin@acme.com` → nunca la ves.

### 4. Frontend y UI/UX (peso 3)
- SPA en React con componentes reutilizables (`FormField`, `Modal`, `Badge`, `StatCard`, `BarChart`, `TaskCard`...) y hooks propios (`useAsync`, `useForm`).
- Estado global con Context (sesión y notificaciones).
- Spinners de carga, toasts, estados vacíos, confirmaciones, dashboard con gráficos.
- Responsivo (móvil/tablet/escritorio) y modo oscuro automático.

### 5. Calidad de código (peso 2)
- **UUID públicos** (`id`); el `_id` de MongoDB nunca sale de la API ([schemaHelpers.js](backend/src/models/schemaHelpers.js)).
- **Fechas** en UTC/ISO 8601 en el servidor; el frontend las convierte a la zona horaria del usuario ([frontend/src/utils/dates.js](frontend/src/utils/dates.js)).
- **DRY**: `asyncHandler`, `sendSuccess`, `AppError`, `pick`, `useAsync`, `useForm`, constantes compartidas.
- **SOLID**: cada capa tiene una sola responsabilidad; los servicios no conocen Express.
- Nomenclatura consistente: `camelCase` en código, `*.service.js`, `*.repository.js`, `*.controller.js`.

---

## 📡 Endpoints

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| POST | `/api/auth/register` | público | Crea organización + ADMIN |
| POST | `/api/auth/login` | público | Devuelve JWT |
| GET | `/api/auth/me` | autenticado | Perfil |
| GET | `/api/tasks?status=&priority=` | ADMIN / MEMBER | Lista (MEMBER: solo las suyas) |
| GET | `/api/tasks/stats` | ADMIN / MEMBER | Datos del dashboard |
| GET | `/api/tasks/:id` | ADMIN / MEMBER | Detalle |
| POST | `/api/tasks` | ADMIN / MEMBER | Crear |
| PATCH | `/api/tasks/:id` | ADMIN / MEMBER | Editar |
| DELETE | `/api/tasks/:id` | ADMIN / MEMBER | Eliminar |
| GET | `/api/users` | ADMIN | Listar usuarios |
| POST | `/api/users` | ADMIN | Crear usuario |
| DELETE | `/api/users/:id` | ADMIN | Eliminar usuario (reasigna sus tareas) |
