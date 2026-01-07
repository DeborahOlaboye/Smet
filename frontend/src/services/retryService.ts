import { ErrorParser } from './errorParser';
import { ErrorContext } from '@/types/errors';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableErrors: string[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'NONCE_TOO_HIGH']
};

export class RetryService {
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastError: any;

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        const parsedError = ErrorParser.parseError(error, context);
        
        // Don't retry user rejections or non-retryable errors
        if (parsedError.code === 'USER_REJECTED' || 
            !finalConfig.retryableErrors.includes(parsedError.code)) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === finalConfig.maxRetries) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          finalConfig.baseDelay * Math.pow(2, attempt),
          finalConfig.maxDelay
        );

        console.log(`Retrying operation after ${delay}ms (attempt ${attempt + 1}/${finalConfig.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  static isRetryableError(error: any): boolean {
    const parsedError = ErrorParser.parseError(error);
    return DEFAULT_RETRY_CONFIG.retryableErrors.includes(parsedError.code);
  }
}