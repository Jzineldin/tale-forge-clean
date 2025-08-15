import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Premium access check for voice features and premium content
 * Separate from admin access to prevent demo users from accessing admin panel
 */
export const usePremiumAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check for premium or admin role via server-side function
          const { data: hasPremiumRole, error: premiumError } = await supabase
            .rpc('has_role', {
              _user_id: user.id,
              _role: 'premium'
            });

          const { data: hasAdminRole, error: adminError } = await supabase
            .rpc('has_role', {
              _user_id: user.id,
              _role: 'admin'
            });

          if (premiumError || adminError) {
            console.error('Error checking roles:', { premiumError, adminError });
            setHasAccess(false);
          } else {
            // User has access if they have either premium or admin role
            setHasAccess(hasPremiumRole || hasAdminRole || false);
          }
        } else {
          setHasAccess(false);
        }
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        console.error('Error checking premium access:', errorMessage);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  return { hasAccess, loading };
}; 