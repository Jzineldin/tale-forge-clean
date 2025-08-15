
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Music, Info } from 'lucide-react';
import { StorySegment } from '@/hooks/useStoryDisplay/types';

interface UnifiedAudioPlayerProps {
  segment: StorySegment | null;
  onAudioGenerated?: (audioUrl: string) => void;
}

const UnifiedAudioPlayer: React.FC<UnifiedAudioPlayerProps> = ({ 
  segment
}) => {
  if (!segment) {
    return null;
  }

  return (
    <Card className="bg-slate-800/80 border-amber-500/20 mt-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Music className="w-5 h-5 text-amber-400" />
          <h4 className="text-amber-300 font-medium">Audio Narration</h4>
        </div>

        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-amber-300/70">
            <Info className="w-4 h-4" />
            <span className="text-sm">
              Voice narration will be available after completing your story
            </span>
          </div>
          
          <p className="text-xs text-gray-400">
            Complete your story and generate professional narration for the entire adventure
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedAudioPlayer;
