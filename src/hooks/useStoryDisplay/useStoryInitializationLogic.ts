
import { useEffect, useRef, useCallback } from 'react';
import { useStoryLoader } from './useStoryLoader';
import { StorySegment } from './types';
import { isValidUUID } from './utils';

interface UseStoryInitializationLogicProps {
  id: string;
  prompt: string;
  currentStorySegment: StorySegment | null;
  isInitialLoad: boolean;
  setIsInitialLoad: (value: boolean) => void;
  storyLoaded: boolean;
  setStoryLoaded: (value: boolean) => void;
  setAllStorySegments: (segments: StorySegment[]) => void;
  setCurrentStorySegment: (segment: StorySegment | null) => void;
  setSegmentCount: (count: number) => void;
  setViewMode: (mode: 'create' | 'player') => void;
  fetchStoryData: (id: string) => Promise<void>;
  showConfirmation: (action: 'start' | 'choice', choice?: string) => void;
}

export const useStoryInitializationLogic = ({
  id,
  prompt,
  currentStorySegment,
  isInitialLoad,
  setIsInitialLoad,
  storyLoaded,
  setStoryLoaded,
  setAllStorySegments,
  setCurrentStorySegment,
  setSegmentCount,
  setViewMode,
  fetchStoryData,
  showConfirmation,
}: UseStoryInitializationLogicProps) => {
  const { loadExistingStory } = useStoryLoader();
  const initializationAttempted = useRef(false);

  // Memoized story loader with callback
  const loadExistingStoryWithCallback = useCallback(async (storyId: string) => {
    console.log('📖 Attempting to load existing story:', storyId);
    
    const success = await loadExistingStory(
      storyId, 
      setAllStorySegments, 
      setCurrentStorySegment, 
      setSegmentCount, 
      setViewMode
    );
    
    setStoryLoaded(success);
    console.log('📖 Story load result:', { storyId, success });
    return success;
  }, [loadExistingStory, setAllStorySegments, setCurrentStorySegment, setSegmentCount, setViewMode, setStoryLoaded]);

  // Memoized story flow handler
  const handleStoryFlow = useCallback(async () => {
    if (initializationAttempted.current) {
      console.log('🔍 Initialization already attempted, skipping...');
      return;
    }

    console.log('🔍 Starting story initialization:', { 
      id, 
      isValidId: isValidUUID(id), 
      isInitialLoad, 
      prompt, 
      hasCurrentSegment: !!currentStorySegment,
      storyLoaded
    });

    initializationAttempted.current = true;
    
    if (id && isValidUUID(id)) {
      // Try to load existing story first
      const loaded = await loadExistingStoryWithCallback(id);
      if (id) await fetchStoryData(id);
      
      // If no existing story was loaded but we have a prompt, auto-start generation
      if (!loaded && isInitialLoad && prompt && !currentStorySegment) {
        console.log('🚀 No existing story found, auto-starting generation for prompt:', prompt);
        // Auto-start generation for new stories
        showConfirmation('start');
      }
      
      // Mark initial load as complete
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } else if (isInitialLoad && prompt && !currentStorySegment) {
      // Fallback for invalid IDs with prompts - auto-start generation
      console.log('🚀 Auto-starting story generation for prompt:', prompt);
      showConfirmation('start');
      setIsInitialLoad(false);
    }
  }, [id, isInitialLoad, prompt, currentStorySegment, storyLoaded, loadExistingStoryWithCallback, fetchStoryData, showConfirmation, setIsInitialLoad]);

  // Load existing story segments if available, or start new story generation
  useEffect(() => {
    // Only run on mount or when critical values change
    if (id && (isInitialLoad || !initializationAttempted.current)) {
      handleStoryFlow();
    }
  }, [id, prompt]); // Only depend on stable values

  // Separate effect to handle story data fetching when ID changes
  useEffect(() => {
    if (id && isValidUUID(id) && !initializationAttempted.current) {
      console.log('📚 ID changed, fetching story data:', id);
      fetchStoryData(id);
    }
  }, [id, fetchStoryData]);
};
