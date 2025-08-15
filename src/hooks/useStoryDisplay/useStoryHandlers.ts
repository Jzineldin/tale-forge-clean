import { useStoryGeneration } from '@/hooks/useStoryGeneration';
import { StorySegment } from './types';

interface UseStoryHandlersProps {
  maxSegments: number;
  segmentCount: number;
  currentStorySegment: StorySegment | null;
  genre: string;
  prompt: string;
  characterName: string;
  skipImage: boolean;
  storyGeneration: ReturnType<typeof useStoryGeneration>;
  showCostDialog: boolean;
  pendingAction: any;
  pendingParams: any;
  setShowCostDialog: (show: boolean) => void;
  setPendingAction: (action: any, params?: any) => void;
  setError: (error: string | null) => void;
  setCurrentStorySegment: (segment: StorySegment | null) => void;
  setAllStorySegments: (segments: StorySegment[] | ((prev: StorySegment[]) => StorySegment[])) => void;
  setSegmentCount: (count: number) => void;
  confirmGeneration: any;
  handleFinishStory: any;
  storyId: string | undefined;
}

export const useStoryHandlers = ({
  maxSegments,
  segmentCount,
  currentStorySegment,
  genre,
  prompt,
  characterName,
  skipImage,
  storyGeneration: _storyGeneration,
  pendingAction,
  pendingParams,
  setShowCostDialog,
  setPendingAction,
  setError,
  setCurrentStorySegment,
  setAllStorySegments,
  setSegmentCount,
  confirmGeneration,
  handleFinishStory,
  storyId,
}: UseStoryHandlersProps) => {

  const showConfirmation = (action: 'start' | 'choice', choice?: string) => {
    console.log('🎬 Showing confirmation dialog for action:', action, 'with choice:', choice);
    setPendingAction(action, { choice });
    // Skip the confirmation dialog and directly call the generation
    handleConfirmGeneration(action, { choice });
  };

  const handleConfirmGeneration = async (action?: 'start' | 'choice' | null, params?: any) => {
    const currentAction = action || pendingAction;
    const currentParams = params || pendingParams;
    console.log('🚀 Starting story generation confirmation...', { currentAction, currentParams });
    setShowCostDialog(false);
    await confirmGeneration(
      currentAction,
      currentParams,
      genre,
      prompt,
      characterName,
      skipImage,
      true, // Always skip audio during story creation
      currentStorySegment,
      setError,
      setCurrentStorySegment,
      setAllStorySegments,
      setSegmentCount,
      setPendingAction,
      storyId
    );
  };

  const handleChoiceSelect = (choice: string) => {
    if (segmentCount >= maxSegments) {
      handleFinishStory(currentStorySegment, setCurrentStorySegment, setAllStorySegments);
      return;
    }
    showConfirmation('choice', choice);
  };

  const handleStoryFinish = async () => {
    console.log('🏁 Finishing story...');
    await handleFinishStory(currentStorySegment, setCurrentStorySegment, setAllStorySegments);
  };

  return {
    showConfirmation,
    handleConfirmGeneration,
    handleChoiceSelect,
    handleStoryFinish,
  };
};