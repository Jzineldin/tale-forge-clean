
import { useNavigate } from 'react-router-dom';
import { useStoryGeneration } from '@/hooks/useStoryGeneration';
import { useStoryState } from '@/hooks/useStoryState';
import { useStoryActions } from './useStoryDisplay/useStoryActions';
import { useStoryData } from './useStoryDisplay/useStoryData';
import { useStorySegments } from './useStoryDisplay/useStorySegments';
import { useStoryUIState } from './useStoryDisplay/useStoryUIState';
import { useStoryInitialization } from './useStoryDisplay/useStoryInitialization';
import { useStoryHandlers } from './useStoryDisplay/useStoryHandlers';
import { useStoryInitializationLogic } from './useStoryDisplay/useStoryInitializationLogic';
import { useStoryDisplayRealtime } from './useStoryDisplay/useStoryDisplayRealtime';

export const useStoryDisplay = () => {
  const navigate = useNavigate();
  
  const storyGeneration = useStoryGeneration();
  const {
    apiUsageCount,
    showCostDialog,
    pendingAction,
    pendingParams,
    setShowCostDialog,
    setPendingAction,
    incrementApiUsage,
    addToHistory
  } = useStoryState();

  // Adapter to convert between StorySegment types
  const adaptedAddToHistory = (segment: import('./useStoryDisplay/types').StorySegment) => {
    const aiSegment: import('@/types/ai').StorySegment = {
      id: segment.id,
      storyId: segment.storyId,
      text: segment.text,
      imageUrl: segment.imageUrl || segment.image_url || '',
      choices: segment.choices,
      isEnd: segment.isEnd,
      parentSegmentId: '',
      triggeringChoiceText: segment.triggering_choice_text || '',
      imagePrompt: '',
      generationMetadata: {}
    };
    addToHistory(aiSegment);
  };

  const { confirmGeneration, handleFinishStory } = useStoryActions(
    storyGeneration,
    adaptedAddToHistory,
    incrementApiUsage
  );

  const { id, genre, prompt, characterName, mode, isInitialLoad, setIsInitialLoad, storyLoaded, setStoryLoaded } = useStoryInitialization();

  const {
    maxSegments,
    skipImage,
    setSkipImage,
    skipAudio,
    setSkipAudio,
    audioPlaying,
    setAudioPlaying,
    error,
    setError,
    showHistory,
    setShowHistory,
    viewMode,
    handleViewModeChange,
  } = useStoryUIState(mode as 'create' | 'player');

  const {
    currentStorySegment,
    setCurrentStorySegment,
    allStorySegments,
    setAllStorySegments,
    segmentCount,
    setSegmentCount,
    refetchStorySegments,
  } = useStorySegments();

  const { storyData, fetchStoryData, refreshStoryData } = useStoryData(id);

  // Set up real-time subscriptions for story segments with callback
  useStoryDisplayRealtime({
    storyId: id || '',
    currentStorySegment,
    setCurrentStorySegment,
    setAllStorySegments,
    onSegmentUpdate: setCurrentStorySegment // Pass the setter as the callback
  });

  const { showConfirmation, handleConfirmGeneration, handleChoiceSelect, handleStoryFinish } = useStoryHandlers({
    maxSegments,
    segmentCount,
    currentStorySegment,
    genre,
    prompt,
    characterName,
    skipImage,
    storyGeneration,
    showCostDialog,
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
    storyId: id,
  });

  // Enhanced view mode change that refetches data
  const setViewMode = async (newMode: 'create' | 'player') => {
    await handleViewModeChange(newMode, () => refetchStorySegments(id!, fetchStoryData));
  };

  // Initialize story loading logic - only run when we have stable data
  useStoryInitializationLogic({
    id: id || '',
    prompt,
    currentStorySegment,
    isInitialLoad,
    setIsInitialLoad,
    storyLoaded,
    setStoryLoaded,
    setAllStorySegments,
    setCurrentStorySegment,
    setSegmentCount,
    setViewMode: (mode: 'create' | 'player') => handleViewModeChange(mode, async () => {}),
    fetchStoryData,
    showConfirmation,
  });

  return {
    // State
    currentStorySegment,
    allStorySegments,
    segmentCount,
    maxSegments,
    skipImage,
    skipAudio,
    audioPlaying,
    error,
    showHistory,
    viewMode,
    
    // Story data
    storyData,
    
    // Story generation state
    storyGeneration,
    apiUsageCount,
    showCostDialog,
    pendingAction,
    pendingParams,
    
    // URL params
    id,
    genre,
    prompt,
    characterName,
    mode,
    
    // Actions
    setSkipImage,
    setSkipAudio,
    setAudioPlaying,
    setError,
    setShowHistory,
    setViewMode, // Enhanced version that refetches data
    setShowCostDialog,
    showConfirmation,
    confirmGeneration: handleConfirmGeneration,
    handleChoiceSelect,
    handleFinishStory: handleStoryFinish,
    refreshStoryData,
    setCurrentStorySegment, // Add this for the global event listener
    
    // Navigation
    navigate
  };
};

// Export the StorySegment type for use in components
export type { StorySegment } from './useStoryDisplay/types';
export type { StoryData } from './useStoryDisplay/useStoryData';
