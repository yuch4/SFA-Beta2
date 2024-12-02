import React, { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  type?: string;
  as?: 'input' | 'textarea' | 'select';
  children?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  type = 'text',
  as = 'input',
  className = '',
  children,
  ...props
}) => {
  const baseClassName = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50";
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea
          className={`${baseClassName} ${className}`}
          {...(props as InputHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : as === 'select' ? (
        <select className={`${baseClassName} ${className}`} {...props}>
          {children}
        </select>
      ) : (
        <input
          type={type}
          className={`${baseClassName} ${className}`}
          {...props}
        />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormField;