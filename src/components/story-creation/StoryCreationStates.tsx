import React from 'react';

import StoryDisplay from '@/components/StoryDisplay';
import StoryCompletionControls from '@/components/story-viewer/StoryCompletionControls';
import StoryLoadingState from '@/components/story-creation/StoryLoadingState';
import StoryCreationNavigation from '@/components/story-creation/StoryCreationNavigation';
import StoryCreationErrorState from '@/components/story-creation/StoryCreationErrorState';
import { CheckedState } from '@radix-ui/react-checkbox';

interface StoryCreationStatesProps {
  gameState: string;
  currentSegment: any;
  storyHistory: any[];
  isLoading: boolean;
  isFinishingStory: boolean;
  isStoryCompleted: boolean;
  prompt: string;
  storyMode: string;
  skipImage: boolean;
  apiCallsCount: number;
  showCostDialog: boolean;
  pendingAction: 'start' | 'choice' | 'finish' | null;
  hookError: string | null;
  handleGoHome: () => void;
  handleRestartStory: () => void;
  handleSkipImageChange: (checked: CheckedState) => void;
  showConfirmation: (action: 'start' | 'choice' | 'finish', choice?: string) => void;
  confirmGeneration: () => Promise<void>;
  setShowCostDialog: (show: boolean) => void;
}

export const StoryCreationStates: React.FC<StoryCreationStatesProps> = ({
  gameState,
  currentSegment,
  storyHistory,
  isLoading,
  isFinishingStory,
  isStoryCompleted,
  prompt,
  skipImage,
  apiCallsCount,
  hookError,
  handleGoHome,
  handleRestartStory,
  handleSkipImageChange,
  showConfirmation
}) => {

  console.log('🎯 StoryCreationStates render:', {
    gameState,
    isLoading,
    hasCurrentSegment: !!currentSegment,
    hasPrompt: !!prompt,
    hookError,
    apiCallsCount
  });

  // Show error state if there's a hook error
  if (hookError) {
    console.error('🚨 Hook error detected:', hookError);
    return (
      <div 
        className="min-h-screen relative bg-slate-900"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('https://cdn.midjourney.com/11bac597-89f4-4f16-99f0-4b114af4473f/0_2.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <StoryCreationNavigation
          gameState={gameState as "not_started" | "playing" | "completed"}
          onGoHome={handleGoHome}
          onRestart={handleRestartStory}
        />
        <StoryCreationErrorState
          message={`Story generation failed: ${hookError}`}
          onRetry={handleRestartStory}
          onGoHome={handleGoHome}
        />
      </div>
    );
  }

  // Show loading state during generation
  if (isLoading) {
    return (
      <StoryLoadingState
        onExit={handleGoHome}
      />
    );
  }

  // Show error state if no prompt is available
  if (!prompt && !currentSegment) {
    return (
      <div 
        className="min-h-screen relative bg-slate-900"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('https://cdn.midjourney.com/11bac597-89f4-4f16-99f0-4b114af4473f/0_2.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <StoryCreationNavigation
          gameState={gameState as "not_started" | "playing" | "completed"}
          onGoHome={handleGoHome}
          onRestart={handleRestartStory}
        />
        <StoryCreationErrorState
          message="No story prompt found. Let's start from the beginning!"
          onGoHome={handleGoHome}
        />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative bg-slate-900"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('https://cdn.midjourney.com/11bac597-89f4-4f16-99f0-4b114af4473f/0_2.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <StoryCreationNavigation
        gameState={gameState as "not_started" | "playing" | "completed"}
        onGoHome={handleGoHome}
        onRestart={handleRestartStory}
      />

      {/* Story content */}
      {currentSegment && (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="w-full max-w-4xl">
            <StoryDisplay
              key={currentSegment.id}
              storySegment={{
                storyId: currentSegment.story_id,
                text: currentSegment.segment_text,
                imageUrl: currentSegment.image_url || '/placeholder.svg',
                choices: currentSegment.choices || [],
                isEnd: currentSegment.is_end || isStoryCompleted,
                imageGenerationStatus: currentSegment.image_generation_status,
                segmentId: currentSegment.id,
              }}
              onSelectChoice={(choice) => showConfirmation('choice', choice)}
              onFinishStory={() => showConfirmation('finish')}
              onRestart={handleRestartStory}
              isLoading={isLoading}
              isFinishingStory={isFinishingStory}
              isEmbedded={false}
              skipImage={skipImage}
              onSkipImageChange={handleSkipImageChange}
            />
          </div>
        </div>
      )}
      
      {/* Show completion controls when story is completed */}
      {(gameState === 'completed' || isStoryCompleted) && currentSegment && (
        <div className="container mx-auto px-4 py-4">
          <StoryCompletionControls 
            storyId={currentSegment.story_id || ''}
            segments={storyHistory}
            onRestart={handleRestartStory}
          />
        </div>
      )}


    </div>
  );
};
