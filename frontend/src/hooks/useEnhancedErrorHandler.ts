import { useCallback } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { ErrorParser } from '@/services/errorParser';
import { RetryService } from '@/services/retryService';
import { ErrorContext } from '@/types/errors';

export function useErrorHandler() {
  const { addNotification } = useNotifications();

  const handleError = useCallback((error: any, context?: ErrorContext) => {
    console.error('Contract error:', error, context);
    
    const parsedError = ErrorParser.parseError(error, context);
    addNotification(parsedError);
    
    return parsedError;
  }, [addNotification]);

  const handleContractCall = useCallback(async <T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    enableRetry: boolean = true
  ): Promise<T | null> => {
    try {
      if (enableRetry) {
        return await RetryService.executeWithRetry(operation, context);
      } else {
        return await operation();
      }
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  const isUserRejection = useCallback((error: any): boolean => {
    return ErrorParser.isUserRejection(error);
  }, []);

  const isNetworkError = useCallback((error: any): boolean => {
    return ErrorParser.isNetworkError(error);
  }, []);

  return {
    handleError,
    handleContractCall,
    isUserRejection,
    isNetworkError
  };
}