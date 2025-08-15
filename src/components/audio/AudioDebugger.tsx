
interface AudioDebuggerProps {
  src: string;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
}

import { secureConsole } from '@/utils/secureLogger';

const AudioDebugger: React.FC<AudioDebuggerProps> = ({
  src,
  isLoading,
  hasError,
  errorMessage,
  duration,
  currentTime,
  isPlaying,
}) => {
  // Debug current state
  secureConsole.debug('🎵 AudioPlayer current state:', {
    isLoading,
    hasError,
    errorMessage,
    duration,
    currentTime,
    isPlaying
  });

  // Source debugging
  secureConsole.debug('🎵 AudioPlayer component received src prop:', { src, type: typeof src, length: src ? src.length : 'N/A' });

  return null; // This component only handles debugging, no UI
};

export default AudioDebugger;
