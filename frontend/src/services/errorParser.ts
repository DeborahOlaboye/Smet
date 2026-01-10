import { ErrorCode, ParsedError, ErrorContext } from '@/types/errors';
import { getContractErrorMapping } from '@/config/errorMappings';

export class ErrorParser {
  private static errorMappings: Record<string, { code: ErrorCode; userMessage: string; severity: 'error' | 'warning' | 'info' }> = {
    'User rejected': {
      code: 'USER_REJECTED',
      userMessage: 'Transaction was cancelled by user',
      severity: 'info'
    },
    'insufficient funds': {
      code: 'INSUFFICIENT_FUNDS',
      userMessage: 'Insufficient funds to complete transaction',
      severity: 'error'
    },
    'network error': {
      code: 'NETWORK_ERROR',
      userMessage: 'Network connection error. Please try again',
      severity: 'error'
    },
    'execution reverted': {
      code: 'CONTRACT_REVERT',
      userMessage: 'Transaction failed. Please check your inputs',
      severity: 'error'
    },
    'invalid parameters': {
      code: 'INVALID_PARAMS',
      userMessage: 'Invalid transaction parameters',
      severity: 'error'
    },
    'timeout': {
      code: 'TIMEOUT',
      userMessage: 'Transaction timed out. Please try again',
      severity: 'warning'
    },
    'wallet not connected': {
      code: 'WALLET_NOT_CONNECTED',
      userMessage: 'Please connect your wallet first',
      severity: 'warning'
    },
    'wrong network': {
      code: 'WRONG_NETWORK',
      userMessage: 'Please switch to the correct network',
      severity: 'warning'
    },
    'gas limit exceeded': {
      code: 'GAS_LIMIT_EXCEEDED',
      userMessage: 'Transaction requires more gas. Try increasing gas limit',
      severity: 'error'
    },
    'nonce too high': {
      code: 'NONCE_TOO_HIGH',
      userMessage: 'Transaction nonce error. Please reset your wallet',
      severity: 'error'
    },
    'replacement transaction underpriced': {
      code: 'REPLACEMENT_UNDERPRICED',
      userMessage: 'Transaction replacement fee too low',
      severity: 'error'
    }
  };

  static parseError(error: any, context?: ErrorContext): ParsedError {
    const errorMessage = this.extractErrorMessage(error);
    
    // Try contract-specific error mapping first
    if (context?.contract) {
      const contractMapping = getContractErrorMapping(context.contract, errorMessage);
      if (contractMapping) {
        return {
          code: contractMapping.code,
          originalMessage: errorMessage,
          userMessage: contractMapping.userMessage,
          severity: contractMapping.severity,
          context
        };
      }
    }
    
    // Fall back to general error mapping
    const mapping = this.findErrorMapping(errorMessage);

    return {
      code: mapping.code,
      originalMessage: errorMessage,
      userMessage: mapping.userMessage,
      severity: mapping.severity,
      context
    };
  }

  private static extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.reason) return error.reason;
    if (error?.data?.message) return error.data.message;
    if (error?.error?.message) return error.error.message;
    return 'Unknown error occurred';
  }

  private static findErrorMapping(message: string): { code: ErrorCode; userMessage: string; severity: 'error' | 'warning' | 'info' } {
    const lowerMessage = message.toLowerCase();
    
    for (const [key, mapping] of Object.entries(this.errorMappings)) {
      if (lowerMessage.includes(key.toLowerCase())) {
        return mapping;
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      userMessage: 'An unexpected error occurred. Please try again',
      severity: 'error'
    };
  }

  static isUserRejection(error: any): boolean {
    const message = this.extractErrorMessage(error).toLowerCase();
    return message.includes('user rejected') || message.includes('user denied');
  }

  static isNetworkError(error: any): boolean {
    const message = this.extractErrorMessage(error).toLowerCase();
    return message.includes('network') || message.includes('connection');
  }
}