
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface StoryTextSectionProps {
  segmentText: string;
  segmentCount: number;
  audioUrl?: string;
  audioPlaying: boolean;
  onToggleAudio: () => void;
  isStoryComplete?: boolean;
}

const StoryTextSection: React.FC<StoryTextSectionProps> = React.memo(({
  segmentText,
  audioUrl,
  audioPlaying,
  onToggleAudio
}) => {
  return (
    <div className="story-text-section w-full">
      <div className="bg-slate-900/40 border border-yellow-500/10 rounded-xl p-6">
        <div className="flex items-center justify-end mb-4">
          {/* Show audio controls whenever audio exists, regardless of story completion */}
          {audioUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleAudio}
              className="text-yellow-400 hover:text-yellow-300 p-2"
            >
              {audioPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          )}
        </div>
        <div className="prose prose-invert max-w-none">
          <div 
            className="fantasy-subtitle text-lg md:text-xl text-slate-200 leading-relaxed whitespace-pre-wrap"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {segmentText}
          </div>
        </div>
      </div>
    </div>
  );
});

// Display name for debugging
StoryTextSection.displayName = 'StoryTextSection';

export default StoryTextSection;
