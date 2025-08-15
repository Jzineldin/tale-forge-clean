
import React, { useRef, useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioControls from '@/components/audio/AudioControls';
import AudioProgress from '@/components/audio/AudioProgress';
import AudioDebugger from '@/components/audio/AudioDebugger';
import { createAudioEventHandlers } from '@/components/audio/AudioStateManager';
import { debug } from '@/utils/secureLogger';

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = React.memo(({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    debug('AudioPlayer useEffect triggered', { src }, 'AudioPlayer');
    
    const audio = audioRef.current;
    if (!audio) {
      debug('AudioPlayer: No audio ref available', undefined, 'AudioPlayer');
      return;
    }

    debug('AudioPlayer: Starting loading process', undefined, 'AudioPlayer');
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    const eventHandlers = createAudioEventHandlers(audio, {
      setDuration,
      setCurrentTime,
      setIsPlaying,
      setIsLoading,
      setHasError,
      setErrorMessage,
    });

    // Add essential event listeners
    console.log('🎵 Adding essential event listeners');
    audio.addEventListener('loadedmetadata', eventHandlers.onLoadedMetadata);
    audio.addEventListener('loadeddata', eventHandlers.setAudioData);
    audio.addEventListener('canplay', eventHandlers.onCanPlay);
    audio.addEventListener('timeupdate', eventHandlers.setAudioTime);
    audio.addEventListener('play', eventHandlers.onPlay);
    audio.addEventListener('pause', eventHandlers.onPause);
    audio.addEventListener('ended', eventHandlers.onPause);
    audio.addEventListener('error', eventHandlers.onError);

    // Test if the audio URL is accessible
    console.log('🎵 Testing URL accessibility:', src);
    fetch(src, { method: 'HEAD' })
      .then(response => {
        console.log('🎵 Audio URL accessibility test result:', {
          url: src,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        console.log('🎵 URL is accessible, proceeding with audio load');
      })
      .catch(error => {
        console.error('🎵 Audio URL not accessible:', error);
        setHasError(true);
        setIsLoading(false);
        setErrorMessage(`Audio file not accessible: ${error.message}`);
      });

    return () => {
      console.log('🎵 Cleaning up audio element and event listeners');
      if (audio) {
        audio.pause();
      }
      audio.removeEventListener('loadedmetadata', eventHandlers.onLoadedMetadata);
      audio.removeEventListener('loadeddata', eventHandlers.setAudioData);
      audio.removeEventListener('canplay', eventHandlers.onCanPlay);
      audio.removeEventListener('timeupdate', eventHandlers.setAudioTime);
      audio.removeEventListener('play', eventHandlers.onPlay);
      audio.removeEventListener('pause', eventHandlers.onPause);
      audio.removeEventListener('ended', eventHandlers.onPause);
      audio.removeEventListener('error', eventHandlers.onError);
    };
  }, [src]);

  const togglePlayPause = () => {
    console.log('🎵 Toggle play/pause clicked');
    const audio = audioRef.current;
    if (!audio || hasError) {
      console.log('🎵 Cannot play - no audio ref or has error');
      return;
    }

    if (audio.paused) {
      console.log('🎵 Attempting to play audio');
      audio.play().catch(err => {
        console.error('🎵 Play error:', err);
        setErrorMessage('Failed to play audio');
        setHasError(true);
      });
    } else {
      console.log('🎵 Pausing audio');
      audio.pause();
    }
  };

  const restartAudio = () => {
    console.log('🎵 Restart audio clicked');
    if (audioRef.current && !hasError) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.error('🎵 Restart error:', err);
        setErrorMessage('Failed to restart audio');
        setHasError(true);
      });
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    setVolume(newVolume);
    audio.volume = newVolume;
    audio.muted = newVolume === 0;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
    if (!audio.muted && volume === 0) {
      handleVolumeChange([0.5]);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  console.log('🎵 Rendering audio player with state:', { isLoading, hasError, errorMessage });

  return (
    <>
      <AudioDebugger
        src={src}
        isLoading={isLoading}
        hasError={hasError}
        errorMessage={errorMessage}
        duration={duration}
        currentTime={currentTime}
        isPlaying={isPlaying}
      />
      
      {/* Always render the audio element - this is the key fix */}
      <audio ref={audioRef} src={src} preload="metadata" className="sr-only" />
      
      {/* Conditionally render UI based on state */}
      {hasError ? (
        <div className="flex items-center gap-2 w-full bg-destructive/10 border border-destructive/20 p-2 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-destructive font-medium">Audio Error</p>
            <p className="text-xs text-destructive/80">{errorMessage}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="border-destructive/20 text-destructive hover:bg-destructive/10"
          >
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex items-center gap-2 w-full bg-muted border p-2 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary flex-shrink-0"></div>
          <div className="flex-1">
            <p className="text-sm font-medium">Loading audio...</p>
            <p className="text-xs text-muted-foreground">Please wait while the audio loads</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 md:gap-4 w-full bg-background border p-2 rounded-lg shadow-sm">
          <AudioControls
            isPlaying={isPlaying}
            isMuted={isMuted}
            volume={volume}
            hasError={hasError}
            onTogglePlayPause={togglePlayPause}
            onRestart={restartAudio}
            onToggleMute={toggleMute}
            onVolumeChange={handleVolumeChange}
          />
          
          <AudioProgress
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />
        </div>
      )}
    </>
  );
});

// Display name for debugging
AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;
