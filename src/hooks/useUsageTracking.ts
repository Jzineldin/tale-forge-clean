
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';

interface UsageData {
  stories_created: number;
  images_generated: number;
  voice_generations: number;
  narrated_minutes_used: number; // NEW
  month_year: string;
}

interface TierLimits {
  tier_name: string;
  stories_per_month: number;
  images_per_story: number;
  voice_generations_per_month: number;
  features: string[];
}

interface FounderData {
  founder_tier: 'genesis' | 'pioneer' | 'early_adopter';
  founder_number: number;
  lifetime_discount: number;
  benefits: string[];
}

// NEW: Types for effective tier
type TierName = 'Free' | 'Premium' | 'Family' | 'Pro';
interface EffectiveTierRecord {
  base_tier: TierName;
  effective_tier: TierName;
  subscribed: boolean;
  is_active: boolean;
  is_founder: boolean;
  founder_tier: string | null;
  lifetime_discount: number;
}

export const useUsageTracking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get current month usage
  const { 
    data: usage, 
    isLoading: isLoadingUsage,
    error: usageError 
  } = useQuery({
    queryKey: ['usage', user?.id],
    queryFn: async (): Promise<UsageData> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .rpc('get_current_month_usage', { user_uuid: user.id });

      if (error) throw error;
      const rows = (data as any[]) || [];
      if (rows.length === 0) {
        return {
          stories_created: 0,
          images_generated: 0,
          voice_generations: 0,
          narrated_minutes_used: 0, // default when no usage record yet
          month_year: new Date().toISOString().slice(0, 7)
        };
      }

      return {
        stories_created: rows[0]?.stories_created ?? 0,
        images_generated: rows[0]?.images_generated ?? 0,
        voice_generations: rows[0]?.voice_generations ?? 0,
        narrated_minutes_used: rows[0]?.narrated_minutes_used ?? 0,
        month_year: rows[0]?.month_year ?? new Date().toISOString().slice(0, 7),
      };
    },
    enabled: !!user?.id,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });

  // Increment usage mutation (extended to support narrated minutes)
  const incrementUsage = useMutation({
    mutationFn: async ({
      stories = 0,
      images = 0,
      voice = 0,
      narratedMinutes = 0,
    }: {
      stories?: number;
      images?: number;
      voice?: number;
      narratedMinutes?: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('increment_usage', {
          user_uuid: user.id,
          stories_inc: stories,
          images_inc: images,
          voice_inc: voice,
          narrated_minutes_inc: narratedMinutes, // NEW
        });

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      // Invalidate and refetch usage data
      queryClient.invalidateQueries({ queryKey: ['usage', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to increment usage:', error);
      // Removed toast.error to prevent UI disruption
    }
  });

  return {
    usage: usage || {
      stories_created: 0,
      images_generated: 0,
      voice_generations: 0,
      narrated_minutes_used: 0,
      month_year: new Date().toISOString().slice(0, 7)
    },
    isLoadingUsage,
    usageError,
    incrementUsage: incrementUsage.mutate,
    isIncrementingUsage: incrementUsage.isPending
  };
};

export const useTierLimits = () => {
  const { data: tierLimits, isLoading } = useQuery({
    queryKey: ['tier-limits'],
    queryFn: async (): Promise<TierLimits[]> => {
      const { data, error } = await supabase
        .from('tier_limits')
        .select('*')
        .order('tier_name');

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        features: item.features || []
      }));
    },
    staleTime: 300000, // Cache for 5 minutes
  });

  const getTierLimits = (tierName: string): TierLimits | null => {
    return tierLimits?.find(tier => tier.tier_name === tierName) || null;
  };

  return {
    tierLimits: tierLimits || [],
    isLoading,
    getTierLimits
  };
};

// NEW: hook to fetch effective tier from DB (honors founder overrides)
export const useEffectiveTier = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['effective-tier', user?.id],
    queryFn: async (): Promise<EffectiveTierRecord> => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase.rpc('get_effective_tier', { p_user_id: user.id });
      if (error) throw error;

      // Handle case where RPC returns no data
      if (!data || data.length === 0) {
        return {
          base_tier: 'Free',
          effective_tier: 'Free',
          subscribed: false,
          is_active: false,
          is_founder: false,
          founder_tier: null,
          lifetime_discount: 0,
        };
      }

      const row = data[0];
      return {
        base_tier: (row.base_tier as TierName) || 'Free',
        effective_tier: (row.effective_tier as TierName) || 'Free',
        subscribed: !!row.subscribed,
        is_active: !!row.is_active,
        is_founder: !!row.is_founder,
        founder_tier: row.founder_tier || null,
        lifetime_discount: row.lifetime_discount || 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  return {
    baseTier: data?.base_tier ?? 'Free',
    effectiveTier: data?.effective_tier ?? 'Free',
    subscribed: data?.subscribed ?? false,
    isActive: data?.is_active ?? false,
    isFounder: data?.is_founder ?? false,
    founderTier: data?.founder_tier ?? null,
    lifetimeDiscount: data?.lifetime_discount ?? 0,
    isLoading,
    error,
  };
};

export const useUsageLimits = () => {
  const { user } = useAuth();
  const { usage } = useUsageTracking();
  const { getTierLimits } = useTierLimits();
  const { effectiveTier } = useEffectiveTier(); // use DB-driven effective tier
  // Normalize legacy tier names ("Premium" now displayed/treated as "Core")
  const normalizedTier = effectiveTier === 'Premium' ? 'Core' : effectiveTier;
  let currentTierLimits = getTierLimits(normalizedTier);
  if (!currentTierLimits && normalizedTier !== effectiveTier) {
    // Fallback to original in case DB only has legacy name
    currentTierLimits = getTierLimits(effectiveTier);
  }
  if (!currentTierLimits) {
    // One-time debug log to help diagnose missing limits causing gating issues
    // (Avoid spamming by gating on presence of user & tier)
    console.debug('[useUsageLimits] No tier limits found for tier', {
      effectiveTier,
      normalizedTier,
      triedNames: [normalizedTier, effectiveTier]
    });
  }

  const checkUsageLimit = async (
    checkType: 'story' | 'image' | 'voice'
  ): Promise<boolean> => {
    if (!user?.id || !effectiveTier) return false;

    try {
      const { data, error } = await supabase
        .rpc('check_usage_limit', {
          user_uuid: user.id,
          tier_name: effectiveTier,
          check_type: checkType
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Failed to check usage limit:', error);
      return false;
    }
  };

  // Client-side limit checks (for immediate feedback)
  const canCreateStory = () => {
    if (!currentTierLimits) {
      return false;
    }
    return currentTierLimits.stories_per_month === -1 || 
           usage.stories_created < currentTierLimits.stories_per_month;
  };

  const canGenerateVoice = () => {
    if (!currentTierLimits) {
      return false;
    }
    return currentTierLimits.voice_generations_per_month === -1 || 
           usage.voice_generations < currentTierLimits.voice_generations_per_month;
  };

  const getUsagePercentage = (type: 'story' | 'voice') => {
    if (!currentTierLimits) return 0;
    
    if (type === 'story') {
      if (currentTierLimits.stories_per_month === -1) return 0; // Unlimited
      return (usage.stories_created / currentTierLimits.stories_per_month) * 100;
    }
    
    if (type === 'voice') {
      if (currentTierLimits.voice_generations_per_month === -1) return 0; // Unlimited
      return (usage.voice_generations / currentTierLimits.voice_generations_per_month) * 100;
    }
    
    return 0;
  };

  return {
    currentTierLimits,
    usage,
    canCreateStory: canCreateStory(),
    canGenerateVoice: canGenerateVoice(),
    checkUsageLimit,
    getUsagePercentage,
    isUnlimited: (type: 'story' | 'voice') => {
      if (!currentTierLimits) return false;
      return type === 'story' 
        ? currentTierLimits.stories_per_month === -1
        : currentTierLimits.voice_generations_per_month === -1;
    }
  };
};

export const useFounderStatus = () => {
  const { user } = useAuth();

  const { data: founderData, isLoading, error } = useQuery({
    queryKey: ['founder-status', user?.id],
    queryFn: async (): Promise<FounderData | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_founders')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching founder status:', error);
        return null;
      }
      
      return data ? {
        founder_tier: data.founder_tier as 'genesis' | 'pioneer' | 'early_adopter',
        founder_number: data.founder_number,
        lifetime_discount: data.lifetime_discount,
        benefits: data.benefits || []
      } : null;
    },
    enabled: !!user?.id,
    staleTime: 300000, // Cache for 5 minutes
  });

  const isFounder = !!founderData;
  const isGenesisFounder = founderData?.founder_tier === 'genesis';
  const isPioneerFounder = founderData?.founder_tier === 'pioneer';
  const isEarlyAdopterFounder = founderData?.founder_tier === 'early_adopter';
  const lifetimeDiscount = founderData?.lifetime_discount || 0;
  const founderNumber = founderData?.founder_number || 0;

  return {
    founderData,
    isLoading,
    error,
    isFounder,
    isGenesisFounder,
    isPioneerFounder,
    isEarlyAdopterFounder,
    lifetimeDiscount,
    founderNumber
  };
};
