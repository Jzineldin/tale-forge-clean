
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface AudioProgressProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const AudioProgress: React.FC<AudioProgressProps> = ({
  currentTime,
  duration,
  onSeek,
}) => {
  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 flex-grow">
      <div className="text-sm font-mono text-muted-foreground w-12 text-center">
        {formatTime(currentTime)}
      </div>
      
      <Slider
        value={[currentTime]}
        max={duration || 100}
        step={1}
        className="flex-grow"
        onValueChange={(value) => onSeek(value[0])}
      />
      
      <div className="text-sm font-mono text-muted-foreground w-12 text-center">
        {formatTime(duration)}
      </div>
    </div>
  );
};

export default AudioProgress;
