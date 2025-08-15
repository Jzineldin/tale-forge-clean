
import React from 'react';
import StorySegmentsDisplay from '@/components/story-display/StorySegmentsDisplay';
import { StorySegment } from '@/hooks/useStoryDisplay/types';

interface StoryPlayerModeProps {
  allStorySegments: StorySegment[];
  currentStorySegment: StorySegment | null;
  currentChapterIndex: number;
  onChapterChange: (index: number) => void;
}

const StoryPlayerMode: React.FC<StoryPlayerModeProps> = ({
  allStorySegments,
  currentChapterIndex,
  onChapterChange
}) => {
  console.log('🎬 StoryPlayerMode: segments with audio:', allStorySegments.filter(s => s.audio_url).length);
  
  // Create story title from first segment
  const storyTitle = allStorySegments.length > 0 
    ? allStorySegments[0].segment_text.substring(0, 50) + '...' 
    : 'Your Story';
  
  return (
    <div className="space-y-6">
      <StorySegmentsDisplay 
        segments={allStorySegments}
        storyTitle={storyTitle}
        currentChapterIndex={currentChapterIndex}
        onChapterChange={onChapterChange}
      />
    </div>
  );
};

export default StoryPlayerMode;
