/**
 * Centralized Error Handling Utility
 * Provides consistent error handling patterns across the application
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  context?: ErrorContext;
  isOperational?: boolean;
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export class ApplicationError extends Error implements AppError {
  public readonly code?: string;
  public readonly statusCode: number;
  public readonly context?: ErrorContext;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    context?: ErrorContext,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.statusCode = statusCode;
    if (code !== undefined) {
      this.code = code;
    }
    if (context !== undefined) {
      this.context = context;
    }
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationError);
    }
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 400, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'Authentication required', context?: ErrorContext) {
    super(message, 401, 'AUTH_ERROR', context);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Insufficient permissions', context?: ErrorContext) {
    super(message, 403, 'AUTHORIZATION_ERROR', context);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string = 'Resource not found', context?: ErrorContext) {
    super(message, 404, 'NOT_FOUND', context);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ApplicationError {
  constructor(message: string = 'Rate limit exceeded', context?: ErrorContext) {
    super(message, 429, 'RATE_LIMIT_ERROR', context);
    this.name = 'RateLimitError';
  }
}

/**
 * Error Handler Class
 */
export class ErrorHandler {
  private static instance: ErrorHandler;

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle and log errors consistently
   */
  public handleError(error: Error | AppError, context?: ErrorContext): void {
    const appError = this.normalizeError(error, context);
    
    // Log error with context
    this.logError(appError);

    // Report to monitoring service if available
    this.reportError(appError);
  }

  /**
   * Normalize any error to AppError format
   */
  public normalizeError(error: Error | AppError, context?: ErrorContext): AppError {
    if (this.isAppError(error)) {
      return {
        ...error,
        context: { ...error.context, ...context }
      };
    }

    return new ApplicationError(
      error.message || 'An unexpected error occurred',
      500,
      'UNKNOWN_ERROR',
      context,
      false
    );
  }

  /**
   * Check if error is an operational error
   */
  public isOperationalError(error: Error | AppError): boolean {
    if (this.isAppError(error)) {
      return error.isOperational === true;
    }
    return false;
  }

  /**
   * Format error for user display
   */
  public formatUserError(error: Error | AppError): string {
    const appError = this.normalizeError(error);
    
    // Don't expose internal errors to users
    if (!this.isOperationalError(appError)) {
      return 'An unexpected error occurred. Please try again later.';
    }

    return appError.message;
  }

  /**
   * Log error with structured format
   */
  private logError(error: AppError): void {
    const logData = {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      isOperational: error.isOperational
    };

    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) {
      console.error('🚨 Server Error:', logData);
    } else if (statusCode >= 400) {
      console.warn('⚠️ Client Error:', logData);
    } else {
      console.info('ℹ️ Error Info:', logData);
    }
  }

  /**
   * Report error to monitoring service
   */
  private reportError(error: AppError): void {
    // In a real application, you would integrate with services like:
    // - Sentry
    // - Bugsnag
    // - LogRocket
    // - Custom analytics
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: (error.statusCode || 500) >= 500,
        custom_map: {
          error_code: error.code,
          component: error.context?.component,
          action: error.context?.action
        }
      });
    }
  }

  /**
   * Type guard for AppError
   */
  private isAppError(error: Error | AppError): error is AppError {
    return 'statusCode' in error || 'code' in error || 'isOperational' in error;
  }
}

/**
 * Convenience functions for common error handling patterns
 */
export const errorHandler = ErrorHandler.getInstance();

export const handleError = (error: Error | AppError, context?: ErrorContext): void => {
  errorHandler.handleError(error, context);
};

export const formatUserError = (error: Error | AppError): string => {
  return errorHandler.formatUserError(error);
};

export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string,
  context?: ErrorContext
): ApplicationError => {
  return new ApplicationError(message, statusCode, code, context);
};

/**
 * Async error wrapper for promises
 */
export const withErrorHandling = async <T>(
  promise: Promise<T>,
  context?: ErrorContext
): Promise<T> => {
  try {
    return await promise;
  } catch (error) {
    handleError(error as Error, context);
    throw error;
  }
};

/**
 * React error boundary helper
 */
export const getErrorBoundaryFallback = (error: Error, errorInfo: any) => {
  handleError(error, {
    component: 'ErrorBoundary',
    metadata: { errorInfo }
  });

  return {
    hasError: true,
    error: formatUserError(error)
  };
};