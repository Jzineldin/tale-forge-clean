/**
 * React Hook for Progress Persistence
 * Integrates the progress persistence system with story display components
 */

import { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  saveStoryProgress,
  loadStoryProgress,
  updateCurrentChapter,
  addUserChoice,
  addStorySegment,
  markStoryCompleted,
  saveUserPreferences,
  getUserPreferences,
  getLastActiveStory,
  hasStoryProgress,
  clearStoryProgress,
  type StoryProgress,
  type GlobalProgressState
} from '@/utils/progressPersistence';

export const useProgressPersistence = () => {
  const { id: storyId } = useParams<{ id: string }>();
  
  const [isRestoring, setIsRestoring] = useState(false);
  const [userPreferences, setUserPreferences] = useState(getUserPreferences());

  // Initialize story progress when component mounts
  const initializeStoryProgress = useCallback((
    storyId: string,
    storyTitle: string,
    genre: string,
    prompt: string
  ) => {
    const existingProgress = loadStoryProgress(storyId);
    
    if (!existingProgress) {
      // Create new progress entry
      const newProgress: StoryProgress = {
        storyId,
        currentChapterIndex: 0,
        storySegments: [],
        userChoices: [],
        lastUpdated: new Date().toISOString(),
        isCompleted: false,
        storyTitle,
        genre,
        prompt
      };
      
      saveStoryProgress(newProgress);
      return newProgress;
    }
    
    return existingProgress;
  }, []);

  // Save current story state
  const saveCurrentProgress = useCallback((
    segments: any[],
    currentChapterIndex: number,
    userChoices: string[] = [],
    isCompleted: boolean = false
  ) => {
    if (!storyId) return;

    const progress: StoryProgress = {
      storyId,
      currentChapterIndex,
      storySegments: segments,
      userChoices,
      lastUpdated: new Date().toISOString(),
      isCompleted,
      storyTitle: segments[0]?.segment_text?.substring(0, 100) + '...' || 'Untitled Story',
      genre: 'fantasy', // This should come from the story data
      prompt: '' // This should come from the story data
    };

    saveStoryProgress(progress);
  }, [storyId]);

  // Restore story progress
  const restoreStoryProgress = useCallback(() => {
    if (!storyId) return null;

    setIsRestoring(true);
    try {
      const progress = loadStoryProgress(storyId);
      if (progress) {
        console.log('🔄 Restoring story progress:', {
          storyId,
          chapterCount: progress.storySegments.length,
          currentChapter: progress.currentChapterIndex,
          isCompleted: progress.isCompleted
        });
        
        // Update current chapter in global state
        updateCurrentChapter(storyId, progress.currentChapterIndex);
        
        return progress;
      }
    } catch (error) {
      console.error('❌ Failed to restore story progress:', error);
    } finally {
      setIsRestoring(false);
    }
    
    return null;
  }, [storyId]);

  // Add a new segment to progress
  const addSegmentToProgress = useCallback((segment: any) => {
    if (!storyId) return;
    addStorySegment(storyId, segment);
  }, [storyId]);

  // Add user choice to progress
  const addChoiceToProgress = useCallback((choice: string) => {
    if (!storyId) return;
    addUserChoice(storyId, choice);
  }, [storyId]);

  // Update current chapter
  const updateChapter = useCallback((chapterIndex: number) => {
    if (!storyId) return;
    updateCurrentChapter(storyId, chapterIndex);
  }, [storyId]);

  // Mark story as completed
  const completeStory = useCallback(() => {
    if (!storyId) return;
    markStoryCompleted(storyId);
  }, [storyId]);

  // Save user preferences
  const savePreferences = useCallback((preferences: Partial<GlobalProgressState['userPreferences']>) => {
    const newPreferences = { ...userPreferences, ...preferences };
    setUserPreferences(newPreferences);
    saveUserPreferences(newPreferences);
  }, [userPreferences]);

  // Check if story has progress
  const hasProgress = useCallback(() => {
    return storyId ? hasStoryProgress(storyId) : false;
  }, [storyId]);

  // Clear story progress
  const clearProgress = useCallback(() => {
    if (!storyId) return;
    clearStoryProgress(storyId);
  }, [storyId]);

  // Get last active story
  const getLastActive = useCallback(() => {
    return getLastActiveStory();
  }, []);

  // Auto-save progress when component unmounts
  useEffect(() => {
    return () => {
      // This will be called when component unmounts
      // We could implement auto-save here if needed
    };
  }, []);

  return {
    // State
    isRestoring,
    userPreferences,
    
    // Actions
    initializeStoryProgress,
    saveCurrentProgress,
    restoreStoryProgress,
    addSegmentToProgress,
    addChoiceToProgress,
    updateChapter,
    completeStory,
    savePreferences,
    hasProgress,
    clearProgress,
    getLastActive
  };
}; 