
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStoryCreation } from '@/context/StoryCreationContext';
import { useUnifiedStoryGame } from '@/hooks/useUnifiedStoryGame';
import { CheckedState } from '@radix-ui/react-checkbox';


interface StoryCreationContainerProps {
  children: (props: {
    // State
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
    
    // Actions
    handleGoHome: () => void;
    handleRestartStory: () => void;
    handleSkipImageChange: (checked: CheckedState) => void;
    showConfirmation: (action: 'start' | 'choice' | 'finish', choice?: string) => void;
    confirmGeneration: () => Promise<void>;
    setShowCostDialog: (show: boolean) => void;
  }) => React.ReactNode;
}

export const StoryCreationContainer: React.FC<StoryCreationContainerProps> = ({ children }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showCostDialog, setShowCostDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'start' | 'choice' | 'finish' | null>(null);
  const [pendingChoice, setPendingChoice] = useState<string>('');
  const [skipImage, setSkipImage] = useState(false);
  const [apiCallsCount, setApiCallsCount] = useState(0);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  
  const {
    resetStoryState
  } = useStoryCreation();

  const {
    gameState,
    currentSegment,
    storyHistory,
    isLoading,
    isFinishingStory,
    isStoryCompleted,
    error: hookError,
    handleStartStory,
    handleSelectChoice,
    handleFinishStory,
    handleRestart
  } = useUnifiedStoryGame();

  // Auto-start story from URL params
  useEffect(() => {
    const urlPrompt = searchParams.get('prompt');
    const urlMode = searchParams.get('mode');
    
    console.log('🔧 StoryCreation: URL params:', { urlPrompt, urlMode });
    
    if (urlPrompt && urlMode && !hasAutoStarted && gameState === 'not_started') {
      console.log('✨ Auto-starting story creation...');
      setHasAutoStarted(true);
      setApiCallsCount(prev => prev + 1);
      
      handleStartStory(urlPrompt, urlMode, { skipImage })
        .then(() => {
          console.log('✅ Auto-start successful');
        })
        .catch((error) => {
          console.error('❌ Auto-start failed:', error);
          setHasAutoStarted(false);
        });
    }
  }, [searchParams, hasAutoStarted, gameState, handleStartStory, skipImage]);

  const handleGoHome = () => {
    if (gameState !== 'not_started' && !window.confirm('Are you sure you want to leave? Your story progress will be lost.')) {
      return;
    }
    resetStoryState();
    navigate('/');
  };

  const handleRestartStory = () => {
    console.log('🔄 Restarting story from StoryCreation');
    handleRestart();
    resetStoryState();
    setApiCallsCount(0);
    setHasAutoStarted(false);
  };

  const handleSkipImageChange = (checked: CheckedState) => {
    console.log('🖼️ Skip image changed:', checked);
    setSkipImage(checked === true);
  };

  const showConfirmation = async (action: 'start' | 'choice' | 'finish', choice?: string) => {
    console.log('💰 showConfirmation called with:', { action, choice });
    
    // Direct generation without confirmation dialog
    setApiCallsCount(prev => prev + 1);
    
    try {
      if (action === 'choice' && choice) {
        console.log('🎯 Direct choice selection...');
        await handleSelectChoice(choice, { skipImage });
      } else if (action === 'finish') {
        console.log('🏁 Direct story finish...');
        await handleFinishStory();
      }
    } catch (error) {
      console.error('❌ Direct generation failed:', error);
    }
  };

  const confirmGeneration = async () => {
    console.log('✅ confirmGeneration called with:', { 
      pendingAction, 
      pendingChoice, 
      skipImage 
    });
    
    setShowCostDialog(false);
    setApiCallsCount(prev => prev + 1);
    
    try {
      if (pendingAction === 'choice' && pendingChoice) {
        console.log('🎯 Confirming choice selection...');
        await handleSelectChoice(pendingChoice, { skipImage });
      } else if (pendingAction === 'finish') {
        console.log('🏁 Confirming story finish...');
        await handleFinishStory();
      }
    } catch (error) {
      console.error('❌ Generation confirmation failed:', error);
    }
    
    setPendingAction(null);
    setPendingChoice('');
  };

  console.log('📊 StoryCreation final state:', {
    gameState,
    currentSegment: currentSegment ? {
      id: currentSegment.id,
      story_id: currentSegment.story_id,
      hasText: !!currentSegment.segment_text,
      hasChoices: currentSegment.choices?.length || 0,
      isEnd: currentSegment.is_end,
    } : null,
    isLoading,
    isStoryCompleted,
    storyHistoryCount: storyHistory.length,
    apiCallsCount,
    hasAutoStarted,
    hookError: hookError?.substring(0, 100)
  });

  return children({
    // State
    gameState,
    currentSegment,
    storyHistory,
    isLoading,
    isFinishingStory,
    isStoryCompleted,
    prompt: searchParams.get('prompt') || '',
    storyMode: searchParams.get('mode') || '',
    skipImage,
    apiCallsCount,
    showCostDialog,
    pendingAction,
    hookError,
    
    // Actions
    handleGoHome,
    handleRestartStory,
    handleSkipImageChange,
    showConfirmation,
    confirmGeneration,
    setShowCostDialog
  });
};
