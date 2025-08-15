
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useNarratedMinutes } from '@/hooks/useNarratedMinutes';

export const CleanTierStatus: React.FC = () => {
  const { minutesUsed, minutesLimit, loading } = useNarratedMinutes();

  if (loading) {
    return (
      <Badge variant="outline" className="text-slate-300 border-slate-600 hidden">
        Free Beta | Loading...
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-slate-300 border-slate-600 hidden">
      Free Beta | {minutesUsed}/{minutesLimit} min
    </Badge>
  );
};
