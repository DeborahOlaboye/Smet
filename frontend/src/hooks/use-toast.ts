import { useToast as useToastOriginal } from '@/components/ui/Toast';

export interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const { addToast } = useToastOriginal();

  const toast = (props: ToastProps) => {
    addToast({
      type: props.variant === 'destructive' ? 'error' : 'success',
      title: props.title,
      message: props.description,
    });
  };

  return { toast };
}
