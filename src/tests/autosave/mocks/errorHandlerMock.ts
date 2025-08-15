/**
 * Mock implementation of autosaveErrorHandler for testing
 */

// Mock error categories
export enum ErrorCategory {
  NETWORK = 'network',
  STORAGE = 'storage',
  PERMISSION = 'permission',
  TIMEOUT = 'timeout',  // Added for tests
  SYNC = 'sync',        // Added for tests
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

// Mock error severities
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Mock AutosaveError class
export class AutosaveError extends Error {
  originalError: Error;
  category: ErrorCategory;
  severity: ErrorSeverity;
  userMessage: string;
  recoveryAction: (() => Promise<void>) | undefined;

  constructor(
    originalError: Error,
    category: ErrorCategory,
    severity: ErrorSeverity,
    userMessage: string,
    recoveryAction?: () => Promise<void>
  ) {
    super(userMessage);
    this.name = 'AutosaveError';
    this.originalError = originalError;
    this.category = category;
    this.severity = severity;
    this.userMessage = userMessage;
    this.recoveryAction = recoveryAction;
  }
}

// Mock categorizeError function
export const categorizeError = (error: Error): ErrorCategory => {
  const errorName = error.name.toLowerCase();
  const errorMessage = error.message.toLowerCase();

  if (errorName.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
    return ErrorCategory.NETWORK;
  }

  if (errorName.includes('quota') || errorName.includes('storage') || errorMessage.includes('storage')) {
    return ErrorCategory.STORAGE;
  }

  if (errorName.includes('permission') || errorName.includes('not allowed')) {
    return ErrorCategory.PERMISSION;
  }

  if (errorName.includes('timeout') || errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return ErrorCategory.TIMEOUT;
  }

  if (errorName.includes('sync') || errorMessage.includes('sync') || errorMessage.includes('conflict')) {
    return ErrorCategory.SYNC;
  }

  if (errorName.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('format')) {
    return ErrorCategory.VALIDATION;
  }

  return ErrorCategory.UNKNOWN;
};

// Mock determineErrorSeverity function
export const determineErrorSeverity = (category: ErrorCategory, _error: Error): ErrorSeverity => {
  switch (category) {
    case ErrorCategory.NETWORK:
    case ErrorCategory.STORAGE:
      return ErrorSeverity.CRITICAL;
    
    case ErrorCategory.TIMEOUT:
    case ErrorCategory.SYNC:
      return ErrorSeverity.WARNING;
    
    case ErrorCategory.VALIDATION:
      return ErrorSeverity.INFO;
    
    case ErrorCategory.PERMISSION:
    case ErrorCategory.UNKNOWN:
    default:
      return ErrorSeverity.ERROR;
  }
};

// Mock getUserFriendlyMessage function
export const getUserFriendlyMessage = (category: ErrorCategory, _severity: ErrorSeverity): string => {
  switch (category) {
    case ErrorCategory.NETWORK:
      return 'There was a problem with your internet connection. Please check your connection and try again.';
    
    case ErrorCategory.STORAGE:
      return 'There was a problem saving your story. Your device may be low on storage space.';
    
    case ErrorCategory.PERMISSION:
      return 'TaleForge doesn\'t have permission to save your story. Please check your browser settings.';
    
    case ErrorCategory.TIMEOUT:
      return 'The operation took too long to complete. Please try again.';
    
    case ErrorCategory.SYNC:
      return 'There was a problem syncing your story. We\'ll try again automatically.';
    
    case ErrorCategory.VALIDATION:
      return 'The story data is in an incorrect format. Please try again.';
    
    case ErrorCategory.UNKNOWN:
    default:
      return 'An unexpected error occurred. Please try again later.';
  }
};