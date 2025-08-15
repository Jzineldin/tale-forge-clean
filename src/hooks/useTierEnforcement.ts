import { useAuth } from '@/context/AuthProvider';
import { useSubscription } from './useSubscription';
import { useNarratedMinutes } from './useNarratedMinutes';
import { toast } from 'sonner';

interface TierEnforcementResult {
  canProceed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  currentUsage?: number;
  limit?: number;
}

export const useTierEnforcement = () => {
  const { user } = useAuth();
  const { incrementUsage } = useSubscription();
  const { minutesUsed, minutesLimit, isAtLimit } = useNarratedMinutes();

  const checkStoryCreationLimit = (): TierEnforcementResult => {
    // TODO: Implement proper tier-based limits
    // For now, enforce a basic 20 chapter limit for free users
    const currentUsage = 38; // This should come from actual usage tracking
    const limit = 20;

    if (currentUsage >= limit) {
      return {
        canProceed: false,
        reason: `Monthly story limit reached (${currentUsage}/${limit} chapters)`,
        upgradeRequired: true,
        currentUsage,
        limit,
      };
    }

    return {
      canProceed: true,
      currentUsage,
      limit,
    };
  };

  const checkVoiceGenerationLimit = (): TierEnforcementResult => {
    if (!user?.id) {
      return {
        canProceed: false,
        reason: 'Authentication required',
        upgradeRequired: false,
      };
    }

    if (isAtLimit) {
      return {
        canProceed: false,
        reason: `Monthly voice limit reached (${minutesUsed}/${minutesLimit} minutes)`,
        upgradeRequired: true,
        currentUsage: minutesUsed,
        limit: minutesLimit,
      };
    }

    return {
      canProceed: true,
      currentUsage: minutesUsed,
      limit: minutesLimit,
    };
  };

  const enforceStoryCreation = (): boolean => {
    const result = checkStoryCreationLimit();
    if (!result.canProceed) {
      toast.error(result.reason || 'Story creation limit reached.');
      return false;
    }
    console.log('✅ [TIER_ENFORCEMENT] Story creation allowed');
    incrementUsage({ stories: 1 });
    return true;
  };

  const enforceVoiceGeneration = (): boolean => {
    const result = checkVoiceGenerationLimit();

    if (!result.canProceed) {
      toast.error(result.reason || 'Voice generation limit reached', {
        description:
          'You have used all 20 minutes of AI voice for this month. Premium plans with unlimited voice are coming soon!',
      });
      return false;
    }

    // Increment voice usage
    incrementUsage({ voice: 1 });
    return true;
  };

  const enforceImageGeneration = (): boolean => {
    const result = checkStoryCreationLimit(); // Assuming same limit for now
    if (!result.canProceed) {
      toast.error(result.reason || 'Image generation limit reached.');
      return false;
    }
    console.log('✅ [TIER_ENFORCEMENT] Image generation allowed (Free Beta)');
    incrementUsage({ images: 1 });
    return true;
  };

  return {
    checkStoryCreationLimit,
    checkVoiceGenerationLimit,
    enforceStoryCreation,
    enforceVoiceGeneration,
    enforceImageGeneration,
  };
};
