
import React from 'react';
import { toast } from 'sonner';
import StoryModeToggle from './StoryModeToggle';
import StoryCreateMode from './StoryCreateMode';
import StoryPlayerMode from './StoryPlayerMode';
import { StorySegment } from '@/hooks/useStoryDisplay/types';

interface StoryMainContentProps {
  viewMode: 'create' | 'player';
  allStorySegments: StorySegment[];
  currentStorySegment: StorySegment | null;
  currentChapterIndex: number;
  segmentCount: number;
  showHistory: boolean;
  isGenerating: boolean;
  prompt: string;
  storyId?: string;
  storyTitle: string;
  narrationAudioUrl?: string | null;
  isStoryCompleted: boolean;
  onSwitchToCreate: () => Promise<void>;
  onSwitchToPlayer: () => Promise<void>;
  onChapterChange: (index: number) => void;
  onChoiceSelect: (choice: string, skipImage?: boolean) => void;
  onFinishStory: () => Promise<void>;
  skipImage?: boolean;
  onSkipImageChange?: (skipImage: boolean) => void;
}

const StoryMainContent: React.FC<StoryMainContentProps> = ({
  viewMode,
  allStorySegments,
  currentStorySegment,
  currentChapterIndex,
  segmentCount,
  showHistory,
  isGenerating,
  prompt,
  onSwitchToCreate,
  onSwitchToPlayer,
  onChapterChange,
  onChoiceSelect,
  onFinishStory,
  skipImage = false,
  onSkipImageChange
}) => {
  const handleSwitchToPlayer = async () => {
    if (allStorySegments.length > 0) {
      console.log('🎬 Switching to player mode...');
      await onSwitchToPlayer();
    } else {
      toast.error('No story segments available for playback');
    }
  };

  return (
    <>
      <StoryModeToggle
        viewMode={viewMode}
        onSwitchToCreate={onSwitchToCreate}
        onSwitchToPlayer={handleSwitchToPlayer}
        hasSegments={allStorySegments.length > 0}
      />

      {/* Main content area that changes based on mode */}
      <div className="main-content-area">
        {viewMode === 'player' && allStorySegments.length > 0 ? (
          <StoryPlayerMode
            allStorySegments={allStorySegments}
            currentStorySegment={currentStorySegment}
            currentChapterIndex={currentChapterIndex}
            onChapterChange={onChapterChange}
          />
        ) : (
          <StoryCreateMode
            currentStorySegment={currentStorySegment}
            allStorySegments={allStorySegments}
            segmentCount={segmentCount}
            showHistory={showHistory}
            isGenerating={isGenerating}
            prompt={prompt}
            currentChapterIndex={currentChapterIndex}
            onChoiceSelect={onChoiceSelect}
            onFinishStory={onFinishStory}
            onChapterChange={onChapterChange}
            skipImage={skipImage}
            onSkipImageChange={onSkipImageChange}
          />
        )}
      </div>
    </>
  );
};

export default StoryMainContent;
