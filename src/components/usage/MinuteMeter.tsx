import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNarratedMinutes } from '@/hooks/useNarratedMinutes';

interface MinuteMeterProps {
  className?: string;
}

export const MinuteMeter: React.FC<MinuteMeterProps> = ({ className }) => {
  const { minutesUsed, minutesLimit, loading, isAtLimit } = useNarratedMinutes();

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <Clock className="h-4 w-4 animate-pulse" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // Don't show meter for unlimited users
  if (minutesLimit === -1) {
    return null;
  }

  const percentageUsed = Math.min((minutesUsed / minutesLimit) * 100, 100);
  const isNearLimit = percentageUsed >= 80;

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <Clock className="h-4 w-4" />
      <div className="flex items-center gap-2">
        <span className={cn(
          "font-medium",
          isAtLimit ? "text-destructive" : isNearLimit ? "text-warning" : "text-muted-foreground"
        )}>
          🔊 {minutesUsed} / {minutesLimit} narrated minutes left
        </span>
        <span className="text-xs text-muted-foreground">– upgrade plans coming soon</span>
      </div>
    </div>
  );
};