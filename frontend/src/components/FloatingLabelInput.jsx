// Componente de Input com Floating Label
export const FloatingLabelInput = ({ 
  id, 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder = '',
  required = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`input-floating ${className}`}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || ' '}
        required={required}
        className="input-enhanced w-full text-white"
        {...props}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}

export const FloatingLabelTextarea = ({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder = '',
  required = false,
  rows = 4,
  className = '',
  ...props 
}) => {
  return (
    <div className={`input-floating ${className}`}>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder || ' '}
        required={required}
        rows={rows}
        className="input-enhanced w-full text-white"
        {...props}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}

export const FloatingLabelSelect = ({ 
  id, 
  label, 
  value, 
  onChange, 
  options = [],
  required = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`input-floating ${className}`}>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className="input-enhanced w-full text-white"
        {...props}
      >
        <option value="">Selecione...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label htmlFor={id}>{label}</label>
    </div>
  )
}

