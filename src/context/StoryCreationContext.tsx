
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { StorySegmentRow } from '@/types/stories';

interface StoryCreationState {
  gameState: 'not_started' | 'playing' | 'completed';
  currentSegment: StorySegmentRow | null;
  storyHistory: StorySegmentRow[];
  isLoading: boolean;
  isFinishingStory: boolean;
  isStoryCompleted: boolean;
  prompt: string;
  storyMode: string;
}

interface StoryCreationContextType extends StoryCreationState {
  setGameState: (state: 'not_started' | 'playing' | 'completed') => void;
  setCurrentSegment: (segment: StorySegmentRow | null) => void;
  setStoryHistory: (history: StorySegmentRow[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsFinishingStory: (finishing: boolean) => void;
  setIsStoryCompleted: (completed: boolean) => void;
  setPrompt: (prompt: string) => void;
  setStoryMode: (mode: string) => void;
  resetStoryState: () => void;
}

const initialState: StoryCreationState = {
  gameState: 'not_started',
  currentSegment: null,
  storyHistory: [],
  isLoading: false,
  isFinishingStory: false,
  isStoryCompleted: false,
  prompt: '',
  storyMode: 'Epic Fantasy'
};

const StoryCreationContext = createContext<StoryCreationContextType | undefined>(undefined);

export const useStoryCreation = () => {
  const context = useContext(StoryCreationContext);
  if (context === undefined) {
    throw new Error('useStoryCreation must be used within a StoryCreationProvider');
  }
  return context;
};

interface StoryCreationProviderProps {
  children: ReactNode;
}

export const StoryCreationProvider: React.FC<StoryCreationProviderProps> = ({ children }) => {
  const [state, setState] = useState<StoryCreationState>(initialState);

  const setGameState = useCallback((gameState: 'not_started' | 'playing' | 'completed') => {
    setState(prev => ({ ...prev, gameState }));
  }, []);

  const setCurrentSegment = useCallback((currentSegment: StorySegmentRow | null) => {
    setState(prev => ({ ...prev, currentSegment }));
  }, []);

  const setStoryHistory = useCallback((storyHistory: StorySegmentRow[]) => {
    setState(prev => ({ ...prev, storyHistory }));
  }, []);

  const setIsLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setIsFinishingStory = useCallback((isFinishingStory: boolean) => {
    setState(prev => ({ ...prev, isFinishingStory }));
  }, []);

  const setIsStoryCompleted = useCallback((isStoryCompleted: boolean) => {
    setState(prev => ({ ...prev, isStoryCompleted }));
  }, []);

  const setPrompt = useCallback((prompt: string) => {
    setState(prev => ({ ...prev, prompt }));
  }, []);

  const setStoryMode = useCallback((storyMode: string) => {
    setState(prev => ({ ...prev, storyMode }));
  }, []);

  const resetStoryState = useCallback(() => {
    setState(initialState);
  }, []);

  const contextValue: StoryCreationContextType = {
    ...state,
    setGameState,
    setCurrentSegment,
    setStoryHistory,
    setIsLoading,
    setIsFinishingStory,
    setIsStoryCompleted,
    setPrompt,
    setStoryMode,
    resetStoryState
  };

  return (
    <StoryCreationContext.Provider value={contextValue}>
      {children}
    </StoryCreationContext.Provider>
  );
};
