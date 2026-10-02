function Input({ label, name, value, error, onChange, onBlur }) {
  const inputId = `form-${name}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="field-group">
      <label htmlFor={inputId}>{label}</label>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        autoComplete={name === 'firstName' ? 'given-name' : name === 'lastName' ? 'family-name' : name}
        id={inputId}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        type="text"
        value={value}
      />
      {error && <p className="field-error" id={errorId}>{error}</p>}
    </div>
  );
}

export default Input;