/**
 * Stripe Error Handler and Monitoring Utility
 * 
 * This utility provides comprehensive error handling and monitoring for Stripe integration.
 * It includes error classification, logging, retry mechanisms, and monitoring capabilities.
 */

import { captureException } from '@/utils/errorReporting'; // Assuming you have an error reporting utility
import { logEvent } from '@/utils/analytics'; // Assuming you have an analytics utility

// Define Stripe error types
export enum StripeErrorType {
  AUTHENTICATION = 'authentication_error',
  API = 'api_error',
  CARD = 'card_error',
  IDEMPOTENCY = 'idempotency_error',
  INVALID_REQUEST = 'invalid_request_error',
  RATE_LIMIT = 'rate_limit_error',
  VALIDATION = 'validation_error',
  WEBHOOK = 'webhook_error',
  UNKNOWN = 'unknown_error'
}

// Define error severity levels
export enum ErrorSeverity {
  LOW = 'low',       // Non-critical errors that don't affect core functionality
  MEDIUM = 'medium', // Errors that affect some functionality but not critical operations
  HIGH = 'high',     // Errors that affect critical functionality
  CRITICAL = 'critical' // Errors that require immediate attention
}

// Interface for structured error information
export interface StripeErrorInfo {
  type: StripeErrorType;
  code?: string;
  message: string;
  severity: ErrorSeverity;
  retryable: boolean;
  context?: Record<string, any>;
  originalError?: any;
}

/**
 * Classify Stripe errors based on their type and code
 */
export function classifyStripeError(error: any): StripeErrorInfo {
  // Default error info
  const defaultErrorInfo: StripeErrorInfo = {
    type: StripeErrorType.UNKNOWN,
    message: 'An unknown error occurred with the payment system',
    severity: ErrorSeverity.MEDIUM,
    retryable: false
  };

  if (!error) {
    return defaultErrorInfo;
  }

  // Extract Stripe error details
  const stripeError = error.raw || error;
  const type = stripeError?.type || StripeErrorType.UNKNOWN;
  const code = stripeError?.code;
  const message = stripeError?.message || defaultErrorInfo.message;

  // Classify based on error type and code
  switch (type) {
    case StripeErrorType.AUTHENTICATION:
      return {
        type,
        code,
        message: 'Authentication with the payment system failed',
        severity: ErrorSeverity.CRITICAL,
        retryable: false,
        originalError: error
      };

    case StripeErrorType.API:
      return {
        type,
        code,
        message: 'The payment system is experiencing technical difficulties',
        severity: ErrorSeverity.HIGH,
        retryable: true,
        originalError: error
      };

    case StripeErrorType.CARD:
      // Further classify card errors by code
      if (code === 'card_declined') {
        return {
          type,
          code,
          message: 'Your card was declined. Please try another payment method',
          severity: ErrorSeverity.MEDIUM,
          retryable: true,
          originalError: error
        };
      } else if (code === 'expired_card') {
        return {
          type,
          code,
          message: 'Your card has expired. Please try another card',
          severity: ErrorSeverity.MEDIUM,
          retryable: true,
          originalError: error
        };
      } else if (code === 'incorrect_cvc') {
        return {
          type,
          code,
          message: 'Your card\'s security code is incorrect',
          severity: ErrorSeverity.LOW,
          retryable: true,
          originalError: error
        };
      } else if (code === 'processing_error') {
        return {
          type,
          code,
          message: 'An error occurred while processing your card. Please try again',
          severity: ErrorSeverity.MEDIUM,
          retryable: true,
          originalError: error
        };
      }
      
      return {
        type,
        code,
        message: message || 'There was an issue with your payment method',
        severity: ErrorSeverity.MEDIUM,
        retryable: true,
        originalError: error
      };

    case StripeErrorType.RATE_LIMIT:
      return {
        type,
        code,
        message: 'Too many requests to the payment system. Please try again later',
        severity: ErrorSeverity.MEDIUM,
        retryable: true,
        originalError: error
      };

    case StripeErrorType.INVALID_REQUEST:
      return {
        type,
        code,
        message: 'Invalid payment request. Please check your information',
        severity: ErrorSeverity.MEDIUM,
        retryable: false,
        originalError: error
      };

    case StripeErrorType.WEBHOOK:
      return {
        type,
        code,
        message: 'Webhook processing error',
        severity: ErrorSeverity.HIGH,
        retryable: false,
        originalError: error
      };

    default:
      return {
        type: StripeErrorType.UNKNOWN,
        code,
        message: message || defaultErrorInfo.message,
        severity: ErrorSeverity.MEDIUM,
        retryable: false,
        originalError: error
      };
  }
}

/**
 * Handle Stripe errors with appropriate logging, monitoring, and user feedback
 */
export function handleStripeError(error: any, context: Record<string, any> = {}): StripeErrorInfo {
  // Classify the error
  const errorInfo = classifyStripeError(error);
  errorInfo.context = context;

  // Log the error
  console.error('[Stripe Error]', {
    type: errorInfo.type,
    code: errorInfo.code,
    message: errorInfo.message,
    severity: errorInfo.severity,
    context: errorInfo.context
  });

  // Report to error monitoring system based on severity
  if (errorInfo.severity === ErrorSeverity.HIGH || errorInfo.severity === ErrorSeverity.CRITICAL) {
    captureException(error, {
      tags: {
        type: errorInfo.type,
        code: errorInfo.code || 'unknown_error',
        severity: errorInfo.severity
      },
      extra: {
        ...context,
        stripeErrorInfo: errorInfo
      }
    });
  }

  // Track error in analytics
  logEvent('stripe_error', {
    error_type: errorInfo.type,
    error_code: errorInfo.code,
    severity: errorInfo.severity,
    ...context
  });

  // Return the classified error info for UI handling
  return errorInfo;
}

/**
 * Retry a Stripe operation with exponential backoff
 */
export async function retryStripeOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 300,
  context: Record<string, any> = {}
): Promise<T> {
  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const errorInfo = classifyStripeError(error);
      
      // If the error is not retryable or we've reached max retries, throw
      if (!errorInfo.retryable || attempt === maxRetries) {
        throw error;
      }
      
      // Log retry attempt
      console.warn(`[Stripe] Retry attempt ${attempt + 1}/${maxRetries} after error:`, {
        type: errorInfo.type,
        code: errorInfo.code,
        context
      });
      
      // Wait with exponential backoff before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  // This should never be reached due to the throw in the loop, but TypeScript requires it
  throw lastError;
}

/**
 * Monitor Stripe webhook health
 */
export function monitorWebhookHealth(
  webhookStats: {
    received: number;
    processed: number;
    failed: number;
    lastReceived?: Date;
  }
): void {
  // Calculate success rate
  const successRate = webhookStats.received > 0 
    ? (webhookStats.processed / webhookStats.received) * 100 
    : 100;
  
  // Check for recent activity
  const now = new Date();
  const lastReceivedTime = webhookStats.lastReceived || now;
  const hoursSinceLastWebhook = (now.getTime() - lastReceivedTime.getTime()) / (1000 * 60 * 60);
  
  // Log webhook health metrics
  console.info('[Stripe Webhook Health]', {
    received: webhookStats.received,
    processed: webhookStats.processed,
    failed: webhookStats.failed,
    successRate: `${successRate.toFixed(2)}%`,
    hoursSinceLastWebhook: hoursSinceLastWebhook.toFixed(2)
  });
  
  // Alert on potential issues
  if (successRate < 90 && webhookStats.received > 10) {
    captureException(new Error('Stripe webhook success rate below 90%'), {
      tags: { 
        type: 'webhook_health',
        severity: ErrorSeverity.HIGH
      },
      extra: { webhookStats }
    });
  }
  
  if (hoursSinceLastWebhook > 24 && webhookStats.received > 0) {
    captureException(new Error('No Stripe webhooks received in 24+ hours'), {
      tags: { 
        type: 'webhook_health',
        severity: ErrorSeverity.MEDIUM
      },
      extra: { webhookStats }
    });
  }
}

/**
 * Create a user-friendly error message from a Stripe error
 */
export function getUserFriendlyErrorMessage(error: any): string {
  const errorInfo = classifyStripeError(error);
  return errorInfo.message;
}

/**
 * Check if a Stripe operation should be retried based on the error
 */
export function isRetryableError(error: any): boolean {
  const errorInfo = classifyStripeError(error);
  return errorInfo.retryable;
}

/**
 * Track Stripe checkout conversion rates
 */
export function trackCheckoutConversion(
  startedCheckouts: number,
  completedCheckouts: number,
  timeframe: 'daily' | 'weekly' | 'monthly' = 'daily'
): void {
  const conversionRate = startedCheckouts > 0 
    ? (completedCheckouts / startedCheckouts) * 100 
    : 0;
  
  console.info(`[Stripe Checkout Conversion] ${timeframe}`, {
    started: startedCheckouts,
    completed: completedCheckouts,
    conversionRate: `${conversionRate.toFixed(2)}%`
  });
  
  // Track in analytics
  logEvent('stripe_checkout_conversion', {
    timeframe,
    started: startedCheckouts,
    completed: completedCheckouts,
    conversion_rate: conversionRate
  });
  
  // Alert on low conversion rates
  if (startedCheckouts > 20 && conversionRate < 10) {
    captureException(new Error(`Low Stripe checkout conversion rate: ${conversionRate.toFixed(2)}%`), {
      tags: { 
        type: 'checkout_conversion',
        severity: ErrorSeverity.MEDIUM,
        timeframe
      },
      extra: { startedCheckouts, completedCheckouts }
    });
  }
}