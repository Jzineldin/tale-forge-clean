
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';

export const useNarratedMinutes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: minutesData, isLoading: loading } = useQuery({
    queryKey: ['narrated-minutes', user?.id],
    queryFn: async () => {
      if (!user?.id) return { minutesUsed: 0, minutesLimit: 10 };

      // Get current month usage from the RPC function
      const { data: usage } = await supabase
        .rpc('get_current_month_usage', { user_uuid: user.id });

      // Get user's effective tier
      const { data: tierData } = await supabase
        .rpc('get_effective_tier', { p_user_id: user.id });

      const effectiveTier = tierData?.[0]?.effective_tier || 'Free';

      // Get tier limits based on user's actual tier
      const { data: tierLimits } = await supabase
        .from('tier_limits')
        .select('voice_minutes_per_month')
        .eq('tier_name', effectiveTier)
        .single();

      // Use narrated_minutes_used from the updated DB function
      const minutesUsed = ((usage as any)?.[0]?.narrated_minutes_used) || 0;
      const minutesLimit = (tierLimits?.voice_minutes_per_month as number) || 10;

      return {
        minutesUsed,
        minutesLimit,
        effectiveTier
      };
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  const minutesUsed = minutesData?.minutesUsed || 0;
  const minutesLimit = minutesData?.minutesLimit || 10;
  const effectiveTier = minutesData?.effectiveTier || 'Free';
  const isAtLimit = minutesLimit !== -1 && minutesUsed >= minutesLimit;

  // Set up real-time subscription for usage updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-usage-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_usage',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Real-time usage update:', payload);
          // Invalidate the narrated minutes query to refresh data
          queryClient.invalidateQueries({ queryKey: ['narrated-minutes', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return {
    minutesUsed,
    minutesLimit,
    effectiveTier,
    loading,
    isAtLimit
  };
};
