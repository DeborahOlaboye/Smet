import { useToast } from '@/hooks/useToast';
import { Toast } from './Toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={dismiss}
        />
      ))}
    </div>
  );
}