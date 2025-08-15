/**
 * Security configuration service
 * Manages security-related settings and environment validation
 */

interface SecurityConfig {
  cors: {
    allowedOrigins: string[];
    allowCredentials: boolean;
  };
  headers: {
    contentSecurityPolicy: string;
    strictTransportSecurity: string;
    xFrameOptions: string;
    xContentTypeOptions: string;
    referrerPolicy: string;
  };
  validation: {
    maxInputLength: number;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  session: {
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
  };
}

class SecurityConfigService {
  private config: SecurityConfig;
  
  constructor() {
    this.config = this.loadSecurityConfig();
    this.validateEnvironment();
  }
  
  private loadSecurityConfig(): SecurityConfig {
    return {
      cors: {
        allowedOrigins: this.getAllowedOrigins(),
        allowCredentials: true,
      },
      headers: {
        contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.elevenlabs.io;",
        strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
        xFrameOptions: 'DENY',
        xContentTypeOptions: 'nosniff',
        referrerPolicy: 'strict-origin-when-cross-origin',
      },
      validation: {
        maxInputLength: 10000,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      },
      session: {
        secure: this.isProduction(),
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      },
    };
  }
  
  private getAllowedOrigins(): string[] {
    const origins = import.meta.env.VITE_ALLOWED_ORIGINS;
    if (origins) {
      return origins.split(',').map((origin: string) => origin.trim());
    }
    
    // Default to current origin for development
    if (!this.isProduction()) {
      return [window.location.origin];
    }
    
    // No default for production - must be explicitly configured
    return [];
  }
  
  private isProduction(): boolean {
    return import.meta.env.MODE === 'production';
  }
  
  private validateEnvironment(): void {
    // Note: Supabase environment variables are optional since client uses hardcoded values
    const requiredVars: string[] = [];
    
    const missing = requiredVars.filter(varName => {
      const value = import.meta.env[varName];
      return !value || value.trim() === '';
    });
    
    if (missing.length > 0) {
      const error = `Missing required environment variables: ${missing.join(', ')}`;
      console.error('Security validation failed:', error);
      throw new Error(error);
    }
    
    // Validate Supabase URL format if provided (optional)
    const supabaseUrl = 'https://xofnypcjpgzrcefhqrqo.supabase.co';
    if (supabaseUrl && !supabaseUrl.match(/^https:\/\/[a-z0-9]+\.supabase\.co$/)) {
      console.warn('Supabase URL format validation warning - ensure it follows the expected pattern');
    }
    
    // Validate CORS origins in production
    if (this.isProduction() && this.config.cors.allowedOrigins.length === 0) {
      console.warn('No CORS origins configured for production environment');
    }
  }
  
  // Public getters
  public getCorsConfig() {
    return this.config.cors;
  }
  
  public getSecurityHeaders() {
    return this.config.headers;
  }
  
  public getValidationConfig() {
    return this.config.validation;
  }
  
  public getSessionConfig() {
    return this.config.session;
  }
  
  public isOriginAllowed(origin: string): boolean {
    return this.config.cors.allowedOrigins.includes(origin) || 
           (!this.isProduction() && origin === window.location.origin);
  }
  
  public validateFileUpload(file: File): { valid: boolean; error?: string } {
    const { maxFileSize, allowedFileTypes } = this.config.validation;
    
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxFileSize / 1024 / 1024}MB`,
      };
    }
    
    if (!allowedFileTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }
    
    return { valid: true };
  }
  
  public sanitizeInput(input: string, maxLength?: number): string {
    const limit = maxLength || this.config.validation.maxInputLength;
    return input.slice(0, limit).trim();
  }
}

// Export singleton instance
export const securityConfig = new SecurityConfigService();

// Export types for external use
export type { SecurityConfig };