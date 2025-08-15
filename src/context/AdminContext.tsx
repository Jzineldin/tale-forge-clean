import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { adminDebug, warn } from '@/utils/secureLogger';

// Define the permission types for admin actions
export type AdminPermission = 
  | 'manage_users'
  | 'manage_content'
  | 'manage_settings'
  | 'view_analytics'
  | 'manage_system'
  | 'full_access';

// Define the context type
interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  checkPermission: (permission: AdminPermission) => boolean;
  hasAnyPermission: (permissions: AdminPermission[]) => boolean;
  hasAllPermissions: (permissions: AdminPermission[]) => boolean;
}

// Create the context with a default undefined value
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Custom hook to use the admin context
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { user, session, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add caching to prevent excessive admin checks
  const adminCheckCache = useRef<{ userId: string; isAdmin: boolean; timestamp: number } | null>(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Don't check if auth is still loading or if no user
      if (authLoading || !user || !session) {
        setLoading(authLoading);
        setIsAdmin(false);
        setError(null);
        return;
      }

      // Check cache first to prevent excessive requests
      const now = Date.now();
      const cache = adminCheckCache.current;
      
      if (cache && cache.userId === user.id && (now - cache.timestamp) < CACHE_DURATION) {
        adminDebug('Using cached admin status', { isAdmin: cache.isAdmin });
        setIsAdmin(cache.isAdmin);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        adminDebug('Checking admin access for user', { userId: user.id });

        // First try the proper RPC function
        const { data: hasRole, error: rpcError } = await supabase
          .rpc('has_role', {
            _user_id: user.id,
            _role: 'admin'
          });

        if (rpcError) {
          warn('RPC has_role error', { error: rpcError });
          
          // Fallback: Try direct query to user_roles table
          const { error: queryError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();

          if (queryError) {
            warn('Direct query error', { error: queryError });
            
            // Security: No hardcoded fallbacks - rely only on database
            adminDebug('Admin access denied - database role check failed');
            setIsAdmin(false);
            setError('Admin access requires proper database role configuration');
          } else {
            adminDebug('User has admin role in database');
            setIsAdmin(true);
            setError(null);
          }
        } else {
          adminDebug('RPC has_role result', { hasRole });
          const adminStatus = hasRole || false;
          setIsAdmin(adminStatus);
          setError(null);
          
          // Update cache
          adminCheckCache.current = {
            userId: user.id,
            isAdmin: adminStatus,
            timestamp: now
          };
        }
      } catch (error: any) {
        warn('Error checking admin access', { error });
        setIsAdmin(false);
        setError(`Authentication error: ${error?.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, session, authLoading]);

  // This is a simplified permission model where all admins have all permissions
  const checkPermission = (_permission: AdminPermission): boolean => {
    // If the user is not an admin, they have no permissions
    if (!isAdmin) return false;
    
    // In this simplified model, all admins have full access
    return true;
  };
  
  // Check if the user has any of the specified permissions
  const hasAnyPermission = (permissions: AdminPermission[]): boolean => {
    return permissions.some(permission => checkPermission(permission));
  };
  
  // Check if the user has all of the specified permissions
  const hasAllPermissions = (permissions: AdminPermission[]): boolean => {
    return permissions.every(permission => checkPermission(permission));
  };
  
  // The value to be provided by the context
  const value: AdminContextType = {
    isAdmin,
    loading,
    error,
    checkPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
  
  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;