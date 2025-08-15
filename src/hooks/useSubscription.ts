import { useAuth } from '@/context/AuthProvider';
import { useUsageTracking, useTierLimits, useUsageLimits, useFounderStatus } from './useUsageTracking';

export const useSubscription = () => {
  const { subscription, refreshSubscription, isAuthenticated } = useAuth();
  const { usage, incrementUsage, isIncrementingUsage } = useUsageTracking();
  const { getTierLimits } = useTierLimits();
  const { currentTierLimits, canCreateStory, canGenerateVoice, getUsagePercentage, isUnlimited } = useUsageLimits();
  const { founderData, isFounder, lifetimeDiscount, founderNumber } = useFounderStatus();
  
  const isSubscribed = subscription.subscribed;
  const isPremium = isSubscribed && (subscription.subscription_tier === 'Premium' || subscription.subscription_tier === 'Core' || subscription.subscription_tier === 'Pro' || subscription.subscription_tier === 'Enterprise');
  const isPro = isSubscribed && (subscription.subscription_tier === 'Pro' || subscription.subscription_tier === 'Enterprise');
  const isEnterprise = isSubscribed && subscription.subscription_tier === 'Enterprise';
  const isFree = !isSubscribed || subscription.subscription_tier === 'Free';
  
  // Get effective tier (considering founder benefits)
  const effectiveTier = (() => {
    if (founderData?.founder_tier === 'genesis') return 'Pro'; // Genesis founders get Pro for free
    return subscription.subscription_tier || 'Free';
  })();
  
  const effectiveTierLimits = getTierLimits(effectiveTier);
  
  return {
    // Original subscription data
    ...subscription,
    isSubscribed,
    isPremium,
    isPro,
    isEnterprise,
    isFree,
    refreshSubscription,
    isAuthenticated,
    
    // Usage tracking
    usage,
    incrementUsage,
    isIncrementingUsage,
    
    // Tier limits
    currentTierLimits,
    effectiveTierLimits,
    effectiveTier,
    
    // Usage checks
    canCreateStory,
    canGenerateVoice,
    getUsagePercentage,
    isUnlimited,
    
    // Founder status
    founderData,
    isFounder,
    lifetimeDiscount,
    founderNumber,
    
    // Helper functions
    hasFeature: (feature: string) => {
      return effectiveTierLimits?.features?.includes(feature) || false;
    },
    
    getRemainingStories: () => {
      if (!effectiveTierLimits) return 0;
      if (effectiveTierLimits.stories_per_month === -1) return Infinity;
      return Math.max(0, effectiveTierLimits.stories_per_month - usage.stories_created);
    },
    
    getRemainingVoice: () => {
      if (!effectiveTierLimits) return 0;
      if (effectiveTierLimits.voice_generations_per_month === -1) return Infinity;
      return Math.max(0, effectiveTierLimits.voice_generations_per_month - usage.voice_generations);
    }
  };
};