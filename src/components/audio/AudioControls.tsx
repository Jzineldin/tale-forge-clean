
import React from 'react';
import { Play, Pause, Volume2, VolumeX, Rewind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AudioControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  hasError: boolean;
  onTogglePlayPause: () => void;
  onRestart: () => void;
  onToggleMute: () => void;
  onVolumeChange: (value: number[]) => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  isMuted,
  volume,
  hasError,
  onTogglePlayPause,
  onRestart,
  onToggleMute,
  onVolumeChange,
}) => {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-2 md:gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onTogglePlayPause} 
              className="flex-shrink-0"
              disabled={hasError}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{isPlaying ? 'Pause' : 'Play'}</p></TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onRestart} 
              className="flex-shrink-0"
              disabled={hasError}
            >
              <Rewind className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Restart</p></TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleMute} 
              className="flex-shrink-0"
              disabled={hasError}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{isMuted ? 'Unmute' : 'Mute'}</p></TooltipContent>
        </Tooltip>
        
        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.01}
          className="w-16 md:w-24"
          onValueChange={onVolumeChange}
          disabled={hasError}
        />
      </div>
    </TooltipProvider>
  );
};

export default AudioControls;
