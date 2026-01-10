import { describe, it, expect } from 'vitest';
import { ErrorParser } from '../errorParser';
import { ErrorContext } from '@/types/errors';

describe('ErrorParser', () => {
  it('should parse user rejection errors correctly', () => {
    const error = new Error('User rejected the request');
    const result = ErrorParser.parseError(error);
    
    expect(result.code).toBe('USER_REJECTED');
    expect(result.userMessage).toBe('Transaction was cancelled by user');
    expect(result.severity).toBe('info');
  });

  it('should parse insufficient funds errors', () => {
    const error = new Error('insufficient funds for gas');
    const result = ErrorParser.parseError(error);
    
    expect(result.code).toBe('INSUFFICIENT_FUNDS');
    expect(result.userMessage).toBe('Insufficient funds to complete transaction');
    expect(result.severity).toBe('error');
  });

  it('should parse contract-specific errors', () => {
    const error = new Error('InsufficientPayment()');
    const context: ErrorContext = {
      operation: 'Open Reward',
      contract: 'SmetReward'
    };
    
    const result = ErrorParser.parseError(error, context);
    
    expect(result.code).toBe('INSUFFICIENT_FUNDS');
    expect(result.userMessage).toBe('Insufficient payment to open reward box');
    expect(result.context).toBe(context);
  });

  it('should handle unknown errors gracefully', () => {
    const error = new Error('Some unknown blockchain error');
    const result = ErrorParser.parseError(error);
    
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.userMessage).toBe('An unexpected error occurred. Please try again');
    expect(result.severity).toBe('error');
  });

  it('should detect user rejections correctly', () => {
    const userRejectionError = new Error('User denied transaction signature');
    const networkError = new Error('Network connection failed');
    
    expect(ErrorParser.isUserRejection(userRejectionError)).toBe(true);
    expect(ErrorParser.isUserRejection(networkError)).toBe(false);
  });

  it('should detect network errors correctly', () => {
    const networkError = new Error('Network connection timeout');
    const userError = new Error('User rejected');
    
    expect(ErrorParser.isNetworkError(networkError)).toBe(true);
    expect(ErrorParser.isNetworkError(userError)).toBe(false);
  });
});