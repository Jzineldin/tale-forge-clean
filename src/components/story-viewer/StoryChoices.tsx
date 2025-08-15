
import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Flag } from 'lucide-react';
import { useStoryChoices } from '@/hooks/useStoryChoices';

interface StoryChoicesProps {
  segmentId: string;
  isEnd: boolean;
  onSelectChoice: (choice: string) => void;
  onFinishStory: () => void;
  onRestart: () => void;
  isLoading: boolean;
  isFinishingStory: boolean;
}

const StoryChoices: React.FC<StoryChoicesProps> = React.memo(({
  segmentId,
  isEnd,
  onSelectChoice,
  onFinishStory,
  onRestart,
  isLoading,
  isFinishingStory
}) => {
  const { getChoices, hasChoices } = useStoryChoices();
  
  // Get choices from durable store
  const choices = getChoices(segmentId);
  const hasStoredChoices = hasChoices(segmentId);

  // Memoize choice handlers to prevent unnecessary re-renders
  const handleChoiceClick = useCallback((choice: string) => {
    onSelectChoice(choice);
  }, [onSelectChoice]);

  // Memoize the choice buttons to prevent recreation on every render
  const choiceButtons = useMemo(() => {
    return choices.map((choice, index) => (
      <Button
        key={`choice-${segmentId}-${index}-${choice}`}
        onClick={() => handleChoiceClick(choice)}
        disabled={isLoading}
        variant="outline"
        className="w-full p-4 my-2 rounded-lg text-left border border-yellow-500/20 bg-slate-800/50 backdrop-blur-sm text-gray-300 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:bg-yellow-500/20 hover:border-yellow-500/70 hover:text-white hover:scale-[1.02] transform flex items-center"
      >
        <span className="text-yellow-400 font-bold mr-3">{index + 1}.</span>
        <span className="flex-1 text-left">{choice}</span>
        <ArrowRight className="h-4 w-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
      </Button>
    ));
  }, [choices, segmentId, isLoading, handleChoiceClick]);

  if (isEnd) {
    return (
      <div className="space-y-4 w-full max-w-full">
        <div className="text-center">
          <p className="text-purple-300 text-xl font-serif mb-6">The End</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
            <Button
              onClick={onRestart}
              variant="outline"
              className="border-purple-600 text-purple-300 hover:bg-purple-700 w-full sm:w-auto"
            >
              Start New Story
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state if no choices available yet
  if (!hasStoredChoices || choices.length === 0) {
    return (
      <div className="space-y-4 w-full max-w-full">
        <div className="text-center">
          <p className="text-purple-300 text-lg font-serif mb-4">Generating choices...</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-full">
      <div className="text-center">
        <p className="text-purple-300 text-xl font-serif mb-6">What happens next?</p>
      </div>
      <div className="space-y-3">
        {choiceButtons}
      </div>
      
      <div className="pt-4 border-t border-purple-600/30">
        <Button
          onClick={onFinishStory}
          disabled={isFinishingStory}
          variant="outline"
          className="w-full border-amber-600/50 text-amber-300 hover:bg-amber-700/20 hover:border-amber-500 transition-colors duration-200"
        >
          <Flag className="mr-2 h-4 w-4" />
          {isFinishingStory ? 'Finishing Story...' : 'End Story Here'}
        </Button>
      </div>
    </div>
  );
});

// Display name for debugging
StoryChoices.displayName = 'StoryChoices';

export default StoryChoices;
