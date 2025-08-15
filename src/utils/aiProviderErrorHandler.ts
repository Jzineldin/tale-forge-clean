/**
 * Centralized AI Provider Error Handler for TaleForge
 * Standardizes error handling across all AI providers (OpenAI GPT-4o-mini, OVH AI Endpoints, OpenAI DALL-E, OpenAI TTS-1)
 */
import { AIProviderError } from '@/types/ai';

export enum AIProviderType {
  OPENAI_GPT = 'openai-gpt',
  OPENAI_DALLE = 'openai-dalle',
  OPENAI_TTS = 'openai-tts',
  OVH_AI_ENDPOINTS = 'ovh-ai-endpoints'
}

export class AIProviderErrorHandler {
  /**
   * Standardizes error handling for all AI providers
   */
  static handleProviderError(
    provider: AIProviderType,
    operation: string,
    error: Error,
    debugInfo?: any
  ): AIProviderError {
    const providerError: AIProviderError = {
      provider,
      operation,
      originalError: error,
      retryable: this.isRetryableError(error),
      userMessage: this.getUserFriendlyMessage(provider, operation, error),
      debugInfo
    };

    // Log error details for debugging
    console.error(`[${provider.toUpperCase()}] ${operation} failed:`, {
      message: error.message,
      stack: error.stack,
      debugInfo,
      retryable: providerError.retryable
    });

    return providerError;
  }

  /**
   * Determines if an error is retryable based on error type and provider
   */
  private static isRetryableError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    
    // Network/timeout errors - retryable
    if (errorMessage.includes('network') || 
        errorMessage.includes('timeout') || 
        errorMessage.includes('connection')) {
      return true;
    }
    
    // Rate limiting - retryable with delay
    if (errorMessage.includes('rate limit') || 
        errorMessage.includes('429')) {
      return true;
    }
    
    // Server errors - retryable
    if (errorMessage.includes('500') || 
        errorMessage.includes('503') || 
        errorMessage.includes('internal server error')) {
      return true;
    }
    
    // API key issues - not retryable
    if (errorMessage.includes('api key') || 
        errorMessage.includes('unauthorized') || 
        errorMessage.includes('401')) {
      return false;
    }
    
    // Quota exceeded - not retryable
    if (errorMessage.includes('quota') || 
        errorMessage.includes('billing')) {
      return false;
    }
    
    // Default to retryable for unknown errors
    return true;
  }

  /**
   * Creates user-friendly error messages for different AI providers and operations
   */
  private static getUserFriendlyMessage(
    provider: AIProviderType,
    operation: string,
    error: Error
  ): string {
    const errorMessage = error.message.toLowerCase();
    
    // Network/connection errors
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'Having trouble connecting to our AI services. Please check your internet connection and try again.';
    }
    
    // Rate limiting
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return 'Our AI services are experiencing high demand. Please wait a moment and try again.';
    }
    
    // Provider-specific messages
    switch (provider) {
      case AIProviderType.OPENAI_GPT:
        if (operation === 'text-generation') {
          return 'Unable to generate story text right now. Our storytelling AI is temporarily unavailable.';
        }
        break;
        
      case AIProviderType.OPENAI_DALLE:
        if (operation === 'image-generation') {
          return 'Unable to create story images right now. You can continue with your story and add images later.';
        }
        break;
        
      case AIProviderType.OVH_AI_ENDPOINTS:
        if (operation === 'image-generation') {
          return 'Primary image generation service is unavailable. Attempting to use backup service...';
        }
        break;
        
      case AIProviderType.OPENAI_TTS:
        if (operation === 'audio-generation') {
          return 'Unable to generate voice narration right now. Your story is still available to read.';
        }
        break;
    }
    
    // Generic fallback message
    return `AI service temporarily unavailable. Please try again in a moment.`;
  }

  /**
   * Handles fallback between providers (e.g., OVH AI Endpoints -> OpenAI DALL-E)
   */
  static handleProviderFallback(
    primaryProvider: AIProviderType,
    fallbackProvider: AIProviderType,
    operation: string,
    primaryError: AIProviderError
  ): void {
    console.warn(`[FALLBACK] ${primaryProvider} -> ${fallbackProvider} for ${operation}`, {
      primaryError: primaryError.originalError.message,
      retryable: primaryError.retryable
    });
  }

  /**
   * Calculates retry delay based on error type and attempt count
   */
  static getRetryDelay(error: AIProviderError, attemptCount: number): number {
    // Rate limiting - exponential backoff
    if (error.originalError.message.toLowerCase().includes('rate limit')) {
      return Math.min(1000 * Math.pow(2, attemptCount), 30000); // Max 30 seconds
    }
    
    // Server errors - linear backoff
    if (error.originalError.message.toLowerCase().includes('500')) {
      return Math.min(2000 * attemptCount, 10000); // Max 10 seconds
    }
    
    // Default retry delay
    return Math.min(1000 * attemptCount, 5000); // Max 5 seconds
  }
}

/**
 * Utility function for consistent error logging across story generation
 */
export const logStoryGenerationError = (
  phase: 'text' | 'image' | 'audio' | 'choices',
  error: Error,
  context?: any
) => {
  console.error(`[STORY_GENERATION] ${phase.toUpperCase()} generation failed:`, {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
};
