// Simple button component - no external dependencies
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:opacity-90 focus:ring-primary',
    outline: 'border-2 border-border bg-transparent hover:bg-muted focus:ring-primary',
    destructive: 'bg-destructive text-destructive-foreground hover:opacity-90 focus:ring-destructive',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

