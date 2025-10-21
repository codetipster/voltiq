import { createContext, useContext, useState } from 'react';
import type { ReactNode, HTMLAttributes, ButtonHTMLAttributes } from 'react';
import { Button } from './Button';

interface AlertDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextValue | undefined>(undefined);

const useAlertDialogContext = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('AlertDialog components must be used within AlertDialog provider');
  }
  return context;
};

export interface AlertDialogProps {
  children: ReactNode;
}

export const AlertDialog = ({ children }: AlertDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

export interface AlertDialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
}

export const AlertDialogTrigger = ({ children, asChild, ...props }: AlertDialogTriggerProps) => {
  const { setOpen } = useAlertDialogContext();

  if (asChild && typeof children === 'object' && children !== null && 'props' in children) {
    const child = children as React.ReactElement;
    return <child.type {...(child.props || {})} onClick={() => setOpen(true)} />;
  }

  return (
    <button onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  );
};

export interface AlertDialogContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const AlertDialogContent = ({ children, className = '', ...props }: AlertDialogContentProps) => {
  const { open, setOpen } = useAlertDialogContext();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      
      {/* Content */}
      <div
        className={`relative z-50 w-full max-w-lg bg-card border border-border rounded-lg shadow-lg p-6 animate-in fade-in-0 zoom-in-95 ${className}`}
        {...props}
      >
        {children}
      </div>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in {
          from { transform: scale(0.95); }
          to { transform: scale(1); }
        }
        .animate-in {
          animation: fade-in 0.2s ease-out, zoom-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export interface AlertDialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const AlertDialogHeader = ({ children, className = '', ...props }: AlertDialogHeaderProps) => {
  return (
    <div className={`flex flex-col space-y-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

export interface AlertDialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export const AlertDialogTitle = ({ children, className = '', ...props }: AlertDialogTitleProps) => {
  return (
    <h2 className={`${className}`} {...props}>
      {children}
    </h2>
  );
};

export interface AlertDialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export const AlertDialogDescription = ({ children, className = '', ...props }: AlertDialogDescriptionProps) => {
  return (
    <p className={`text-muted-foreground ${className}`} {...props}>
      {children}
    </p>
  );
};

export interface AlertDialogFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const AlertDialogFooter = ({ children, className = '', ...props }: AlertDialogFooterProps) => {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export interface AlertDialogCancelProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const AlertDialogCancel = ({ children, ...props }: AlertDialogCancelProps) => {
  const { setOpen } = useAlertDialogContext();

  return (
    <Button variant="outline" onClick={() => setOpen(false)} {...props}>
      {children}
    </Button>
  );
};

export interface AlertDialogActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const AlertDialogAction = ({ children, onClick, ...props }: AlertDialogActionProps) => {
  const { setOpen } = useAlertDialogContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    setOpen(false);
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
};
