
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useLiveFounderCount = () => {
  const [founderCount, setFounderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFounderCount = async () => {
    try {
      setLoading(true);
      
      const { count, error } = await supabase
        .from('user_founders')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error fetching founder count:', error);
        setError(error.message);
        return;
      }
      
      setFounderCount(count || 0);
      setError(null);
    } catch (err) {
      console.error('Error in fetchFounderCount:', err);
      setError('Failed to fetch founder count');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchFounderCount();

    // Set up real-time subscription for founder count updates
    const channel = supabase
      .channel('founder-count-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_founders',
        },
        () => {
          // Refetch count when user_founders table changes
          fetchFounderCount();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const remainingSpots = Math.max(0, 200 - founderCount);
  const isFounderProgramFull = founderCount >= 200;

  return {
    founderCount,
    remainingSpots,
    isFounderProgramFull,
    loading,
    error,
    refetch: fetchFounderCount
  };
};
