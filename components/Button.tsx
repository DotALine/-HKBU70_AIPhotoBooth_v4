
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'white';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyle = "px-8 py-4 rounded-2xl font-poppins font-bold transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-[14px]";
  
  const variants = {
    primary: "bg-[#215097] hover:bg-[#1a407a] text-white shadow-xl shadow-blue-900/10",
    secondary: "bg-white hover:bg-gray-50 text-[#215097] border-2 border-[#215097]/10",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg",
    white: "bg-white text-[#215097] hover:shadow-2xl shadow-lg border border-gray-100"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
};
