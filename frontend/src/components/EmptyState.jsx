// Mensaje cuando una lista no tiene elementos.
export default function EmptyState({ icon = '📭', title, children }) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">{icon}</span>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
