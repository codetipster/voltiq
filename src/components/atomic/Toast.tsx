import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const toast = {
  success: (message: string) => {
    const event = new CustomEvent('toast', { detail: { message, type: 'success' } });
    window.dispatchEvent(event);
  },
  error: (message: string) => {
    const event = new CustomEvent('toast', { detail: { message, type: 'error' } });
    window.dispatchEvent(event);
  },
  info: (message: string) => {
    const event = new CustomEvent('toast', { detail: { message, type: 'info' } });
    window.dispatchEvent(event);
  },
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string; type: ToastType }>;
      addToast(customEvent.detail.message, customEvent.detail.type);
    };

    window.addEventListener('toast', handleToast);
    return () => window.removeEventListener('toast', handleToast);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

const Toaster = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--brand-sage)' }} />;
      case 'error':
        return <AlertCircle className="h-5 w-5" style={{ color: 'var(--brand-coral)' }} />;
      case 'info':
        return <Info className="h-5 w-5" style={{ color: 'var(--brand-navy)' }} />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-[var(--brand-sage)]';
      case 'error':
        return 'border-l-4 border-[var(--brand-coral)]';
      case 'info':
        return 'border-l-4 border-[var(--brand-navy)]';
    }
  };

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto bg-card border border-border rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[300px] max-w-md animate-slide-in ${getStyles(toast.type)}`}
        >
          {getIcon(toast.type)}
          <p className="flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
