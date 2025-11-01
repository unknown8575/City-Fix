import React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from '../constants';
import { useLocalization } from '../hooks/useLocalization';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  isValid?: boolean;
}

const Input: React.FC<InputProps> = ({ id, label, type = 'text', value, onChange, onBlur, error, isValid, placeholder, className = '', ...props }) => {
  const { lang } = useLocalization();
  const languageClass = lang === 'hi' ? 'font-sans' : '';

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className={`block text-neutral-dark-gray text-sm font-medium mb-1 ${languageClass}`}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`
            form-input
            mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm
            focus:outline-none focus:ring-2
            ${error ? 'border-red-500 focus:ring-red-500/50' : isValid ? 'border-action-green-500 focus:ring-gov-blue-500/50' : 'border-neutral-gray focus:ring-gov-blue-500/50'}
            ${languageClass} text-black bg-white
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {isValid && !error && (
          <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-action-green-500" aria-label="Input is valid" />
        )}
        {error && (
          <ExclamationCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" aria-label="Input has error" />
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className={`mt-1 text-sm text-red-500 ${languageClass}`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;