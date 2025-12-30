import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

type ErrorType = Error | string | unknown;

interface ToastOptions {
  title: string;
  description?: string;
  status?: 'info' | 'success' | 'warning' | 'error';
  duration?: number | null;
  isClosable?: boolean;
}

export function useErrorHandler() {
  const toast = useToast();

  // Normalize errors to a string message and show a toast. This helper
  // accepts Error objects, strings or unknown values and picks a sensible
  // default where necessary, ensuring consistent UI feedback across the app.
  const handleError = useCallback(
    (error: ErrorType, defaultMessage = 'An unexpected error occurred') => {
      console.error('Error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : defaultMessage;

      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      return errorMessage;
    },
    [toast]
  );

  const handleSuccess = useCallback(
    (message: string) => {
      toast({
        title: 'Success',
        description: message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    [toast]
  );

  const handleLoading = useCallback(
    (isLoading: boolean, message?: string) => {
      if (isLoading) {
        return toast({
          title: 'Loading',
          description: message || 'Processing...',
          status: 'info',
          duration: null, // Don't auto-dismiss
          isClosable: false,
        });
      }
    },
    [toast]
  );

  return {
    handleError,
    handleSuccess,
    handleLoading,
  };
}
