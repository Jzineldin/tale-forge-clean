/**
 * Autosave error handling service
 * 
 * This module provides utilities for handling different types of errors
 * that can occur during the autosave process and provides appropriate
 * recovery actions.
 */

import { toast } from 'sonner';
import { useSyncService } from '@/lib/sync/syncService';
import { useNetworkMonitor } from '@/lib/network/networkMonitor';

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  STORAGE = 'storage',
  PERMISSION = 'permission',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error interface
export interface AutosaveError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  originalError?: Error;
  recoveryAction?: () => Promise<boolean>;
  userMessage: string;
}

// Network error types
const NETWORK_ERROR_PATTERNS = [
  'network error',
  'failed to fetch',
  'connection refused',
  'timeout',
  'offline',
  'net::err',
  'socket hang up',
  'ECONNREFUSED',
  'ENOTFOUND',
  'ETIMEDOUT'
];

// Storage error types
const STORAGE_ERROR_PATTERNS = [
  'quota exceeded',
  'not enough space',
  'storage full',
  'indexeddb',
  'localstorage',
  'sessionstorage',
  'QUOTA_EXCEEDED_ERR',
  'QuotaExceededError',
  'NS_ERROR_DOM_QUOTA_REACHED'
];

// Permission error types
const PERMISSION_ERROR_PATTERNS = [
  'permission denied',
  'not allowed',
  'unauthorized',
  'forbidden',
  'access denied',
  'PERMISSION_DENIED'
];

/**
 * Categorize an error based on its message and type
 */
export const categorizeError = (error: Error): ErrorCategory => {
  const errorMessage = error.message.toLowerCase();
  const errorStack = error.stack?.toLowerCase() || '';
  const errorString = errorMessage + ' ' + errorStack;

  if (NETWORK_ERROR_PATTERNS.some(pattern => errorString.includes(pattern.toLowerCase()))) {
    return ErrorCategory.NETWORK;
  }

  if (STORAGE_ERROR_PATTERNS.some(pattern => errorString.includes(pattern.toLowerCase()))) {
    return ErrorCategory.STORAGE;
  }

  if (PERMISSION_ERROR_PATTERNS.some(pattern => errorString.includes(pattern.toLowerCase()))) {
    return ErrorCategory.PERMISSION;
  }

  // Check for validation errors (usually from Supabase)
  if (errorString.includes('validation') || errorString.includes('constraint')) {
    return ErrorCategory.VALIDATION;
  }

  return ErrorCategory.UNKNOWN;
};

/**
 * Determine error severity based on category and message
 */
export const determineErrorSeverity = (category: ErrorCategory, error: Error): ErrorSeverity => {
  const errorMessage = error.message.toLowerCase();

  switch (category) {
    case ErrorCategory.NETWORK:
      // Network errors are usually recoverable
      return ErrorSeverity.WARNING;
    
    case ErrorCategory.STORAGE:
      // Storage errors can be critical if they involve quota issues
      if (errorMessage.includes('quota') || errorMessage.includes('full')) {
        return ErrorSeverity.CRITICAL;
      }
      return ErrorSeverity.ERROR;
    
    case ErrorCategory.PERMISSION:
      // Permission errors usually require user action
      return ErrorSeverity.ERROR;
    
    case ErrorCategory.VALIDATION:
      // Validation errors are usually fixable
      return ErrorSeverity.WARNING;
    
    default:
      // Unknown errors are treated as errors
      return ErrorSeverity.ERROR;
  }
};

/**
 * Get user-friendly message based on error category and severity
 */
export const getUserFriendlyMessage = (category: ErrorCategory, severity: ErrorSeverity): string => {
  switch (category) {
    case ErrorCategory.NETWORK:
      return severity === ErrorSeverity.CRITICAL
        ? "We're having trouble connecting to the server. Your story has been saved locally and will be synced when your connection is restored."
        : "You appear to be offline. Your story has been saved locally and will be synced when you're back online.";
    
    case ErrorCategory.STORAGE:
      return severity === ErrorSeverity.CRITICAL
        ? "Your device is running out of storage space. Please free up some space to ensure your stories can be saved properly."
        : "We're having trouble saving your story locally. Please make sure your browser allows local storage.";
    
    case ErrorCategory.PERMISSION:
      return "We don't have permission to save your story. Please check your browser settings and try again.";
    
    case ErrorCategory.VALIDATION:
      return "There was an issue with the data format. Your story has been saved locally, but some features may not work correctly.";
    
    default:
      return "An unexpected error occurred while saving your story. Your progress has been saved locally.";
  }
};

/**
 * Create a recovery action based on error category
 */
export const createRecoveryAction = (
  category: ErrorCategory,
  syncService: ReturnType<typeof useSyncService>,
  networkMonitor: ReturnType<typeof useNetworkMonitor>
): (() => Promise<boolean>) => {
  switch (category) {
    case ErrorCategory.NETWORK:
      // For network errors, try to sync when back online
      return async () => {
        if (networkMonitor.isOnline()) {
          try {
            await syncService.syncAll();
            toast.success('Successfully synced your stories');
            return true;
          } catch (error) {
            toast.error('Failed to sync your stories. Please try again later.');
            return false;
          }
        } else {
          toast.info("You're still offline. Your stories will sync automatically when you're back online.");
          return false;
        }
      };
    
    case ErrorCategory.STORAGE:
      // For storage errors, try to clear some space
      return async () => {
        try {
          // Try to clear old data (this would be implemented elsewhere)
          // For now, just show a message
          toast.info('Please free up some storage space on your device and try again.');
          return false;
        } catch (error) {
          toast.error('Failed to clear storage. Please try manually clearing browser data.');
          return false;
        }
      };
    
    case ErrorCategory.PERMISSION:
      // For permission errors, guide the user
      return async () => {
        toast.info('Please check your browser settings to allow storage access for this site.');
        return false;
      };
    
    default:
      // For other errors, try a general sync
      return async () => {
        try {
          await syncService.syncAll();
          toast.success('Successfully recovered your stories');
          return true;
        } catch (error) {
          toast.error('Recovery failed. Please try again later.');
          return false;
        }
      };
  }
};

/**
 * Handle an autosave error
 */
export const handleAutosaveError = (
  error: Error,
  syncService: ReturnType<typeof useSyncService>,
  networkMonitor: ReturnType<typeof useNetworkMonitor>
): AutosaveError => {
  // Categorize the error
  const category = categorizeError(error);
  
  // Determine severity
  const severity = determineErrorSeverity(category, error);
  
  // Get user-friendly message
  const userMessage = getUserFriendlyMessage(category, severity);
  
  // Create recovery action
  const recoveryAction = createRecoveryAction(category, syncService, networkMonitor);
  
  // Log the error for debugging
  console.error(`Autosave error [${category}/${severity}]:`, error);
  
  // Return the processed error
  return {
    category,
    severity,
    message: error.message,
    originalError: error,
    recoveryAction,
    userMessage
  };
};

/**
 * Hook for using autosave error handling
 */
export const useAutosaveErrorHandler = () => {
  const syncService = useSyncService();
  const networkMonitor = useNetworkMonitor();
  
  const handleError = (error: Error): AutosaveError => {
    return handleAutosaveError(error, syncService, networkMonitor);
  };
  
  const showErrorToast = (autosaveError: AutosaveError) => {
    const { severity, userMessage } = autosaveError;
    
    switch (severity) {
      case ErrorSeverity.INFO:
        toast.info(userMessage);
        break;
      case ErrorSeverity.WARNING:
        toast.warning(userMessage);
        break;
      case ErrorSeverity.ERROR:
        toast.error(userMessage);
        break;
      case ErrorSeverity.CRITICAL:
        toast.error(userMessage, { duration: 10000 });
        break;
    }
  };
  
  return {
    handleError,
    showErrorToast
  };
};