// Dashboard (RF-09): resumen con tarjetas, gráficos y próximas tareas.
import { Link } from 'react-router-dom';
import { tasksApi } from '../api/services.js';
import { useAsync } from '../hooks/useAsync.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import StatCard from '../components/StatCard.jsx';
import BarChart from '../components/BarChart.jsx';
import Badge from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../constants.js';
import { formatDateTime } from '../utils/dates.js';

const UPCOMING_LIMIT = 5;

// Convierte { PENDIENTE: 3, ... } en datos para el gráfico usando las opciones (texto y color)
function toChartData(options, counts) {
  return options.map((o) => ({ label: o.label, value: counts[o.value] ?? 0, color: o.color }));
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  // Pedimos estadísticas y tareas al mismo tiempo
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([tasksApi.stats(), tasksApi.list()]),
    []
  );

  if (loading) return <Spinner />;
  if (error) {
    return (
      <EmptyState icon="⚠️" title="No se pudo cargar el dashboard">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={reload}>Reintentar</button>
      </EmptyState>
    );
  }

  const [stats, tasks] = data;

  // Próximas tareas: no completadas y con fecha futura, ordenadas por fecha (la API ya ordena)
  const upcoming = tasks
    .filter((t) => t.status !== 'COMPLETADA' && new Date(t.dueDate) > new Date())
    .slice(0, UPCOMING_LIMIT);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Hola, {user.name.split(' ')[0]} 👋</h1>
          <p className="muted">
            {isAdmin ? 'Resumen de todas las tareas de tu organización' : 'Resumen de tus tareas asignadas'}
          </p>
        </div>
        <Link to="/tasks" className="btn btn-primary">Ver tareas</Link>
      </div>

      <section className="stats-grid">
        <StatCard icon="📋" label="Total de tareas" value={stats.total} />
        <StatCard icon="⏳" label="Pendientes" value={stats.byStatus.PENDIENTE} color="#f59e0b" />
        <StatCard icon="🚧" label="En progreso" value={stats.byStatus.EN_PROGRESO} color="#3b82f6" />
        <StatCard icon="✅" label="Completadas" value={`${stats.completionRate}%`} color="#10b981" />
        <StatCard icon="🔥" label="Vencidas" value={stats.overdue} color="#ef4444" />
      </section>

      <section className="charts-grid">
        <BarChart title="Tareas por estado" data={toChartData(STATUS_OPTIONS, stats.byStatus)} />
        <BarChart title="Tareas por prioridad" data={toChartData(PRIORITY_OPTIONS, stats.byPriority)} />
      </section>

      <section className="card">
        <h3>Próximos vencimientos</h3>
        {upcoming.length === 0 ? (
          <p className="muted">No hay tareas próximas a vencer 🎉</p>
        ) : (
          <ul className="upcoming-list">
            {upcoming.map((task) => (
              <li key={task.id}>
                <span className="upcoming-title">{task.title}</span>
                <Badge options={PRIORITY_OPTIONS} value={task.priority} />
                <span className="muted">{formatDateTime(task.dueDate, user.timezone)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
