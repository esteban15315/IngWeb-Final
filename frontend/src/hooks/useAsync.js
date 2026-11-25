// Hook reutilizable para cargar datos de la API (DRY).
// Maneja por nosotros los 3 estados de toda petición: cargando, datos y error.
//
// Uso:
//   const { data, loading, error, reload } = useAsync(() => tasksApi.list(), []);
import { useCallback, useEffect, useState } from 'react';

export function useAsync(asyncFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(asyncFn, deps);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await run());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [run]);

  // Se ejecuta al montar el componente y cada vez que cambian las dependencias
  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
