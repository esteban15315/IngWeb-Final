// Etiqueta de color para estado/prioridad.
// Recibe la lista de opciones (STATUS_OPTIONS o PRIORITY_OPTIONS) y el valor.
import { findOption } from '../constants.js';

export default function Badge({ options, value }) {
  const option = findOption(options, value);
  return (
    <span className="badge" style={{ background: `${option.color}22`, color: option.color }}>
      {option.label}
    </span>
  );
}
