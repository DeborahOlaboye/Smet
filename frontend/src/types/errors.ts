export interface ContractError {
  code: string;
  message: string;
  userMessage: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ErrorContext {
  operation: string;
  contract?: string;
  function?: string;
  userAddress?: string;
}

export type ErrorCode = 
  | 'USER_REJECTED'
  | 'INSUFFICIENT_FUNDS'
  | 'NETWORK_ERROR'
  | 'CONTRACT_REVERT'
  | 'INVALID_PARAMS'
  | 'TIMEOUT'
  | 'UNKNOWN_ERROR'
  | 'WALLET_NOT_CONNECTED'
  | 'WRONG_NETWORK'
  | 'GAS_LIMIT_EXCEEDED'
  | 'NONCE_TOO_HIGH'
  | 'REPLACEMENT_UNDERPRICED';

export interface ParsedError {
  code: ErrorCode;
  originalMessage: string;
  userMessage: string;
  severity: 'error' | 'warning' | 'info';
  context?: ErrorContext;
}