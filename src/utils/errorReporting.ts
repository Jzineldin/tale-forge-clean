/**
 * Error Reporting Utility
 * 
 * This utility provides functions for capturing and reporting errors to monitoring services.
 * It can be configured to work with various error monitoring services like Sentry, LogRocket, etc.
 */

// Define the structure for additional error data
interface ErrorContext {
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
}

/**
 * Capture and report an exception to the configured error monitoring service
 * 
 * @param error The error object to report
 * @param context Additional context about the error
 */
export function captureException(error: Error | unknown, context: ErrorContext = {}): void {
  // Log to console in development
  if (!import.meta.env.PROD) {
    console.error('[Error Captured]', error, context);
  }

  // In a real implementation, this would send the error to your monitoring service
  // Example with Sentry:
  // Sentry.captureException(error, {
  //   tags: context.tags,
  //   extra: context.extra,
  //   user: context.user,
  //   level: context.level,
  // });
  
  // For now, we'll just log it
  try {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorDetails = {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack,
      ...context
    };
    
    // In production, this would send to your error monitoring service
    if (import.meta.env.PROD) {
      // Example implementation:
      // sendToErrorMonitoring(errorDetails);
      console.error('[Error Reporting] Error captured:', errorDetails);
    }
  } catch (reportingError) {
    // Fallback if error reporting itself fails
    console.error('[Error Reporting] Failed to report error:', reportingError);
    console.error('Original error:', error);
  }
}

/**
 * Capture a message without an associated error
 * 
 * @param message The message to capture
 * @param context Additional context about the message
 */
export function captureMessage(message: string, context: ErrorContext = {}): void {
  // Log to console in development
  if (!import.meta.env.PROD) {
    console.info('[Message Captured]', message, context);
  }
  
  // In a real implementation, this would send the message to your monitoring service
  // Example with Sentry:
  // Sentry.captureMessage(message, {
  //   tags: context.tags,
  //   extra: context.extra,
  //   user: context.user,
  //   level: context.level || 'info',
  // });
  
  // For now, we'll just log it
  if (import.meta.env.PROD) {
    // Example implementation:
    // sendMessageToMonitoring(message, context);
    console.info('[Error Reporting] Message captured:', message, context);
  }
}

/**
 * Set user information for error context
 * 
 * @param user User information
 */
export function setUser(user: { id?: string; email?: string; username?: string }): void {
  // In a real implementation, this would set the user context for your monitoring service
  // Example with Sentry:
  // Sentry.setUser(user);
  
  console.info('[Error Reporting] User context set:', user);
}

/**
 * Clear user information
 */
export function clearUser(): void {
  // In a real implementation, this would clear the user context
  // Example with Sentry:
  // Sentry.setUser(null);
  
  console.info('[Error Reporting] User context cleared');
}

/**
 * Initialize the error reporting system
 * 
 * @param config Configuration options
 */
export function initErrorReporting(config: {
  dsn?: string;
  environment?: string;
  release?: string;
  debug?: boolean;
}): void {
  // In a real implementation, this would initialize your error monitoring service
  // Example with Sentry:
  // Sentry.init({
  //   dsn: config.dsn,
  //   environment: config.environment || process.env.NODE_ENV,
  //   release: config.release,
  //   debug: config.debug || false,
  // });
  
  console.info('[Error Reporting] Initialized with config:', config);
}