// Indicador de carga. "fullScreen" lo centra en toda la pantalla.
export default function Spinner({ fullScreen = false, text = 'Cargando...' }) {
  return (
    <div className={fullScreen ? 'spinner-wrapper full' : 'spinner-wrapper'} role="status">
      <span className="spinner" />
      <span>{text}</span>
    </div>
  );
}
