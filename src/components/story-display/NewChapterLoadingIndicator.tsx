
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
const NewChapterLoadingIndicator: React.FC = () => {
  return (
    <Card className="bg-slate-800/60 border-amber-500/30 mt-6">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Wand2 className="h-8 w-8 text-amber-400 animate-pulse" />
            <LoadingSpinner size="md" className="absolute inset-0 h-8 w-8 text-amber-400  opacity-50" />
          </div>
        </div>
        <h3 className="text-amber-300 text-lg font-semibold mb-2">
          Writing Next Chapter...
        </h3>
        <p className="text-gray-400 text-sm">
          Your next chapter is being crafted. Feel free to read previous chapters while you wait!
        </p>
      </CardContent>
    </Card>
  );
};

export default NewChapterLoadingIndicator;
