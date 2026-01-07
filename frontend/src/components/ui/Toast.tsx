import { useState, useEffect } from 'react';
import { ToastProps } from '@/types/toast';

interface ToastComponentProps {
  toast: ToastProps;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(toast.id), 150);
  };

  const getVariantStyles = () => {
    switch (toast.variant) {
      case 'destructive':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-white border-gray-200 text-gray-900';
    }
  };

  const getIcon = () => {
    switch (toast.variant) {
      case 'destructive':
        return '❌';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`
        relative flex w-full max-w-sm items-center space-x-4 overflow-hidden rounded-md border p-4 shadow-lg
        transition-all duration-300 ease-in-out
        ${getVariantStyles()}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex-shrink-0 text-lg">
        {getIcon()}
      </div>
      
      <div className="flex-1 space-y-1">
        {toast.title && (
          <div className="text-sm font-semibold">
            {toast.title}
          </div>
        )}
        {toast.description && (
          <div className="text-sm opacity-90">
            {toast.description}
          </div>
        )}
      </div>

      {toast.action && (
        <div className="flex-shrink-0">
          {toast.action}
        </div>
      )}

      <button
        onClick={handleDismiss}
        className="flex-shrink-0 rounded-md p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        <span className="sr-only">Dismiss</span>
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}