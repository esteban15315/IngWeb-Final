// Tarjeta con un número destacado para el dashboard.
export default function StatCard({ label, value, color = 'var(--primary)', icon }) {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <span className="stat-icon" aria-hidden="true">{icon}</span>
      <span className="stat-value" style={{ color }}>{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
