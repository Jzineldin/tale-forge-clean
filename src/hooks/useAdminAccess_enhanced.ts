import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Enhanced admin access check with better error handling and fallback
 * Updated to work with secure cookies for authentication
 */
export const useAdminAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Get the current session and user
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setHasAccess(false);
          setError(`Session error: ${sessionError.message}`);
          setLoading(false);
          return;
        }
        
        const session = sessionData?.session;
        
        if (!session) {
          console.log('No active session found');
          setHasAccess(false);
          setError(null);
          setLoading(false);
          return;
        }
        
        // Get user from session
        const user = session.user;
        
        if (!user) {
          console.log('No user found in session');
          setHasAccess(false);
          setError(null);
          setLoading(false);
          return;
        }
        
        console.log('Current user ID:', user.id);
        console.log('Current user email:', user.email);

        try {
          // First try the proper RPC function
          const { data: hasRole, error: rpcError } = await supabase
            .rpc('has_role', {
              _user_id: user.id,
              _role: 'admin'
            });

          if (rpcError) {
            console.error('RPC has_role error:', rpcError);
            
            // Fallback: Try direct query to user_roles table
            const { error: queryError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .eq('role', 'admin')
              .single();

            if (queryError) {
              console.error('Direct query error:', queryError);
              
              // Security: No hardcoded fallbacks - rely only on database
              console.log('Admin access denied - database role check failed');
              setHasAccess(false);
              setError('Admin access requires proper database role configuration');
            } else {
              console.log('User has admin role in database');
              setHasAccess(true);
              setError(null);
            }
          } else {
            console.log('RPC has_role result:', hasRole);
            setHasAccess(hasRole || false);
            setError(null);
          }
        } catch (innerError: any) {
          console.error('Inner error checking admin access:', innerError);
          setHasAccess(false);
          setError('Database connection error - check Supabase setup');
        }
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        console.error('Error checking admin access:', errorMessage);
        setHasAccess(false);
        setError(`Authentication error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  return { hasAccess, loading, error };
};