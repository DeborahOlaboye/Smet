import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastProps, ToastVariant } from '@/types/toast';

interface ToastContextType {
  toasts: ToastProps[];
  toast: (props: Omit<ToastProps, 'id'>) => void;
  dismiss: (toastId: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const dismiss = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  const toast = useCallback(({
    title,
    description,
    variant = 'default',
    duration = 5000,
    action,
  }: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((prev) => [
      ...prev,
      { id, title, description, variant, duration, action },
    ]);

    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  const success = useCallback((title: string, description?: string) => {
    toast({ title, description, variant: 'success' });
  }, [toast]);

  const error = useCallback((title: string, description?: string) => {
    toast({ title, description, variant: 'destructive' });
  }, [toast]);

  const warning = useCallback((title: string, description?: string) => {
    toast({ title, description, variant: 'warning' });
  }, [toast]);

  const info = useCallback((title: string, description?: string) => {
    toast({ title, description, variant: 'default' });
  }, [toast]);

  return (
    <ToastContext.Provider value={{
      toasts,
      toast,
      dismiss,
      success,
      error,
      warning,
      info,
    }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}