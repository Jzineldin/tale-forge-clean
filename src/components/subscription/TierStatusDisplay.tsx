import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, Users, Zap, AlertTriangle, CheckCircle, Infinity as InfinityIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mapTierToDisplay, getTierIcon, getTierColor } from '@/utils/tierMapping';

interface TierStatusDisplayProps {
  compact?: boolean;
  showUpgradeButton?: boolean;
  className?: string;
}

export const TierStatusDisplay: React.FC<TierStatusDisplayProps> = ({
  compact = false,
  showUpgradeButton = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const {
    effectiveTier,
    usage,
    currentTierLimits,
    getRemainingStories,
    getRemainingVoice,
    isUnlimited,
    isFounder,
    founderData
  } = useSubscription();

  const displayTier = mapTierToDisplay(effectiveTier);

  const getTierIconComponent = () => {
    const iconName = getTierIcon(effectiveTier);
    switch (iconName) {
      case 'Crown':
        return <Crown className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'Zap':
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const tierColorClass = getTierColor(effectiveTier);

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100;
    return Math.min(100, (current / limit) * 100);
  };

  const remainingStories = getRemainingStories();
  const remainingVoice = getRemainingVoice();
  const storiesPercentage = getUsagePercentage(usage.stories_created, currentTierLimits?.stories_per_month || 0);
  const voicePercentage = getUsagePercentage(usage.voice_generations, currentTierLimits?.voice_generations_per_month || 0);

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Badge className={`${tierColorClass} text-white border-0`}>
          {getTierIconComponent()}
          <span className="ml-1">{displayTier}</span>
          {isFounder && founderData && (
            <span className="ml-1 text-xs">({founderData.founder_tier})</span>
          )}
        </Badge>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Stories:</span>
            {isUnlimited('story') ? (
              <InfinityIcon className="w-4 h-4 text-green-500" />
            ) : (
              <span className={remainingStories <= 2 ? 'text-amber-500' : ''}>
                {remainingStories} left
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Voice:</span>
            {isUnlimited('voice') ? (
              <InfinityIcon className="w-4 h-4 text-green-500" />
            ) : (
              <span className={remainingVoice <= 2 ? 'text-amber-500' : ''}>
                {remainingVoice} left
              </span>
            )}
          </div>
        </div>

        {showUpgradeButton && effectiveTier !== 'Pro' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/pricing')}
            className="ml-auto"
          >
            Upgrade
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${tierColorClass}`}>
              {getTierIconComponent()}
            </div>
            <div>
              <CardTitle>{displayTier} Plan</CardTitle>
              {isFounder && founderData && (
                <CardDescription>
                  {founderData.founder_tier} Founder #{founderData.founder_number}
                </CardDescription>
              )}
            </div>
          </div>
          {showUpgradeButton && displayTier !== 'Pro' && (
            <Button
              size="sm"
              onClick={() => navigate('/pricing')}
              className={tierColorClass}
            >
              Upgrade
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stories Usage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Monthly Stories</span>
            <span className="text-sm text-muted-foreground">
              {isUnlimited('story') ? (
                <div className="flex items-center gap-1">
                  <InfinityIcon className="w-4 h-4" />
                  <span>Unlimited</span>
                </div>
              ) : (
                `${usage.stories_created} / ${currentTierLimits?.stories_per_month || 0}`
              )}
            </span>
          </div>
          {!isUnlimited('story') && (
            <>
              <Progress value={storiesPercentage} className="h-2" />
              {remainingStories <= 2 && remainingStories > 0 && (
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Only {remainingStories} stories remaining this month</span>
                </div>
              )}
              {remainingStories === 0 && (
                <div className="flex items-center gap-1 text-red-500 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Monthly story limit reached</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Voice Usage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Voice Generations</span>
            <span className="text-sm text-muted-foreground">
              {isUnlimited('voice') ? (
                <div className="flex items-center gap-1">
                  <InfinityIcon className="w-4 h-4" />
                  <span>Unlimited</span>
                </div>
              ) : (
                `${usage.voice_generations} / ${currentTierLimits?.voice_generations_per_month || 0}`
              )}
            </span>
          </div>
          {!isUnlimited('voice') && (
            <>
              <Progress value={voicePercentage} className="h-2" />
              {remainingVoice <= 2 && remainingVoice > 0 && (
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Only {remainingVoice} voice generations remaining</span>
                </div>
              )}
              {remainingVoice === 0 && (
                <div className="flex items-center gap-1 text-red-500 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Voice generation limit reached</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Images per Story */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Images per Story</span>
            <span className="text-sm text-muted-foreground">
              {currentTierLimits?.images_per_story === -1 ? (
                <div className="flex items-center gap-1">
                  <InfinityIcon className="w-4 h-4" />
                  <span>Unlimited</span>
                </div>
              ) : (
                `Up to ${currentTierLimits?.images_per_story || 0}`
              )}
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="pt-2 border-t">
          <p className="text-sm font-medium mb-2">Features</p>
          <div className="flex flex-wrap gap-2">
            {currentTierLimits?.features?.map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            ))}
          </div>
        </div>

        {/* Founder Benefits */}
        {isFounder && founderData && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">Founder Benefits</p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {founderData.lifetime_discount === 100 
                  ? 'Lifetime FREE Pro Plan'
                  : `${founderData.lifetime_discount}% lifetime discount`
                }
              </p>
              {founderData.benefits?.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-start gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                  <span className="text-xs">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Convenience component for header/navbar usage
export const CompactTierStatus: React.FC = () => {
  return <TierStatusDisplay compact showUpgradeButton={false} />;
};