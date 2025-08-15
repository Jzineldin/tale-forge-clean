import { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface StoryChoices {
  [segmentId: string]: string[];
}

export const useStoryChoices = () => {
  const [choices, setChoices] = useState<StoryChoices>({});
  const choicesRef = useRef<StoryChoices>({});
  const queryClient = useQueryClient();
  
  // Update both state and ref
  const updateChoices = useCallback((segmentId: string, newChoices: string[]) => {
    if (newChoices && newChoices.length > 0) {
      const updatedChoices = { ...choicesRef.current, [segmentId]: newChoices };
      choicesRef.current = updatedChoices;
      setChoices(updatedChoices);
      console.log(`[useStoryChoices] Updated choices for segment ${segmentId}:`, newChoices);
    }
  }, []);

  // Get choices for a specific segment with merge logic
  const getChoices = useCallback((segmentId: string): string[] => {
    // PATCH: Merge logic - prefer stored choices, then database
    const storedChoices = choicesRef.current[segmentId];
    if (storedChoices && storedChoices.length > 0) {
      console.log(`[useStoryChoices] Using stored choices for segment ${segmentId}:`, storedChoices);
      return storedChoices;
    }
    
    // Fallback to database cache
    try {
      const storyData = queryClient.getQueryData(['story']) as any;
      if (storyData?.story_segments) {
        const segment = storyData.story_segments.find((s: any) => s.id === segmentId);
        if (segment?.choices && segment.choices.length > 0) {
          console.log(`[useStoryChoices] Using database choices for segment ${segmentId}:`, segment.choices);
          // Store in durable store for future use
          updateChoices(segmentId, segment.choices);
          return segment.choices;
        }
      }
    } catch (error) {
      console.warn('[useStoryChoices] Error getting choices from cache:', error);
    }
    
    console.log(`[useStoryChoices] No choices found for segment ${segmentId}`);
    return [];
  }, [queryClient, updateChoices]);

  // Check if choices exist for a segment
  const hasChoices = useCallback((segmentId: string): boolean => {
    const choices = getChoices(segmentId);
    return choices.length > 0;
  }, [getChoices]);

  // Clear choices for a specific segment
  const clearChoices = useCallback((segmentId: string) => {
    const updatedChoices = { ...choicesRef.current };
    delete updatedChoices[segmentId];
    choicesRef.current = updatedChoices;
    setChoices(updatedChoices);
    console.log(`[useStoryChoices] Cleared choices for segment ${segmentId}`);
  }, []);

  // Clear all choices
  const clearAllChoices = useCallback(() => {
    choicesRef.current = {};
    setChoices({});
    console.log('[useStoryChoices] Cleared all choices');
  }, []);

  // Restore choices from database when component mounts, but preserve existing stored choices
  useEffect(() => {
    const restoreChoicesFromDatabase = () => {
      try {
        const storyData = queryClient.getQueryData(['story']) as any;
        if (storyData?.story_segments) {
          storyData.story_segments.forEach((segment: any) => {
            // Only restore if we don't already have stored choices for this segment
            if (segment.choices && segment.choices.length > 0 && !choicesRef.current[segment.id]) {
              console.log(`[useStoryChoices] Restoring choices from database for segment ${segment.id}:`, segment.choices);
              updateChoices(segment.id, segment.choices);
            }
          });
        }
      } catch (error) {
        console.warn('[useStoryChoices] Error restoring choices from database:', error);
      }
    };

    // Restore immediately
    restoreChoicesFromDatabase();

    // Also restore when query data changes, but be careful not to overwrite existing stored choices
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      restoreChoicesFromDatabase();
    });

    return unsubscribe;
  }, [queryClient, updateChoices]);

  return {
    choices,
    updateChoices,
    getChoices,
    hasChoices,
    clearChoices,
    clearAllChoices
  };
}; 