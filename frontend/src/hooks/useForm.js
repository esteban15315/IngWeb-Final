// Hook reutilizable para formularios (DRY): guarda los valores y los errores.
//
// Uso:
//   const { values, errors, setErrors, handleChange } = useForm({ email: '', password: '' });
//   <input name="email" value={values.email} onChange={handleChange} />
import { useState } from 'react';

export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  // Sirve para cualquier input: usa el atributo "name" para saber qué campo cambió
  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    // Al corregir un campo, quitamos su error
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  // Guarda los errores que vienen del servidor (err.details) o un error general
  function applyServerError(error) {
    if (error.details) setErrors(error.details);
  }

  return { values, setValues, errors, setErrors, handleChange, applyServerError };
}
