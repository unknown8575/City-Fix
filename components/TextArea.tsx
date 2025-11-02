import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  error?: string;
  isValid?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({ id, label, value, onChange, onBlur, error, isValid, placeholder, className = '', ...props }) => {

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-neutral-dark-gray text-sm font-medium mb-1">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={4}
        className={`
          form-textarea
          mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm
          focus:outline-none focus:ring-2
          ${error ? 'border-red-500 focus:ring-red-500/50' : isValid ? 'border-action-green-500 focus:ring-gov-blue-500/50' : 'border-neutral-gray focus:ring-gov-blue-500/50'}
          text-black bg-white
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      ></textarea>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextArea;