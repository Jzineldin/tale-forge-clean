
import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { getStripeConfig } from '@/config/stripe';
import { ensureStripeConfig } from '@/services/stripeConfigService';

interface UsageIndicatorProps {
  className?: string;
  showUpgrade?: boolean;
  compact?: boolean;
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({
  className = "",
  showUpgrade = true,
  compact = false
}) => {
  const {
    effectiveTier,
    usage,
    effectiveTierLimits,
    getUsagePercentage,
    getRemainingStories,
    getRemainingVoice,
    isUnlimited,
    isFounder,
    founderData,
    isAuthenticated
  } = useSubscription();

  const { mutate: checkout, isPending: isCheckingOut } = useStripeCheckout();

  if (!isAuthenticated) return null;

  const remainingStories = getRemainingStories();
  const remainingVoice = getRemainingVoice();
  const storyPercentage = getUsagePercentage('story');
  const voicePercentage = getUsagePercentage('voice');

  const handleUpgrade = async () => {
    try {
      await ensureStripeConfig();
      const config = getStripeConfig();
      
      if (effectiveTier === 'Free') {
        checkout({ priceId: config.priceIds.premium, tier: 'Premium' });
      } else if (effectiveTier === 'Premium') {
        checkout({ priceId: config.priceIds.pro, tier: 'Pro' });
      } else if (effectiveTier === 'Family') {
        checkout({ priceId: config.priceIds.pro, tier: 'Pro' });
      }
    } catch (error) {
      console.error('Failed to load pricing configuration:', error);
      const { toast } = await import('sonner');
      toast.error('Unable to load pricing. Please try again.');
    }
  };

  const getTierIcon = () => {
    switch (effectiveTier) {
      case 'Pro': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'Premium': return <Sparkles className="w-4 h-4 text-purple-500" />;
      default: return <Zap className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTierColor = () => {
    switch (effectiveTier) {
      case 'Pro': return 'from-yellow-500 to-amber-600';
      case 'Premium': return 'from-purple-500 to-pink-600';
      default: return 'from-blue-500 to-cyan-600';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="flex items-center space-x-2">
          {getTierIcon()}
          <span className="text-sm font-medium">{effectiveTier}</span>
          {isFounder && (
            <Badge variant="outline" className="text-xs">
              Founder #{founderData?.founder_number}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <span>Stories:</span>
            {isUnlimited('story') ? (
              <span>Unlimited</span>
            ) : (
              <span>{usage.stories_created}/{effectiveTierLimits?.stories_per_month}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <span>Voice:</span>
            {isUnlimited('voice') ? (
              <span>Unlimited</span>
            ) : (
              <span>{usage.voice_generations}/{effectiveTierLimits?.voice_generations_per_month}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getTierIcon()}
            <CardTitle className="text-lg">{effectiveTier} Plan</CardTitle>
            {isFounder && (
              <Badge 
                variant="outline" 
                className={`bg-gradient-to-r ${getTierColor()} text-white border-0`}
              >
                Founder #{founderData?.founder_number}
              </Badge>
            )}
          </div>
          
          {founderData?.lifetime_discount && (
            <Badge variant="secondary" className="text-xs">
              {founderData.lifetime_discount}% OFF Forever
            </Badge>
          )}
        </div>
        
        <CardDescription>
          {effectiveTier === 'Free' && 'Upgrade to unlock unlimited creativity'}
          {effectiveTier === 'Premium' && 'Advanced features for serious storytellers'}
          {effectiveTier === 'Pro' && 'Unlimited power for professional creators'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stories Usage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Stories Created</span>
            <span className="text-muted-foreground">
              {isUnlimited('story') ? (
                <span>Unlimited</span>
              ) : (
                `${usage.stories_created} / ${effectiveTierLimits?.stories_per_month}`
              )}
            </span>
          </div>
          {!isUnlimited('story') && (
            <Progress 
              value={storyPercentage} 
              className="h-2"
            />
          )}
          {!isUnlimited('story') && remainingStories <= 1 && (
            <p className="text-xs text-amber-600">
              ⚠️ {remainingStories === 0 ? 'No stories remaining' : '1 story remaining'} this month
            </p>
          )}
        </div>

        {/* Voice Usage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Voice Generations</span>
            <span className="text-muted-foreground">
              {isUnlimited('voice') ? (
                <span>Unlimited</span>
              ) : (
                `${usage.voice_generations} / ${effectiveTierLimits?.voice_generations_per_month}`
              )}
            </span>
          </div>
          {!isUnlimited('voice') && (
            <Progress 
              value={voicePercentage} 
              className="h-2"
            />
          )}
          {!isUnlimited('voice') && remainingVoice <= 2 && (
            <p className="text-xs text-amber-600">
              ⚠️ {remainingVoice === 0 ? 'No voice generations remaining' : `${remainingVoice} voice generations remaining`} this month
            </p>
          )}
        </div>

        {/* Upgrade Button */}
        {showUpgrade && effectiveTier !== 'Pro' && !isFounder && (
          <div className="pt-2 border-t">
            <Button
              onClick={handleUpgrade}
              disabled={isCheckingOut}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="sm"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {isCheckingOut ? 'Loading...' : `Upgrade to ${effectiveTier === 'Free' ? 'Premium' : 'Pro'}`}
            </Button>
          </div>
        )}

        {/* Founder Benefits */}
        {isFounder && (
          <div className="pt-2 border-t">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span>
                {founderData?.founder_tier === 'genesis' && 'Genesis Founder - Lifetime Pro Access'}
                {founderData?.founder_tier === 'pioneer' && 'Pioneer Founder - 60% Lifetime Discount'}
                {founderData?.founder_tier === 'early_adopter' && 'Early Adopter - 50% Lifetime Discount'}
              </span>
            </div>
          </div>
        )}

        {/* Usage Reset Info */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Usage resets monthly on the 1st • Current period: {usage.month_year}
        </div>
      </CardContent>
    </Card>
  );
};
