
import { useState, useCallback } from 'react';
import { useStoryGeneration } from './useStoryGeneration';
import { StorySegment, StoryGenerationRequest } from '@/types/ai';
import { storyGeneration } from '@/utils/secureLogger';

export const useStoryGame = () => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [storyHistory, setStoryHistory] = useState<StorySegment[]>([]);
  const [currentSegment, setCurrentSegment] = useState<StorySegment | null>(null);

  const { generateSegment, isGenerating } = useStoryGeneration();

  const handleStoryGeneration = useCallback(async (options: StoryGenerationRequest) => {
    try {
      const data = await generateSegment(options);
      storyGeneration('Story generation response received', { 
        storyId: data.story_id, 
        segmentId: data.id,
        hasChoices: !!data.choices?.length,
        isEnd: data.is_end 
      });
      
      // Ensure we include the segment ID in the current segment
      const segmentData: StorySegment = {
        id: data.id,
        storyId: data.story_id,
        text: data.segment_text,
        imageUrl: data.image_url || '/placeholder.svg',
        choices: data.choices || [],
        isEnd: data.is_end || false,
        parentSegmentId: data.parent_segment_id || '',
        triggeringChoiceText: data.choice_text || '',
        imagePrompt: data.image_prompt || '',
        generationMetadata: {
          imageProvider: data.image_status === 'completed' ? 'ovh-ai' : undefined
        }
      };

      setCurrentSegment(segmentData);
      setStoryHistory(prev => [...prev, segmentData]);
      setGameState('playing');

      storyGeneration('Story started successfully', { storyId: data.story_id });
    } catch (error) {
      storyGeneration('Story generation failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      setGameState('idle');
    }
  }, [generateSegment]);

  const startStory = useCallback((prompt: string, storyMode?: string) => {
    storyGeneration('Starting story', { prompt: prompt.substring(0, 100), storyMode });
    handleStoryGeneration({ 
      storyId: '', // Will be generated
      prompt, 
      ...(storyMode && { storyMode })
    });
  }, [handleStoryGeneration]);

  const selectChoice = useCallback((choice: string) => {
    if (!currentSegment) return;
    
    storyGeneration('Selecting choice', { choice, currentSegmentId: currentSegment.id });
    handleStoryGeneration({
      storyId: currentSegment.storyId,
      parentSegmentId: currentSegment.id || '',
      choice: choice
    });
  }, [currentSegment, handleStoryGeneration]);

  const finishStory = useCallback(() => {
    storyGeneration('Finishing story');
    setGameState('finished');
  }, []);

  const restartStory = useCallback(() => {
    storyGeneration('Restarting story');
    setGameState('idle');
    setStoryHistory([]);
    setCurrentSegment(null);
  }, []);

  return {
    gameState,
    currentSegment,
    storyHistory,
    isLoading: isGenerating,
    startStory,
    selectChoice,
    finishStory,
    restartStory
  };
};
