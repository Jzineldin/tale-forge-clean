
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FounderCounterProps {
  onCountUpdate?: (count: number) => void;
}

const FounderCounter: React.FC<FounderCounterProps> = ({
  onCountUpdate
}) => {
  useEffect(() => {
    const fetchFounderCount = async () => {
      try {
        const {
          count,
          error
        } = await supabase.from('user_founders').select('*', {
          count: 'exact',
          head: true
        });
        if (error) {
          console.error('Error fetching founder count:', error);
          return;
        }
        const currentCount = count || 0;
        onCountUpdate?.(currentCount);
      } catch (error) {
        console.error('Error fetching founder count:', error);
      }
    };
    fetchFounderCount();

    // Set up real-time subscription for founder count updates
    const subscription = supabase.channel('founder-count-updates').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_founders'
    }, () => {
      fetchFounderCount();
    }).subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [onCountUpdate]);
  
  return null;
};

export default FounderCounter;
