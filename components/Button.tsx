
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'warning' | 'outline' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ children, onClick, type = 'button', variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'px-6 py-3 font-semibold rounded-lg transition ease-in-out duration-150 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gov-blue-500 text-neutral-white hover:bg-gov-blue-900 focus:ring-gov-blue-500/50',
    secondary: 'bg-action-green-500 text-neutral-white hover:bg-green-600 focus:ring-action-green-500/50',
    warning: 'bg-warning-orange-500 text-neutral-white hover:bg-orange-600 focus:ring-warning-orange-500/50',
    outline: 'border-2 border-gov-blue-500 text-gov-blue-500 hover:bg-gov-blue-500 hover:text-neutral-white focus:ring-gov-blue-500/50',
    ghost: 'bg-transparent text-neutral-dark-gray hover:bg-neutral-gray',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className} min-w-[44px] min-h-[44px]`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
