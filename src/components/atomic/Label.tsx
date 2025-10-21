import React, { forwardRef } from 'react';
import type { LabelHTMLAttributes } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-foreground ${className}`}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';
