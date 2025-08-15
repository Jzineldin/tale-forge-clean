
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Users } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNarratedMinutes } from '@/hooks/useNarratedMinutes';

export const TierStatusDisplay: React.FC = () => {
  const { effectiveTier } = useSubscription();
  const { minutesUsed, minutesLimit, isAtLimit } = useNarratedMinutes();

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Pro':
        return <Crown className="h-4 w-4" />;
      case 'Premium':
        return <Zap className="h-4 w-4" />;
      case 'Family':
        return <Users className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Pro':
        return 'bg-gradient-to-r from-purple-500 to-pink-600';
      case 'Premium':
        return 'bg-gradient-to-r from-blue-500 to-cyan-600';
      case 'Family':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
      <Badge className={`${getTierColor(effectiveTier || 'Free')} text-white border-0 px-3 py-1`}>
        {getTierIcon(effectiveTier || 'Free')}
        <span className="ml-2 font-medium">
          {effectiveTier || 'Free'} Beta
        </span>
      </Badge>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Stories:</span>
          <span className="font-medium">∞</span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Images:</span>
          <span className="font-medium">∞</span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Voice:</span>
          <span className={`font-medium ${isAtLimit ? 'text-red-600' : 'text-green-600'}`}>
            {minutesUsed}/{minutesLimit}min
          </span>
        </div>
      </div>
    </div>
  );
};
