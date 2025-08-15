/**
 * Security Optimizer - Implements security hardening measures
 * Part of the comprehensive optimization plan
 */

import { secureConsole as logger } from '@/utils/secureLogger';

interface SecurityConfig {
  enableContentSecurityPolicy: boolean;
  enableInputSanitization: boolean;
  enableRateLimiting: boolean;
  enableSecureHeaders: boolean;
}

const defaultConfig: SecurityConfig = {
  enableContentSecurityPolicy: true,
  enableInputSanitization: true,
  enableRateLimiting: true,
  enableSecureHeaders: true
};

let config: SecurityConfig = { ...defaultConfig };

/**
 * Initialize security optimizations
 */
export function initializeSecurityOptimizations(): void {
  try {
    // Set up Content Security Policy
    if (config.enableContentSecurityPolicy) {
      setupContentSecurityPolicy();
    }

    // Set up input sanitization
    if (config.enableInputSanitization) {
      setupInputSanitization();
    }

    // Set up secure headers
    if (config.enableSecureHeaders) {
      setupSecureHeaders();
    }

    // Monitor for XSS attempts
    setupXSSMonitoring();

    logger.info('Security optimizations initialized');
  } catch (error) {
    logger.error('Failed to initialize security optimizations:', error);
  }
}

/**
 * Set up Content Security Policy via meta tag
 */
function setupContentSecurityPolicy(): void {
  try {
    // Check if CSP meta tag already exists
    let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement;
    
    if (!cspMeta) {
      cspMeta = document.createElement('meta');
      cspMeta.httpEquiv = 'Content-Security-Policy';
      document.head.appendChild(cspMeta);
    }

    // Set a comprehensive CSP that allows necessary external resources
    const cspValue = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fyihypkigbcmsxyvseca.supabase.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com",
      "connect-src 'self' https://fyihypkigbcmsxyvseca.supabase.co wss://fyihypkigbcmsxyvseca.supabase.co wss://*.supabase.co https://*.elevenlabs.io",
      "media-src 'self' https: blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    cspMeta.content = cspValue;
    
    logger.debug('Content Security Policy configured');
  } catch (error) {
    logger.error('Failed to setup CSP:', error);
  }
}

/**
 * Set up input sanitization for forms
 */
function setupInputSanitization(): void {
  try {
    // Add event listener for form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      if (!form) return;

      const inputs = form.querySelectorAll('input, textarea');
      inputs.forEach((input) => {
        const element = input as HTMLInputElement | HTMLTextAreaElement;
        if (element.value) {
          // Basic XSS prevention
          element.value = sanitizeInput(element.value);
        }
      });
    });

    logger.debug('Input sanitization configured');
  } catch (error) {
    logger.error('Failed to setup input sanitization:', error);
  }
}

/**
 * Basic input sanitization
 */
function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Set up secure headers via meta tags
 */
function setupSecureHeaders(): void {
  try {
    const headers = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
    ];

    headers.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[http-equiv="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.httpEquiv = name;
        document.head.appendChild(meta);
      }
      
      meta.content = content;
    });

    logger.debug('Secure headers configured');
  } catch (error) {
    logger.error('Failed to setup secure headers:', error);
  }
}

/**
 * Monitor for potential XSS attempts
 */
function setupXSSMonitoring(): void {
  try {
    // Monitor for suspicious DOM modifications
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check for suspicious script elements
              if (element.tagName === 'SCRIPT') {
                logger.warn('Suspicious script element detected:', {
                  src: (element as HTMLScriptElement).src,
                  innerHTML: element.innerHTML.substring(0, 100)
                });
              }
              
              // Check for suspicious attributes
              const attributes = element.getAttributeNames();
              attributes.forEach(attr => {
                if (attr.startsWith('on') || attr.includes('javascript:')) {
                  logger.warn('Suspicious attribute detected:', {
                    element: element.tagName,
                    attribute: attr,
                    value: element.getAttribute(attr)?.substring(0, 100)
                  });
                }
              });
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['onclick', 'onload', 'onerror', 'onmouseover']
    });

    logger.debug('XSS monitoring configured');
  } catch (error) {
    logger.error('Failed to setup XSS monitoring:', error);
  }
}

/**
 * Validate URL safety
 */
export function validateURL(url: string): boolean {
  try {
    const parsedURL = new URL(url);
    
    // Only allow HTTPS (except for localhost)
    if (parsedURL.protocol !== 'https:' && !parsedURL.hostname.includes('localhost')) {
      return false;
    }
    
    // Block suspicious domains
    const suspiciousDomains = ['javascript', 'data', 'vbscript'];
    if (suspiciousDomains.some(domain => parsedURL.hostname.includes(domain))) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Secure storage wrapper
 */
export function secureSetItem(key: string, value: any): void {
  try {
    // Sanitize key
    const sanitizedKey = key.replace(/[<>]/g, '');
    
    // Sanitize value if it's a string
    let sanitizedValue = value;
    if (typeof value === 'string') {
      sanitizedValue = sanitizeInput(value);
    }
    
    sessionStorage.setItem(sanitizedKey, JSON.stringify(sanitizedValue));
  } catch (error) {
    logger.error('Secure storage error:', error);
  }
}

/**
 * Update security configuration
 */
export function updateSecurityConfig(newConfig: Partial<SecurityConfig>): void {
  config = { ...config, ...newConfig };
  logger.info('Security configuration updated:', newConfig);
}

/**
 * Get security audit report
 */
export function getSecurityAuditReport(): {
  cspEnabled: boolean;
  secureHeaders: boolean;
  httpsOnly: boolean;
  xssProtection: boolean;
} {
  return {
    cspEnabled: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
    secureHeaders: !!document.querySelector('meta[http-equiv="X-Content-Type-Options"]'),
    httpsOnly: location.protocol === 'https:' || location.hostname === 'localhost',
    xssProtection: !!document.querySelector('meta[http-equiv="X-XSS-Protection"]')
  };
}

export default {
  initializeSecurityOptimizations,
  validateURL,
  secureSetItem,
  updateSecurityConfig,
  getSecurityAuditReport,
  sanitizeInput
};