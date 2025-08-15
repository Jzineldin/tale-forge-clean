
import { useCallback } from 'react';
import { useUnifiedStory } from '@/hooks/useUnifiedStory';
import { useStoryDatabase } from './useStoryDatabase';
import { useStoryGameState } from './useStoryGameState';
import { toast } from 'sonner';

interface GenerationOptions {
  skipImage?: boolean;
  skipAudio?: boolean;
}

export const useStoryActions = () => {
  const { createStoryInDatabase, finishStoryInDatabase } = useStoryDatabase();
  const {
    currentSegment,
    setIsLoading,
    setIsFinishingStory,
    setGameState,
    setIsStoryCompleted,
    handleSuccessfulGeneration,
    handleGenerationError
  } = useStoryGameState();

  const { mutation } = useUnifiedStory({
    onSuccess: handleSuccessfulGeneration
  });

  // Handle mutation errors through the mutation object
  if (mutation.error && mutation.isPending === false) {
    handleGenerationError(mutation.error);
  }

  const handleStartStory = useCallback(async (prompt: string, storyMode: string, options: GenerationOptions = {}) => {
    console.log('🚀 handleStartStory called with:', { prompt, storyMode, options });
    
    try {
      setIsLoading(true);
      setGameState('playing');
      
      console.log('📊 Setting loading state and game state to playing');
      
      // Create a new story first
      console.log('📝 Creating story in database...');
      const story = await createStoryInDatabase(
        prompt.slice(0, 100), // Use first 100 chars as title
        prompt,
        storyMode
      );
      
      console.log('✅ Story created, now generating first segment...');
      
      // Generate the first segment using the unified story hook
      mutation.mutate({
        prompt,
        storyMode,
        storyId: story.id,
        skipImage: options.skipImage || false,
        skipAudio: options.skipAudio || false
      });
      
      console.log('✅ Mutation called successfully');
      
    } catch (err) {
      console.error('❌ Error in handleStartStory:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start story';
      handleGenerationError(new Error(errorMessage));
    }
  }, [mutation, setGameState, setIsLoading, createStoryInDatabase, handleGenerationError]);

  const handleSelectChoice = useCallback(async (choice: string, options: GenerationOptions = {}) => {
    console.log('🎯 handleSelectChoice called with:', { choice, options });
    
    if (!currentSegment) {
      console.error('❌ No current segment to continue from');
      toast.error('No current segment to continue from');
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log('🔧 Calling mutation for choice selection...');
      
      mutation.mutate({
        storyId: currentSegment.story_id,
        parentSegmentId: currentSegment.id,
        choiceText: choice,
        skipImage: options.skipImage || false,
        skipAudio: options.skipAudio || false
      });
      
    } catch (err) {
      console.error('❌ Error selecting choice:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to continue story';
      handleGenerationError(new Error(errorMessage));
    }
  }, [currentSegment, mutation, setIsLoading, handleGenerationError]);

  const handleFinishStory = useCallback(async () => {
    if (!currentSegment) {
      toast.error('No story to finish');
      return;
    }
    
    try {
      setIsFinishingStory(true);
      
      await finishStoryInDatabase(currentSegment.id, currentSegment.story_id);
      
      setGameState('completed');
      setIsStoryCompleted(true);
      toast.success('Story completed successfully!');
      
    } catch (err) {
      console.error('Error finishing story:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to finish story';
      toast.error(`Failed to finish story: ${errorMessage}`);
    } finally {
      setIsFinishingStory(false);
    }
  }, [currentSegment, setIsFinishingStory, setGameState, setIsStoryCompleted, finishStoryInDatabase]);

  return {
    handleStartStory,
    handleSelectChoice,
    handleFinishStory,
    isLoading: mutation.isPending
  };
};
