import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={`w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-coral)] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
