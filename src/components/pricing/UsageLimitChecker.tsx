import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Crown, TrendingUp } from 'lucide-react';


interface UsageLimitCheckerProps {
  children: React.ReactNode;
  type: 'story' | 'voice' | 'image';
  showWarningAt?: number; // Show warning when usage is at this percentage (default: 80)
  blockAt?: number; // Block usage at this percentage (default: 100)
  className?: string;
}

export const UsageLimitChecker: React.FC<UsageLimitCheckerProps> = ({
  children,
  type,
  showWarningAt = 80,
  blockAt = 100,
  className = ""
}) => {
  const { 
    usage, 
    currentTierLimits, 
    effectiveTier,
    canCreateStory,
    canGenerateVoice,
    getRemainingStories,
    getRemainingVoice,
    isUnlimited
  } = useSubscription();

  // Get current usage and limits based on type
  const getUsageInfo = () => {
    switch (type) {
      case 'story':
        return {
          current: usage.stories_created,
          limit: currentTierLimits?.stories_per_month || 0,
          remaining: getRemainingStories(),
          canUse: canCreateStory,
          unit: 'stories',
          limitText: currentTierLimits?.stories_per_month === -1 ? 'Unlimited' : `${currentTierLimits?.stories_per_month || 0} per month`
        };
      case 'voice':
        return {
          current: usage.voice_generations,
          limit: currentTierLimits?.voice_generations_per_month || 0,
          remaining: getRemainingVoice(),
          canUse: canGenerateVoice,
          unit: 'voice generations',
          limitText: currentTierLimits?.voice_generations_per_month === -1 ? 'Unlimited' : `${currentTierLimits?.voice_generations_per_month || 0} per month`
        };
      case 'image':
        return {
          current: usage.images_generated,
          limit: currentTierLimits?.images_per_story || 0,
          remaining: Math.max(0, (currentTierLimits?.images_per_story || 0) - usage.images_generated),
          canUse: true, // Images are checked per story, not monthly
          unit: 'images',
          limitText: currentTierLimits?.images_per_story === -1 ? 'Unlimited' : `${currentTierLimits?.images_per_story || 0} per story`
        };
      default:
        return {
          current: 0,
          limit: 0,
          remaining: 0,
          canUse: false,
          unit: '',
          limitText: ''
        };
    }
  };

  const usageInfo = getUsageInfo();
  const usagePercentage = isUnlimited(type as 'story' | 'voice') || usageInfo.limit === -1 ? 0 : 
    usageInfo.limit > 0 ? (usageInfo.current / usageInfo.limit) * 100 : 100;

  const shouldShowWarning = !isUnlimited(type as 'story' | 'voice') && usagePercentage >= showWarningAt && usagePercentage < blockAt;
  const shouldBlock = !isUnlimited(type as 'story' | 'voice') && !usageInfo.canUse && usagePercentage >= blockAt;

  // If unlimited or within limits, render children normally
  if (isUnlimited(type as 'story' | 'voice') || (!shouldShowWarning && !shouldBlock)) {
    return <>{children}</>;
  }

  // Show warning overlay
  if (shouldShowWarning) {
    return (
      <div className={`relative ${className}`}>
        {children}
        <div className="mt-2">
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Usage Warning: {Math.round(usagePercentage)}% of {usageInfo.unit} used
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-300">
                    {usageInfo.remaining} {usageInfo.unit} remaining this month
                  </p>
                  <div className="mt-2">
                    <Progress 
                      value={usagePercentage} 
                      className="h-2 bg-yellow-100 dark:bg-yellow-900"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Block usage - show upgrade prompt
  if (shouldBlock) {
    return (
      <Card className={`border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 ${className}`}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-red-800 dark:text-red-200">
                {effectiveTier} Plan Limit Reached
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-300">
                You've used {usageInfo.current} of {usageInfo.limitText}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Usage Display */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Monthly Usage</span>
              <span className="font-medium">
                {usageInfo.current} / {usageInfo.limit === -1 ? '∞' : usageInfo.limit}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>

          {/* Blocked Content Preview */}
          <div className="relative">
            <div className="opacity-30 pointer-events-none select-none">
              {children}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent flex items-center justify-center">
              <div className="text-center space-y-2">
                <AlertTriangle className="w-8 h-8 mx-auto text-red-500" />
                <p className="text-sm font-medium text-red-600">
                  Limit Reached
                </p>
              </div>
            </div>
          </div>

          {/* Upgrade Options */}
          <div className="space-y-3 pt-4 border-t">
            <div className="text-center">
              <h4 className="font-semibold">Need more {usageInfo.unit}?</h4>
              <p className="text-sm text-muted-foreground">
                Upgrade your plan for higher limits or unlimited usage
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {effectiveTier === 'Free' && (
                <Button
                  onClick={() => window.location.href = '/pricing'}
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              )}
              
              {(effectiveTier === 'Free' || effectiveTier === 'Premium') && (
                <Button
                  onClick={() => window.location.href = '/pricing'}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {effectiveTier === 'Free' ? 'Go Pro' : 'Upgrade to Pro'}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/pricing'}
                className="sm:col-span-2"
              >
                Compare All Plans
              </Button>
            </div>

            {/* Reset Info */}
            <div className="text-center pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Usage limits reset monthly on your billing date
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

// Convenience components for common usage checks
export const StoryCreationLimitChecker: React.FC<Omit<UsageLimitCheckerProps, 'type'>> = (props) => (
  <UsageLimitChecker {...props} type="story" />
);

export const VoiceGenerationLimitChecker: React.FC<Omit<UsageLimitCheckerProps, 'type'>> = (props) => (
  <UsageLimitChecker {...props} type="voice" />
);

export const ImageGenerationLimitChecker: React.FC<Omit<UsageLimitCheckerProps, 'type'>> = (props) => (
  <UsageLimitChecker {...props} type="image" />
);