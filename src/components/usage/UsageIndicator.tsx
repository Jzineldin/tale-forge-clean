
import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { FileText, Image, Mic } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNarratedMinutes } from '@/hooks/useNarratedMinutes';

export const UsageIndicator: React.FC = () => {
  const { usage, effectiveTier } = useSubscription();
  const { minutesUsed, minutesLimit, loading: minutesLoading } = useNarratedMinutes();

  if (!usage) return null;

  const getUsageColor = (used: number, limit: number) => {
    if (limit === -1) return 'text-green-600';
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Usage This Month</h3>
        <Badge variant="outline" className="font-medium">
          {effectiveTier || 'Free'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stories */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Stories</span>
          </div>
          <div className={`text-2xl font-bold ${getUsageColor(usage.stories_created, -1)}`}>
            {usage.stories_created}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              / ∞
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Unlimited stories</div>
        </div>

        {/* Images */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Images</span>
          </div>
          <div className={`text-2xl font-bold ${getUsageColor(usage.images_generated, -1)}`}>
            {usage.images_generated}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              / ∞
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Unlimited images</div>
        </div>

        {/* Voice Minutes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Voice Minutes</span>
          </div>
          <div className={`text-2xl font-bold ${getUsageColor(minutesUsed, minutesLimit)}`}>
            {minutesLoading ? '...' : minutesUsed}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              / {minutesLimit}
            </span>
          </div>
          {!minutesLoading && minutesLimit > 0 && (
            <Progress 
              value={(minutesUsed / minutesLimit) * 100} 
              className="h-2"
            />
          )}
          <div className="text-xs text-muted-foreground">
            {minutesLimit - minutesUsed} minutes remaining
          </div>
        </div>
      </div>

      <div className="pt-2 border-t text-center">
        <p className="text-sm text-muted-foreground">
          🎉 <strong>Free Beta:</strong> Unlimited stories & images, 20 minutes of AI voice per month
        </p>
      </div>
    </div>
  );
};
