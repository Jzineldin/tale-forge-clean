import { useState } from 'react';

export const useStoryUIState = (initialMode: 'create' | 'player' = 'create') => {
  const [maxSegments] = useState(8);
  const [skipImage, setSkipImage] = useState(false);
  const [skipAudio, setSkipAudio] = useState(true); // Always true during story creation
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [viewMode, setViewModeState] = useState<'create' | 'player'>(initialMode);

  const handleViewModeChange = async (
    newMode: 'create' | 'player',
    refetchStorySegments: () => Promise<void>
  ) => {
    console.log('🔄 Switching view mode from', viewMode, 'to', newMode);
    setViewModeState(newMode);
    // Refetch data when switching modes to ensure we have the latest audio data
    await refetchStorySegments();
  };

  return {
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
    setViewMode: setViewModeState,
    handleViewModeChange,
  };
};