import { createContext, useContext, ReactNode, useState, useCallback } from 'react';

type ToastStatus = 'info' | 'success' | 'warning' | 'error';

interface ToastOptions {
  title: string;
  description?: string;
  status?: ToastStatus;
  duration?: number;
  isClosable?: boolean;
}

interface Toast extends ToastOptions {
  id: string;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (options: ToastOptions) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(({
    title,
    description,
    status = 'info',
    duration = 5000,
    isClosable = true,
  }: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, title, description, status, duration, isClosable },
    ]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toastItem) => (
          <ToastItem
            key={toastItem.id}
            toast={toastItem}
            onClose={() => removeToast(toastItem.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const statusStyles = {
    info: 'bg-blue-50 border-blue-400 text-blue-800',
    success: 'bg-green-50 border-green-400 text-green-800',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    error: 'bg-red-50 border-red-400 text-red-800',
  } as const;

  return (
    <div
      className={`p-4 rounded-md border-l-4 ${
        statusStyles[toast.status || 'info']
      } shadow-md min-w-[300px] max-w-md`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium">{toast.title}</h3>
          {toast.description && (
            <p className="text-sm mt-1">{toast.description}</p>
          )}
        </div>
        {toast.isClosable && (
          <button
            onClick={onClose}
            className="ml-4 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}
