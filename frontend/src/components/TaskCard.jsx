// Tarjeta que muestra una tarea con acciones rápidas.
import Badge from './Badge.jsx';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../constants.js';
import { formatDateTime, isOverdue } from '../utils/dates.js';

export default function TaskCard({ task, assigneeName, timeZone, onEdit, onDelete, onStatusChange }) {
  const overdue = isOverdue(task); // RN-09

  return (
    <article className={`task-card ${overdue ? 'is-overdue' : ''} ${task.status === 'COMPLETADA' ? 'is-done' : ''}`}>
      <div className="task-card-header">
        <h3>{task.title}</h3>
        <Badge options={PRIORITY_OPTIONS} value={task.priority} />
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      <ul className="task-meta">
        <li>
          📅 {formatDateTime(task.dueDate, timeZone)}
          {overdue && <span className="badge badge-danger">Vencida</span>}
        </li>
        {assigneeName && <li>👤 {assigneeName}</li>}
      </ul>

      <div className="task-card-footer">
        {/* Cambio rápido de estado sin abrir el formulario */}
        <select
          aria-label="Cambiar estado"
          value={task.status}
          onChange={(e) => onStatusChange(task, e.target.value)}
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="task-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(task)}>Editar</button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(task)}>Eliminar</button>
        </div>
      </div>
    </article>
  );
}
