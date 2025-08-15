
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Server-side admin access check using user_roles table
 * Replaces hardcoded client-side admin emails for security
 */
export const useAdminAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check admin role via server-side function
          const { data: hasRole, error } = await supabase
            .rpc('has_role', {
              _user_id: user.id,
              _role: 'admin'
            });

          if (error) {
            console.error('Error checking admin role:', error);
            setHasAccess(false);
          } else {
            setHasAccess(hasRole || false);
          }
        } else {
          setHasAccess(false);
        }
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        console.error('Error checking admin access:', errorMessage);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  return { hasAccess, loading };
};
