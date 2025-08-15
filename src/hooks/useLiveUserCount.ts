
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useLiveUserCount = () => {
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserCount = async () => {
    try {
      setLoading(true);
      
      // Count total registered users (excluding demo accounts)
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('email', 'demo@tale-forge.app'); // Exclude demo account
      
      if (error) {
        console.error('Error fetching user count:', error);
        setError(error.message);
        return;
      }
      
      setUserCount(count || 0);
      setError(null);
    } catch (err) {
      console.error('Error in fetchUserCount:', err);
      setError('Failed to fetch user count');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchUserCount();

    // Set up real-time subscription for user count updates
    const channel = supabase
      .channel('user-count-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          // Refetch count when profiles table changes
          fetchUserCount();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    userCount,
    loading,
    error,
    refetch: fetchUserCount
  };
};
