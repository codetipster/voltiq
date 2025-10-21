import React, { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const variants = {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      outline: 'border-2 bg-transparent',
    };

    return (
      <div
        ref={ref}
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs transition-colors ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';
