// Campo de formulario reutilizable: etiqueta + control + mensaje de error.
// as="input" | "select" | "textarea". El resto de props se pasan al control.
//
// Ejemplo: <FormField label="Email" name="email" type="email" value={...} onChange={...} error={errors.email} />
export default function FormField({ label, error, as: Control = 'input', children, hint, ...props }) {
  const id = props.id || props.name;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Control id={id} className={error ? 'has-error' : ''} aria-invalid={Boolean(error)} {...props}>
        {children}
      </Control>
      {hint && !error && <small className="field-hint">{hint}</small>}
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}
