# Especificación del sistema — TaskFlow (SDD)

> Spec-Driven Development: este documento se escribió **antes** del código.
> Cada requisito tiene un código (RF-xx, RN-xx, RS-xx) que aparece en los comentarios
> del código fuente para demostrar la **trazabilidad** especificación → implementación.
> Búsqueda rápida: `grep -rn "RN-03" backend/ frontend/`

## 1. Visión general
TaskFlow es un SaaS multi-inquilino (multi-tenant) para que equipos de trabajo gestionen tareas.
Cada **organización** (inquilino / tenant) tiene sus propios usuarios y tareas, totalmente aislados
de las demás organizaciones.

## 2. Actores y roles (RBAC)
| Rol      | Descripción |
|----------|-------------|
| `ADMIN`  | Crea la organización. Gestiona usuarios, ve y gestiona **todas** las tareas de su organización y puede asignarlas a cualquier miembro. |
| `MEMBER` | Ve y gestiona **solo las tareas asignadas a él**. No puede gestionar usuarios ni asignar tareas a otros. |

## 3. Requisitos funcionales
| Código | Requisito | Criterio de aceptación |
|--------|-----------|------------------------|
| RF-01 | Registro de organización | `POST /api/auth/register` crea la organización y su primer usuario con rol `ADMIN`. Responde `201` + token. |
| RF-02 | Inicio de sesión | `POST /api/auth/login` devuelve un JWT válido por 8 h. Credenciales erróneas → `401`. |
| RF-03 | Perfil | `GET /api/auth/me` devuelve el usuario autenticado. |
| RF-04 | Listar tareas | `GET /api/tasks?status=&priority=` lista las tareas visibles para el usuario. |
| RF-05 | Crear tarea | `POST /api/tasks` → `201`. |
| RF-06 | Ver tarea | `GET /api/tasks/:id` → `200` o `404`. |
| RF-07 | Editar tarea | `PATCH /api/tasks/:id` (actualización parcial) → `200`. |
| RF-08 | Eliminar tarea | `DELETE /api/tasks/:id` → `204`. |
| RF-09 | Dashboard | `GET /api/tasks/stats` devuelve totales por estado, prioridad y vencidas. |
| RF-10 | Gestión de usuarios | `GET/POST/DELETE /api/users` solo para `ADMIN`. |

## 4. Reglas de negocio
| Código | Regla |
|--------|-------|
| RN-01 | Toda consulta de datos se filtra por el `tenantId` del token. Nunca se acepta `tenantId` desde el cliente. |
| RN-02 | Un `MEMBER` solo ve/edita/elimina tareas donde `assigneeId` = su propio id. Un `ADMIN` ve todas las de su organización. |
| RN-03 | Solo un `ADMIN` puede asignar una tarea a otro usuario; el asignado debe pertenecer a la misma organización. |
| RN-04 | La fecha límite (`dueDate`) debe ser futura al crear la tarea o al cambiarla. |
| RN-05 | Título: 3–100 caracteres. Descripción: máx. 500. Estado ∈ {PENDIENTE, EN_PROGRESO, COMPLETADA}. Prioridad ∈ {BAJA, MEDIA, ALTA}. |
| RN-06 | El email es único en todo el sistema (se usa para iniciar sesión). |
| RN-07 | Contraseña: mínimo 8 caracteres, al menos una letra y un número. |
| RN-08 | Un `ADMIN` no puede eliminarse a sí mismo. Al eliminar un usuario, sus tareas se reasignan al `ADMIN` que lo eliminó. |
| RN-09 | Una tarea está **vencida** si su `dueDate` ya pasó y su estado no es `COMPLETADA`. |

## 5. Requisitos de seguridad y calidad
| Código | Requisito |
|--------|-----------|
| RS-01 | Contraseñas cifradas con bcrypt (nunca se devuelven en la API). |
| RS-02 | Rutas protegidas con JWT (`Authorization: Bearer <token>`). Si el usuario fue eliminado, su token deja de ser válido. |
| RS-03 | Identificadores públicos UUID v4 (`id`). El `_id` interno de MongoDB nunca se expone. |
| RS-04 | Fechas guardadas en UTC y enviadas en ISO 8601 (`2026-11-24T15:00:00.000Z`). El frontend las muestra en la zona horaria del usuario (`timezone`, formato IANA, p. ej. `America/Lima`). |
| RS-05 | Validación en cliente **y** servidor. Respuestas estandarizadas: `{ success: true, data }` o `{ success: false, error: { message, details } }`. |
| RS-06 | Códigos HTTP: 200, 201, 204, 400, 401, 403, 404, 409, 500. |

## 6. Modelo de datos
```
Tenant { id: UUID, name, createdAt, updatedAt }
User   { id: UUID, tenantId: UUID, name, email, passwordHash, role, timezone, createdAt, updatedAt }
Task   { id: UUID, tenantId: UUID, title, description, status, priority,
         dueDate: Date(UTC), assigneeId: UUID, createdBy: UUID, createdAt, updatedAt }
```

## 7. Arquitectura (flujo de una petición)
```
React (pages → api/client.js)
   │  HTTP + JWT
   ▼
Express: routes → middlewares (authenticate, authorize, validate)
   ▼
Controller   → lee req, llama al servicio, responde con el código HTTP correcto
   ▼
Service      → reglas de negocio (RN-xx) y permisos por rol
   ▼
Repository   → única capa que habla con MongoDB; siempre filtra por tenantId (RN-01)
   ▼
MongoDB (Mongoose models)
```
