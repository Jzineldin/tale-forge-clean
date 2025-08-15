/**
 * Utility functions for reliably accessing environment variables
 * with retry logic to handle cases where environment variables
 * might not be immediately available (e.g., during Cursor restarts).
 */

// Cache for environment variables to avoid repeated access
const envCache: Record<string, string | undefined> = {};

/**
 * Get an environment variable with retry logic
 * 
 * @param key The environment variable key (without the import.meta.env prefix)
 * @param options Configuration options
 * @returns The environment variable value or fallback
 */
export const getEnvVariable = async (
  key: string,
  options: {
    fallback?: string;
    required?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    logWarnings?: boolean;
  } = {}
): Promise<string | undefined> => {
  const {
    fallback = undefined,
    required = false,
    maxRetries = 5,
    retryDelay = 1000,
    logWarnings = true,
  } = options;

  // Check if we already have this in cache
  if (envCache[key] !== undefined) {
    return envCache[key];
  }

  // Full key with prefix
  const fullKey = `VITE_${key}`;
  
  // Try to get the environment variable
  let value = (import.meta.env as Record<string, string | undefined>)[fullKey];
  
  // If available immediately, cache and return
  if (value) {
    envCache[key] = value;
    return value;
  }
  
  // If not required and no fallback, return undefined
  if (!required && fallback === undefined) {
    return undefined;
  }
  
  // If not available and no retries requested, use fallback or throw
  if (maxRetries <= 0) {
    if (fallback !== undefined) {
      if (logWarnings) {
        console.warn(`Environment variable ${fullKey} not available, using fallback value.`);
      }
      envCache[key] = fallback;
      return fallback;
    }
    
    if (required) {
      throw new Error(`Required environment variable ${fullKey} is not available.`);
    }
    
    return undefined;
  }
  
  // Retry logic with exponential backoff
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    const attemptAccess = () => {
      value = (import.meta.env as Record<string, string | undefined>)[fullKey];
      
      if (value) {
        // Success! Cache and resolve
        envCache[key] = value;
        resolve(value);
        return;
      }
      
      retries++;
      
      if (retries >= maxRetries) {
        // Max retries reached, use fallback or reject
        if (fallback !== undefined) {
          if (logWarnings) {
            console.warn(`Environment variable ${fullKey} not available after ${maxRetries} retries, using fallback value.`);
          }
          envCache[key] = fallback;
          resolve(fallback);
        } else if (required) {
          reject(new Error(`Required environment variable ${fullKey} is not available after ${maxRetries} retries.`));
        } else {
          resolve(undefined);
        }
        return;
      }
      
      // Schedule next retry with exponential backoff
      const delay = retryDelay * Math.pow(1.5, retries - 1);
      setTimeout(attemptAccess, delay);
    };
    
    // Start the retry process
    attemptAccess();
  });
};

/**
 * Get an environment variable synchronously (no retries)
 * 
 * @param key The environment variable key (without the import.meta.env prefix)
 * @param fallback Optional fallback value
 * @returns The environment variable value or fallback
 */
export const getEnvVariableSync = (key: string, fallback?: string): string | undefined => {
  // Check if we already have this in cache
  if (envCache[key] !== undefined) {
    return envCache[key];
  }

  // Full key with prefix
  const fullKey = `VITE_${key}`;
  
  // Try to get the environment variable
  const value = (import.meta.env as Record<string, string | undefined>)[fullKey];
  
  if (value) {
    envCache[key] = value;
    return value;
  }
  
  return fallback;
};

/**
 * Check if all required environment variables are available
 * 
 * @param keys Array of environment variable keys to check
 * @returns True if all variables are available, false otherwise
 */
export const areEnvVariablesAvailable = (keys: string[]): boolean => {
  return keys.every(key => {
    const fullKey = `VITE_${key}`;
    return (import.meta.env as Record<string, string | undefined>)[fullKey] !== undefined;
  });
};

/**
 * Clear the environment variable cache
 * Useful when you want to force a refresh of the environment variables
 */
export const clearEnvCache = (): void => {
  Object.keys(envCache).forEach(key => {
    delete envCache[key];
  });
};