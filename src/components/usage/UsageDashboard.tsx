import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Star, Crown, Plus, AlertCircle } from 'lucide-react';
import { useUsageTracking, useUserTier, useTierLimits } from '@/hooks/useUsageTracking';
import { useNavigate } from 'react-router-dom';

const UsageDashboard = () => {
  const { usage, isLoadingUsage } = useUsageTracking();
  const { tierName } = useUserTier();
  const { getTierLimits } = useTierLimits();
  const navigate = useNavigate();
  
  const currentTierLimits = getTierLimits(tierName);

  if (isLoadingUsage || !currentTierLimits) {
    return <div className="animate-pulse">Loading usage...</div>;
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const usageItems = [
    {
      name: 'Story Segments',
      icon: <Zap className="h-5 w-5 text-blue-400" />,
      used: usage.segments_created || 0,
      limit: currentTierLimits.segments_per_month,
      period: 'month',
      color: 'blue'
    },
    {
      name: 'AI Images', 
      icon: <Star className="h-5 w-5 text-green-400" />,
      used: usage.images_generated || 0,
      limit: currentTierLimits.images_per_month,
      period: 'month',
      color: 'green'
    },
    {
      name: 'TTS Minutes',
      icon: <Crown className="h-5 w-5 text-purple-400" />,
      used: tierName === 'Free' 
        ? (usage.narrated_minutes_lifetime || 0)
        : (usage.narrated_minutes_used || 0),
      limit: tierName === 'Free' 
        ? currentTierLimits.tts_minutes_lifetime 
        : currentTierLimits.tts_minutes_per_month,
      period: tierName === 'Free' ? 'lifetime' : 'month',
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Usage</h2>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600 text-white">{tierName} Plan</Badge>
            {tierName === 'Free' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/pricing')}
                className="text-xs"
              >
                Upgrade
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Usage Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {usageItems.map((item) => {
          const percentage = getUsagePercentage(item.used, item.limit);
          const isUnlimited = item.limit === -1;
          const isNearLimit = percentage >= 75;
          const isAtLimit = percentage >= 100;

          return (
            <Card key={item.name} className="bg-slate-800/50 border-slate-600">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <CardTitle className="text-sm font-medium text-gray-300">
                      {item.name}
                    </CardTitle>
                  </div>
                  {isNearLimit && !isUnlimited && (
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Usage Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Used this {item.period}</span>
                    <span className="text-white font-medium">
                      {item.used} {isUnlimited ? '' : `/ ${item.limit}`}
                    </span>
                  </div>
                  
                  {!isUnlimited && (
                    <Progress 
                      value={percentage} 
                      className="h-2"
                    />
                  )}
                  
                  {isUnlimited && (
                    <div className="text-center">
                      <Badge className="bg-green-600 text-white text-xs">
                        Unlimited
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Status Messages */}
                {!isUnlimited && (
                  <div className="text-xs">
                    {isAtLimit && (
                      <div className="text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Limit reached
                      </div>
                    )}
                    {isNearLimit && !isAtLimit && (
                      <div className="text-yellow-400">
                        {item.limit - item.used} remaining
                      </div>
                    )}
                    {!isNearLimit && (
                      <div className="text-green-400">
                        {item.limit - item.used} remaining
                      </div>
                    )}
                  </div>
                )}

                {/* Buy More Button */}
                {isAtLimit && !isUnlimited && (
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate('/pricing')}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Buy More
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-800/30 border-slate-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white mb-1">Need more credits?</h3>
              <p className="text-sm text-gray-400">
                Upgrade your plan or buy add-on packages anytime
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/pricing')}
              >
                View Plans
              </Button>
              <Button 
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/pricing')}
              >
                Buy Add-ons
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageDashboard;