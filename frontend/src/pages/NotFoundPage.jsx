// Página 404 del frontend.
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';

export default function NotFoundPage() {
  return (
    <div className="auth-page">
      <EmptyState icon="🧭" title="Página no encontrada">
        <Link to="/" className="btn btn-primary">Volver al inicio</Link>
      </EmptyState>
    </div>
  );
}
