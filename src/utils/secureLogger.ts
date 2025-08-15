// Secure logging utility for TaleForge AI workflows
// Provides environment-aware logging with sensitive data sanitization

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  component?: string;
  provider?: 'openai' | 'ovh-ai' | 'dall-e' | 'openai-tts';
}

class SecureLogger {
  private isDevelopment: boolean;
  private isProduction: boolean;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  constructor() {
    this.isDevelopment = import.meta.env.MODE === 'development';
    this.isProduction = import.meta.env.MODE === 'production';
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    // Convert to string if it's an object to perform sanitization
    const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // Remove sensitive information
    const sanitized = dataStr
      .replace(/("?api_?key"?\s*:\s*"?)[^"',\s}]+/gi, '$1[REDACTED]')
      .replace(/("?apikey"?\s*:\s*"?)[^"',\s}]+/gi, '$1[REDACTED]')
      .replace(/("?authorization"?\s*:\s*"?)[^"',\s}]+/gi, '$1[REDACTED]')
      .replace(/("?bearer"?\s*:\s*"?)[^"',\s}]+/gi, '$1[REDACTED]')
      .replace(/("?token"?\s*:\s*"?)[^"',\s}]+/gi, '$1[REDACTED]')
      .replace(/("?password"?\s*:\s*"?)[^"',\s}]+/gi, '$1[REDACTED]')
      .replace(/("?secret"?\s*:\s*"?)[^"',\s}]+/gi, '$1[REDACTED]');
    
    // Try to parse back to object if it was originally an object
    try {
      return typeof data === 'object' ? JSON.parse(sanitized) : sanitized;
    } catch {
      return sanitized;
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = entry.level.toUpperCase().padEnd(5);
    const component = entry.component ? `[${entry.component}]` : '';
    const provider = entry.provider ? `[${entry.provider}]` : '';
    
    return `${timestamp} ${level} ${component}${provider} ${entry.message}`;
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    // Keep buffer size manageable
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
    component?: string,
    provider?: 'openai' | 'ovh-ai' | 'dall-e' | 'openai-tts'
  ): LogEntry {
    return {
      level,
      message,
      data: data ? this.sanitizeData(data) : undefined,
      timestamp: new Date().toISOString(),
    component: component || 'unknown',
      provider: provider || 'openai'
    };
  }

  debug(message: string, data?: any, component?: string, provider?: 'openai' | 'ovh-ai' | 'dall-e' | 'openai-tts'): void {
    const entry = this.createLogEntry('debug', message, data, component, provider);
    this.addToBuffer(entry);
    
    // Only log debug messages in development
    if (this.isDevelopment) {
      console.debug(this.formatLogEntry(entry), entry.data);
    }
  }

  info(message: string, data?: any, component?: string, provider?: 'openai' | 'ovh-ai' | 'dall-e' | 'openai-tts'): void {
    const entry = this.createLogEntry('info', message, data, component, provider);
    this.addToBuffer(entry);
    
    // Log info messages in development and production
    console.info(this.formatLogEntry(entry), entry.data);
  }

  warn(message: string, data?: any, component?: string, provider?: 'openai' | 'ovh-ai' | 'dall-e' | 'openai-tts'): void {
    const entry = this.createLogEntry('warn', message, data, component, provider);
    this.addToBuffer(entry);
    
    // Always log warnings
    console.warn(this.formatLogEntry(entry), entry.data);
  }

  error(message: string, data?: any, component?: string, provider?: 'openai' | 'ovh-ai' | 'dall-e' | 'openai-tts'): void {
    const entry = this.createLogEntry('error', message, data, component, provider);
    this.addToBuffer(entry);
    
    // Always log errors
    console.error(this.formatLogEntry(entry), entry.data);
  }

  // AI-specific logging methods
  aiGeneration(message: string, data?: any, provider?: 'openai' | 'ovh-ai' | 'dall-e' | 'openai-tts'): void {
    this.debug(`AI Generation: ${message}`, data, 'AI', provider);
  }

  storyGeneration(message: string, data?: any): void {
    this.debug(`Story Generation: ${message}`, data, 'Story');
  }

  realtime(message: string, data?: any): void {
    this.debug(`Realtime: ${message}`, data, 'Realtime');
  }

  performance(message: string, data?: any, component?: string): void {
    this.debug(`Performance: ${message}`, data, component || 'Performance');
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  // Export logs for debugging (only in development)
  exportLogs(): string {
    if (this.isProduction) {
      return 'Log export disabled in production';
    }
    
    return this.logBuffer
      .map(entry => this.formatLogEntry(entry))
      .join('\n');
  }

  // Enhanced logging methods for security and admin contexts
  adminDebug(message: string, data?: any): void {
    // Admin debug only in development
    if (this.isDevelopment) {
      this.debug(`[ADMIN] ${message}`, data, 'Admin');
    }
  }

  userDebug(message: string, data?: any): void {
    // User debug only in development, with enhanced sanitization
    if (this.isDevelopment) {
      const sanitizedData = data ? this.sanitizeUserData(data) : undefined;
      this.debug(`[USER] ${message}`, sanitizedData, 'User');
    }
  }

  private sanitizeUserData(data: any): any {
    if (!data) return data;
    
    // More aggressive sanitization for user data
    const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // Remove emails completely
    const sanitized = dataStr
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
      .replace(/("?user_?id"?\s*:\s*"?)[^"',\s}]+/gi, '$1[USER_ID_REDACTED]')
      .replace(/("?email"?\s*:\s*"?)[^"',\s}]+/gi, '$1[EMAIL_REDACTED]');
    
    try {
      return typeof data === 'object' ? JSON.parse(sanitized) : sanitized;
    } catch {
      return sanitized;
    }
  }
}

// Create singleton instance
const logger = new SecureLogger();

// Export the logger and convenience methods with safe fallbacks
export default logger;

// Convenience exports for easier imports - using arrow functions for safe binding
export const debug = (message: string, data?: any, component?: string, provider?: 'openai' | 'ovh-ai' | 'dall-e' | 'openai-tts') => 
  logger?.debug(message, data, component, provider);

export const info = (message: string, data?: any, component?: string, provider?: 'openai' | 'ovh-ai' | 'dall-e' | 'openai-tts') => 
  logger?.info(message, data, component, provider);

export const warn = (message: string, data?: any, component?: string, provider?: 'openai' | 'ovh-ai' | 'dall-e' | 'openai-tts') => 
  logger?.warn(message, data, component, provider);

export const error = (message: string, data?: any, component?: string, provider?: 'openai' | 'ovh-ai' | 'dall-e' | 'openai-tts') => 
  logger?.error(message, data, component, provider);

export const aiGeneration = (message: string, data?: any, provider?: 'openai' | 'ovh-ai' | 'dall-e' | 'openai-tts') => 
  logger?.aiGeneration(message, data, provider);

export const storyGeneration = (message: string, data?: any) => 
  logger?.storyGeneration(message, data);

export const realtime = (message: string, data?: any) => 
  logger?.realtime(message, data);

export const performance = (message: string, data?: any, component?: string) => 
  logger?.performance(message, data, component);

// Enhanced secure logging for admin and user contexts
export const adminDebug = (message: string, data?: any) => 
  logger?.adminDebug(message, data);

export const userDebug = (message: string, data?: any) => 
  logger?.userDebug(message, data);

// Legacy console replacement (for gradual migration)
export const secureConsole = {
  log: (message: string, data?: any) => logger.info(message, data),
  debug: (message: string, data?: any) => logger.debug(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  error: (message: string, data?: any) => logger.error(message, data),
};
