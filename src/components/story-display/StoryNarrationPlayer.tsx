
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Play, 
  Pause, 
  Volume2,
  VolumeX,
  Volume1,
  Music,
  SkipBack,
  SkipForward,
  Clock
} from 'lucide-react';

interface StoryNarrationPlayerProps {
  storyId: string;
  narrationAudioUrl?: string | null;
  storyTitle?: string;
  isVisible?: boolean;
}

const StoryNarrationPlayer: React.FC<StoryNarrationPlayerProps> = ({ 
  storyId,
  narrationAudioUrl,
  storyTitle = "Story Narration",
  isVisible = true
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Reset player when story changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [storyId, narrationAudioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [narrationAudioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current || !narrationAudioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Audio play error:', err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="w-4 h-4" />;
    if (volume < 0.5) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };

  if (!isVisible) {
    return null;
  }

  // Show waiting state when no audio is available
  if (!narrationAudioUrl) {
    return (
      <Card className="bg-slate-800/90 border-slate-600/30 sticky bottom-4 mx-4 shadow-2xl backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Music className="w-5 h-5 text-slate-400" />
            <div className="flex-1">
              <h4 className="text-slate-300 font-medium text-sm">{storyTitle}</h4>
              <p className="text-slate-500 text-xs">Full Story Narration</p>
            </div>
          </div>

          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Narration not yet generated</span>
            </div>
            <p className="text-xs text-slate-500">
              Complete your story and generate narration to unlock audio playback
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/90 border-amber-500/30 sticky bottom-4 mx-4 shadow-2xl backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Music className="w-5 h-5 text-amber-400" />
          <div className="flex-1">
            <h4 className="text-amber-300 font-medium text-sm">{storyTitle}</h4>
            <p className="text-gray-400 text-xs">Full Story Narration</p>
          </div>
        </div>

        <audio 
          ref={audioRef} 
          src={narrationAudioUrl}
          preload="metadata"
          onLoadedMetadata={() => {
            if (audioRef.current) {
              audioRef.current.volume = volume;
            }
          }}
        />
        
        {/* Progress Bar */}
        <div 
          className="w-full h-2 bg-slate-700 rounded-full cursor-pointer mb-2"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-amber-400 rounded-full transition-all duration-100"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        
        {/* Time Display */}
        <div className="flex justify-between text-xs text-gray-400 mb-3">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => skipTime(-10)}
              size="sm"
              variant="ghost"
              className="text-amber-300 hover:bg-amber-500/20 h-8 w-8 p-0"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={togglePlayPause}
              size="sm"
              className="bg-amber-400 text-slate-900 hover:bg-amber-300 rounded-full w-10 h-10 p-0"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              onClick={() => skipTime(10)}
              size="sm"
              variant="ghost"
              className="text-amber-300 hover:bg-amber-500/20 h-8 w-8 p-0"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {getVolumeIcon()}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 accent-amber-400"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryNarrationPlayer;
