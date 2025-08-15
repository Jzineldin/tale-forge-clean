import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  event_description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/**
 * Hook for security audit logging and monitoring
 */
export const useSecurityAudit = () => {
  const { user } = useAuth();

  const logSecurityEvent = async (
    eventType: string,
    description?: string
  ) => {
    try {
      // Log to console for immediate debugging
      console.log(`[SECURITY AUDIT] ${eventType}: ${description || 'No description'}`, {
        user_id: user?.id || 'anonymous',
        timestamp: new Date().toISOString(),
        event_type: eventType,
        event_description: description
      });

      // Try to log to database using edge function
      try {
        const { error } = await supabase.functions.invoke('log-security-event', {
          body: {
            event_type: eventType,
            event_description: description,
            user_id: user?.id || null,
            ip_address: null, // Will be captured server-side
            user_agent: navigator.userAgent
          }
        });

        if (error) {
          console.warn('Security audit database logging failed:', error);
        } else {
          console.log(`[SECURITY AUDIT] Event logged to database for user ${user?.id || 'anonymous'}`);
        }
      } catch (dbError) {
        console.warn('Security audit database unavailable:', dbError);
      }
    } catch (error) {
      console.error('Security audit logging failed:', error);
    }
  };

  const getSecurityAuditLog = async (limit: number = 50): Promise<SecurityEvent[]> => {
    try {
      if (!user?.id) {
        console.warn('Cannot fetch security audit log: user not authenticated');
        return [];
      }

      // Try to fetch from database using edge function
      try {
        const { data, error } = await supabase.functions.invoke('get-security-audit-log', {
          body: { limit }
        });

        if (error) {
          console.warn('Security audit log fetch failed:', error);
          return [];
        }

        return data?.events || [];
      } catch (dbError) {
        console.warn('Security audit database unavailable:', dbError);
        return [];
      }
    } catch (error) {
      console.warn('Security audit functionality not yet available:', error);
      return [];
    }
  };

  return {
    logSecurityEvent,
    getSecurityAuditLog
  };
};