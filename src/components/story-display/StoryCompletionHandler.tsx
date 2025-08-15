
import React from 'react';
import UnifiedStoryCompletion from '@/components/story-viewer/UnifiedStoryCompletion';
import { StorySegment } from '@/hooks/useStoryDisplay/types';
import { convertStorySegmentsToRows } from '@/utils/storyTypeConversion';

interface StoryCompletionHandlerProps {
  isStoryCompleted: boolean;
  storyId?: string;
  allStorySegments: StorySegment[];
  fullStoryAudioUrl?: string | null;
  audioGenerationStatus?: string;
  isPublic?: boolean;
  onExit?: () => void;
  storyTitle?: string;
}

const StoryCompletionHandler: React.FC<StoryCompletionHandlerProps> = ({
  isStoryCompleted,
  storyId,
  allStorySegments,
  fullStoryAudioUrl,
  audioGenerationStatus,
  isPublic = false,
  onExit,
  storyTitle
}) => {
  if (!isStoryCompleted || !storyId) {
    return null;
  }

  const segmentRows = convertStorySegmentsToRows(allStorySegments);

  return (
    <UnifiedStoryCompletion
      storyId={storyId}
      segments={segmentRows}
      fullStoryAudioUrl={fullStoryAudioUrl || ''}
      audioGenerationStatus={audioGenerationStatus || 'not_started'}
      isPublic={isPublic}
      {...(onExit && { onExit })}
      storyTitle={storyTitle || 'Untitled Story'}
    />
  );
};

export default StoryCompletionHandler;
