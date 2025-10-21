import { createContext, useContext } from 'react';
import type { HTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  className?: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

export const Tabs = ({ value, onValueChange, children, className = '', ...props }: TabsProps) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={`w-full ${className}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const TabsList = ({ children, className = '', ...props }: TabsListProps) => {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 ${className}`}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
};

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsTrigger = ({ value: triggerValue, children, className = '', ...props }: TabsTriggerProps) => {
  const { value, onValueChange } = useTabsContext();
  const isActive = value === triggerValue;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange(triggerValue)}
      className={`flex-1 flex items-center justify-center whitespace-nowrap px-4 py-2 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-coral)] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? 'bg-background shadow-sm'
          : 'text-muted-foreground hover:bg-background/50'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent = ({ value: contentValue, children, className = '', ...props }: TabsContentProps) => {
  const { value } = useTabsContext();

  if (value !== contentValue) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      className={`mt-2 focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
