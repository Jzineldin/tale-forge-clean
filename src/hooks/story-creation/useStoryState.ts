
import { useState, useRef } from 'react';
import { StorySegment } from '@/types/stories';

export type { StorySegment };

export const useStoryState = () => {
  const [currentSegment, setCurrentSegment] = useState<StorySegment | null>(null);
  const [storyHistory, setStoryHistory] = useState<StorySegment[]>([]);
  const [showCostDialog, setShowCostDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'start' | 'choice' | 'audio' | null>(null);
  const [pendingChoice, setPendingChoice] = useState<string>('');
  const [skipImage, setSkipImage] = useState(false);
  const [apiCallsCount, setApiCallsCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('jbHveVx08UsDYum4fcml'); // Default to Kevin - Founder
  const [fullStoryAudioUrl, setFullStoryAudioUrl] = useState<string | null>(null);
  const [showImageSettings, setShowImageSettings] = useState(true);

  // Loading states
  const [isGeneratingStartup, setIsGeneratingStartup] = useState(false);
  const [isGeneratingChoice, setIsGeneratingChoice] = useState(false);
  const [isGeneratingEnding, setIsGeneratingEnding] = useState(false);

  // Use refs to prevent duplicate calls
  const generationStartedRef = useRef(false);
  const initializedRef = useRef(false);

  const resetStory = () => {
    setError(null);
    generationStartedRef.current = false;
    initializedRef.current = false;
    setCurrentSegment(null);
    setStoryHistory([]);
    setIsGeneratingStartup(false);
    setIsGeneratingChoice(false);
    setIsGeneratingEnding(false);
    setShowImageSettings(true);
  };

  const isCurrentlyGenerating = isGeneratingStartup || isGeneratingChoice || isGeneratingEnding;

  return {
    // State
    currentSegment,
    storyHistory,
    showCostDialog,
    pendingAction,
    pendingChoice,
    skipImage,
    apiCallsCount,
    error,
    selectedVoice,
    fullStoryAudioUrl,
    showImageSettings,
    isGeneratingStartup,
    isGeneratingChoice,
    isGeneratingEnding,
    isCurrentlyGenerating,
    generationStartedRef,
    initializedRef,

    // Setters
    setCurrentSegment,
    setStoryHistory,
    setShowCostDialog,
    setPendingAction,
    setPendingChoice,
    setSkipImage,
    setApiCallsCount,
    setError,
    setSelectedVoice,
    setFullStoryAudioUrl,
    setShowImageSettings,
    setIsGeneratingStartup,
    setIsGeneratingChoice,
    setIsGeneratingEnding,

    // Actions
    resetStory,
  };
};
