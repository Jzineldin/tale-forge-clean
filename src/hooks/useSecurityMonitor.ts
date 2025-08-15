import { useEffect, useState } from 'react';
import { securityConfig } from '@/services/securityConfig';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';

interface SecurityMetrics {
  failedLoginAttempts: number;
  suspiciousActivity: number;
  lastSecurityCheck: Date | null;
  securityLevel: 'low' | 'medium' | 'high';
}

/**
 * Hook for monitoring security events and metrics in real-time
 */
export const useSecurityMonitor = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    failedLoginAttempts: 0,
    suspiciousActivity: 0,
    lastSecurityCheck: null,
    securityLevel: 'medium',
  });
  
  const { logSecurityEvent } = useSecurityAudit();
  
  useEffect(() => {
    // Set up security monitoring
    const performSecurityCheck = () => {
      const checks = {
        hasSecureConnection: window.location.protocol === 'https:',
        hasValidHeaders: checkSecurityHeaders(),
        hasValidStorage: checkStorageSecurity(),
        hasValidCSP: checkContentSecurityPolicy(),
      };
      
      const securityScore = Object.values(checks).filter(Boolean).length;
      const securityLevel = securityScore >= 3 ? 'high' : securityScore >= 2 ? 'medium' : 'low';
      
      setMetrics(prev => ({
        ...prev,
        lastSecurityCheck: new Date(),
        securityLevel,
      }));
      
      // Log security check
      logSecurityEvent('security_check_completed', `Security level: ${securityLevel}, Score: ${securityScore}/4`);
    };
    
    // Initial check
    performSecurityCheck();
    
    // Set up periodic checks (every 5 minutes)
    const interval = setInterval(performSecurityCheck, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [logSecurityEvent]);
  
  const checkSecurityHeaders = (): boolean => {
    // Check if basic security headers are present (in a real app, this would be checked server-side)
    const headers = securityConfig.getSecurityHeaders();
    return !!(headers.xFrameOptions && headers.xContentTypeOptions);
  };
  
  const checkStorageSecurity = (): boolean => {
    try {
      // Check if localStorage is being used directly (security risk)
      const localStorageKeys = Object.keys(localStorage);
      const hasDirectLocalStorageUsage = localStorageKeys.some(key => 
        !key.startsWith('sc_') && // Allow our secure storage prefix
        !key.startsWith('_') && // Allow framework/library prefixes
        key !== 'debug' // Allow debug flag
      );
      
      return !hasDirectLocalStorageUsage;
    } catch {
      return false;
    }
  };
  
  const checkContentSecurityPolicy = (): boolean => {
    // Check if CSP meta tag exists (basic check)
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    return !!cspMeta;
  };
  
  const reportSuspiciousActivity = (activity: string, details?: string) => {
    setMetrics(prev => ({
      ...prev,
      suspiciousActivity: prev.suspiciousActivity + 1,
    }));
    
    logSecurityEvent('suspicious_activity', `${activity}: ${details || 'No details provided'}`);
  };
  
  const reportFailedLogin = () => {
    setMetrics(prev => ({
      ...prev,
      failedLoginAttempts: prev.failedLoginAttempts + 1,
    }));
    
    logSecurityEvent('failed_login_attempt', 'Authentication attempt failed');
  };
  
  const resetMetrics = () => {
    setMetrics({
      failedLoginAttempts: 0,
      suspiciousActivity: 0,
      lastSecurityCheck: new Date(),
      securityLevel: 'medium',
    });
  };
  
  return {
    metrics,
    reportSuspiciousActivity,
    reportFailedLogin,
    resetMetrics,
  };
};