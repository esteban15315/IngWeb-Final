// Notificaciones emergentes (toasts) para dar retroalimentación al usuario.
// Uso: const { showToast } = useToast(); showToast('Tarea creada');
//      showToast('Algo falló', 'error');
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);
const TOAST_DURATION_MS = 3500;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type }]);
    // Se borra sola después de unos segundos
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* aria-live: los lectores de pantalla anuncian los mensajes */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'error' ? '⚠️' : '✅'} {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
