
import React from 'react';
import { Button } from '@/components/ui/button';
import StoryProgress from '@/components/story-display/StoryProgress';
import StoryChapterNavigation from '@/components/story-display/StoryChapterNavigation';
import StorySegmentViewer from '@/components/story-display/StorySegmentViewer';
import StoryEndSection from '@/components/story-display/StoryEndSection';
import NewChapterLoadingIndicator from '@/components/story-display/NewChapterLoadingIndicator';
import { StorySegment } from '@/hooks/useStoryDisplay/types';


interface StoryContentAreaProps {
  currentStorySegment: StorySegment | null;
  allStorySegments: StorySegment[];
  segmentCount: number;
  maxSegments: number;
  showHistory: boolean;
  audioPlaying: boolean;
  isGenerating: boolean;
  prompt: string;
  currentChapterIndex: number;
  onToggleHistory: () => void;
  onSwitchToPlayer: () => void;
  onToggleAudio: () => void;
  onChoiceSelect: (choice: string, skipImage?: boolean) => void;
  onFinishStory: () => void;
  onChapterChange: (index: number) => void;
  skipImage?: boolean;
  onSkipImageChange?: ((skipImage: boolean) => void) | undefined;
}

const StoryContentArea: React.FC<StoryContentAreaProps> = ({
  currentStorySegment,
  allStorySegments,
  segmentCount,
  maxSegments,
  showHistory,
  audioPlaying,
  isGenerating,
  prompt,
  currentChapterIndex,
  onToggleHistory,
  onSwitchToPlayer,
  onToggleAudio,
  onChoiceSelect,
  onFinishStory,
  onChapterChange,
  skipImage = false,
  onSkipImageChange
}) => {
  const storySegmentsForSidebar = allStorySegments.length > 0 ? allStorySegments : (currentStorySegment ? [currentStorySegment] : []);
  const isStoryComplete = currentStorySegment?.is_end || false;

  // Use the segment from the current chapter index, fallback to current if none exist
  const displaySegment = allStorySegments[currentChapterIndex] || currentStorySegment;
  const displayChapterNumber = currentChapterIndex + 1;

  // Show choices whenever we have choices for the current chapter, regardless of generation status
  const segmentToCheck = displaySegment || currentStorySegment;
  const showChoices = segmentToCheck?.choices?.length > 0;

  return (
    <div className={`flex-1 ${showHistory ? 'max-w-2xl md:max-w-4xl' : 'max-w-4xl md:max-w-6xl'} mx-auto space-y-4`}>
      {/* Header with progress and controls */}
      <div className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-amber-500/40 backdrop-blur-lg shadow-2xl rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <StoryProgress 
            segmentCount={segmentCount}
            maxSegments={maxSegments}
          />
          
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Button
              onClick={onToggleHistory}
              variant="outline"
              size="sm"
              className="fantasy-heading border-amber-500/50 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 hover:text-amber-200 transition-all duration-300 flex-1 sm:flex-none bg-slate-800/60"
            >
              {showHistory ? '← Hide History' : '📖 Show History'}
            </Button>
            
            {allStorySegments.length > 0 && (
              <Button
                onClick={onSwitchToPlayer}
                variant="outline"
                size="sm"
                className="fantasy-heading border-amber-500/50 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 hover:text-amber-200 transition-all duration-300 flex-1 sm:flex-none bg-slate-800/60"
              >
                🎭 Play Story
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chapter Navigation */}
      <StoryChapterNavigation
        segments={allStorySegments}
        currentChapterIndex={currentChapterIndex}
        onChapterChange={onChapterChange}
        isGenerating={isGenerating}
      />

      {/* Show segment viewer as soon as we have any segment data */}
      {(displaySegment || currentStorySegment) && (
        <StorySegmentViewer
          segment={displaySegment || currentStorySegment!}
          chapterNumber={displayChapterNumber}
          audioPlaying={audioPlaying}
          onToggleAudio={onToggleAudio}
          isStoryComplete={isStoryComplete}
          showChoices={showChoices}
          isGenerating={isGenerating}
          onChoiceSelect={onChoiceSelect}
          skipImage={skipImage}
          onSkipImageChange={onSkipImageChange}
          isCurrentSegment={currentChapterIndex === allStorySegments.length - 1}
          isHistorical={currentChapterIndex < allStorySegments.length - 1}
        />
      )}

      {/* Show loading indicator when generating and viewing latest chapter */}
      {isGenerating && currentChapterIndex === allStorySegments.length - 1 && (
        <NewChapterLoadingIndicator />
      )}

      {/* Story end section - only show on latest chapter */}
      {currentChapterIndex === allStorySegments.length - 1 && (
        <StoryEndSection
          isEnd={currentStorySegment?.is_end || false}
          isGenerating={isGenerating}
          onFinishStory={onFinishStory}
          storySegments={storySegmentsForSidebar}
          storyId={currentStorySegment?.story_id || ''}
          storyTitle={prompt.substring(0, 50) + '...'}
        />
      )}

      {/* Button to go to latest chapter if not already there */}
      {currentChapterIndex < allStorySegments.length - 1 && (
        <div className="text-center pt-4">
          <Button
            onClick={() => onChapterChange(allStorySegments.length - 1)}
            variant="outline"
            className="fantasy-heading border-amber-500/40 text-amber-400 hover:bg-amber-500/20"
          >
            📚 Go to Latest Chapter
          </Button>
        </div>
      )}
    </div>
  );
};

export default StoryContentArea;
