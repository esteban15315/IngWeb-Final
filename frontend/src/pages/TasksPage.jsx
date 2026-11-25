// Página de tareas: CRUD completo (RF-04 a RF-08) con filtros y búsqueda.
import { useMemo, useState } from 'react';
import { tasksApi, usersApi } from '../api/services.js';
import { useAsync } from '../hooks/useAsync.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';
import Modal from '../components/Modal.jsx';
import TaskForm from '../components/TaskForm.jsx';
import TaskCard from '../components/TaskCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../constants.js';

export default function TasksPage() {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  // Filtros: estado y prioridad se envían a la API; la búsqueda se hace en el navegador
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [search, setSearch] = useState('');

  // editing: undefined = modal cerrado | null = nueva tarea | objeto = editar esa tarea
  const [editing, setEditing] = useState(undefined);

  const { data: tasks, loading, error, reload } = useAsync(
    () => tasksApi.list(filters),
    [filters.status, filters.priority]
  );

  // Solo el ADMIN necesita la lista de usuarios (para asignar y mostrar nombres)
  const { data: users } = useAsync(
    () => (isAdmin ? usersApi.list() : Promise.resolve([user])),
    [isAdmin]
  );

  // Diccionario id → nombre para mostrar el responsable de cada tarea
  const userNames = useMemo(
    () => Object.fromEntries((users || []).map((u) => [u.id, u.name])),
    [users]
  );

  const visibleTasks = (tasks || []).filter((t) =>
    t.title.toLowerCase().includes(search.trim().toLowerCase())
  );

  // ----- Acciones -----
  async function handleSave(payload) {
    if (editing) {
      await tasksApi.update(editing.id, payload);
      showToast('Tarea actualizada');
    } else {
      await tasksApi.create(payload);
      showToast('Tarea creada');
    }
    setEditing(undefined);
    reload();
  }

  // Envolvemos handleSave para mostrar un toast si falla (TaskForm muestra los errores por campo)
  async function handleSubmit(payload) {
    try {
      await handleSave(payload);
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`¿Eliminar la tarea "${task.title}"?`)) return;
    try {
      await tasksApi.remove(task.id);
      showToast('Tarea eliminada');
      reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleStatusChange(task, status) {
    try {
      await tasksApi.update(task.id, { status });
      showToast('Estado actualizado');
      reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  const updateFilter = (event) => setFilters((f) => ({ ...f, [event.target.name]: event.target.value }));

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Tareas</h1>
          <p className="muted">{isAdmin ? 'Todas las tareas de la organización' : 'Tus tareas asignadas'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing(null)}>+ Nueva tarea</button>
      </div>

      {/* Barra de filtros */}
      <div className="filters card">
        <input type="search" placeholder="🔍 Buscar por título..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Buscar" />
        <select name="status" value={filters.status} onChange={updateFilter} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select name="priority" value={filters.priority} onChange={updateFilter} aria-label="Filtrar por prioridad">
          <option value="">Todas las prioridades</option>
          {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Contenido según el estado de la carga */}
      {loading && <Spinner />}
      {!loading && error && (
        <EmptyState icon="⚠️" title="No se pudieron cargar las tareas">
          <button className="btn btn-primary" onClick={reload}>Reintentar</button>
        </EmptyState>
      )}
      {!loading && !error && visibleTasks.length === 0 && (
        <EmptyState title="No hay tareas">
          <p className="muted">Crea una nueva o cambia los filtros.</p>
        </EmptyState>
      )}
      {!loading && !error && visibleTasks.length > 0 && (
        <section className="task-grid">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              timeZone={user.timezone}
              assigneeName={isAdmin ? userNames[task.assigneeId] : null}
              onEdit={setEditing}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </section>
      )}

      {/* Modal de crear/editar */}
      {editing !== undefined && (
        <Modal title={editing ? 'Editar tarea' : 'Nueva tarea'} onClose={() => setEditing(undefined)}>
          <TaskForm task={editing} users={users || []} onSubmit={handleSubmit} onCancel={() => setEditing(undefined)} />
        </Modal>
      )}
    </>
  );
}
