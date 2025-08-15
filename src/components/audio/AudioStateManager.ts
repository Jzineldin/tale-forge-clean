
export const createAudioEventHandlers = (
  audio: HTMLAudioElement,
  setters: {
    setDuration: (duration: number) => void;
    setCurrentTime: (time: number) => void;
    setIsPlaying: (playing: boolean) => void;
    setIsLoading: (loading: boolean) => void;
    setHasError: (error: boolean) => void;
    setErrorMessage: (message: string) => void;
  }
) => {
  const setAudioData = () => {
    console.log('🎵 Audio loaded successfully:', {
      duration: audio.duration,
      src: audio.src,
      readyState: audio.readyState,
      networkState: audio.networkState
    });
    
    if (isFinite(audio.duration)) {
      console.log('🎵 Setting duration to:', audio.duration);
      setters.setDuration(audio.duration);
      setters.setIsLoading(false);
      console.log('🎵 Loading set to false - audio should be ready');
    } else {
      console.log('🎵 Duration is not finite:', audio.duration);
    }
    setters.setCurrentTime(audio.currentTime);
  };

  const setAudioTime = () => {
    console.log('🎵 Time update:', audio.currentTime);
    setters.setCurrentTime(audio.currentTime);
  };
  
  const onPlay = () => {
    console.log('🎵 Audio play event');
    setters.setIsPlaying(true);
  };
  
  const onPause = () => {
    console.log('🎵 Audio pause event');
    setters.setIsPlaying(false);
  };
  
  const onError = (e: Event) => {
    console.error('🎵 Audio loading error:', {
      error: e,
      src: audio.src,
      networkState: audio.networkState,
      readyState: audio.readyState,
      audioError: audio.error
    });
    
    setters.setHasError(true);
    setters.setIsLoading(false);
    setters.setErrorMessage('Unable to load audio file');
  };

  const onCanPlay = () => {
    console.log('🎵 Audio can play:', {
      duration: audio.duration,
      readyState: audio.readyState,
      networkState: audio.networkState
    });
    // Only set loading to false if we haven't already done so
    // This prevents race conditions with loadeddata
    if (isFinite(audio.duration)) {
      setters.setIsLoading(false);
    }
  };

  const onLoadedMetadata = () => {
    console.log('🎵 Audio metadata loaded:', {
      duration: audio.duration,
      readyState: audio.readyState
    });
  };

  return {
    setAudioData,
    setAudioTime,
    onPlay,
    onPause,
    onError,
    onCanPlay,
    onLoadedMetadata,
  };
};
