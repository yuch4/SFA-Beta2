import React from 'react';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
  as?: 'input' | 'select' | 'textarea';
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  labelClassName?: string;
  className?: string;
  children?: React.ReactNode;
  readOnly?: boolean;
  placeholder?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  error,
  as = 'input',
  options = [],
  rows = 3,
  labelClassName = '',
  className = '',
  children,
  readOnly = false,
  placeholder,
}) => {
  const baseClassName = `block w-full rounded-md shadow-sm sm:text-sm ${
    error
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
  } ${className}`;

  const renderField = () => {
    const commonProps = {
      id: name,
      name,
      value: value ?? '',
      onChange,
      required,
      readOnly,
      placeholder,
      className: baseClassName,
    };

    switch (as) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
          />
        );
      case 'select':
        return (
          <select {...commonProps}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            {children}
          </select>
        );
      default:
        return (
          <input
            {...commonProps}
            type={type}
          />
        );
    }
  };

  return (
    <div>
      <label
        htmlFor={name}
        className={`block text-sm font-medium text-gray-700 text-left mb-1 ${labelClassName}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1">
        {renderField()}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormField;