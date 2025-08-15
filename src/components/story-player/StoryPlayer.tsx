import React, { useState, useEffect, useRef } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  RotateCcw,
  BookmarkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StoryImage from '@/components/story-viewer/StoryImage';
import { heroGrad } from '@/lib/theme';
import { useAuthRequired } from '@/hooks/useAuthRequired';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';

interface StorySegment {
  id: string;
  segment_text: string;
  image_url?: string;
  audio_url?: string;
  image_generation_status?: string;
  word_count?: number;
  audio_duration?: number;
}

interface StoryPlayerProps {
  storyId: string;
  segments: StorySegment[];
  initialSegmentIndex?: number;
  className?: string;
  onChoice?: (segmentIndex: number, choiceIndex: number, nextSegment: string) => void;
  bookmark?: (segmentIndex: number) => void;
}

const StoryPlayer: React.FC<StoryPlayerProps> = ({ 
  segments, 
  initialSegmentIndex = 0,
  bookmark = () => {}
}) => {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(initialSegmentIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [localSegments, setLocalSegments] = useState<StorySegment[]>(segments);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentSegment = localSegments[currentSegmentIndex];
  
  const { checkAuthAndExecute, showAuthModal, setShowAuthModal } = useAuthRequired({
    feature: 'audio generation'
  });

  // Update local segments when props change, preserving existing audio URLs
  useEffect(() => {
    setLocalSegments(prevSegments => {
      const updatedSegments = segments.map((newSegment, index) => {
        const existingSegment = prevSegments[index];
        // Preserve existing audio_url if it exists
        return {
          ...newSegment,
          audio_url: existingSegment?.audio_url || newSegment.audio_url || ''
        };
      });
      return updatedSegments;
    });
  }, [segments]);

  // Remove automatic audio generation on segment change
  // Audio will only be generated when user explicitly requests it

  const generateAudioForSegment = async (segment: StorySegment) => {
    if (isGeneratingAudio) return;
    
    checkAuthAndExecute(async () => {
      setIsGeneratingAudio(true);
      setAudioError(null);
      
      try {
        console.log('🔊 Generating audio for segment:', segment.id);
        
        const { data, error } = await supabase.functions.invoke('generate-audio', {
          body: {
            text: segment.segment_text,
            voice: 'fable',
            speed: 1.0,
            segmentId: segment.id
          }
        });
        
        if (error) throw error;
        
        if (data?.audio_url) {
          // Update the segment in our local state
          setLocalSegments(prev => prev.map(seg =>
            seg.id === segment.id
              ? { ...seg, audio_url: data.audio_url, audio_duration: data.duration }
              : seg
          ));
          
          // Update in database
          await supabase
            .from('story_segments')
            .update({
              audio_url: data.audio_url,
              audio_duration: data.duration
            })
            .eq('id', segment.id);
          
          toast.success('Audio generated successfully!');
        }
      } catch (error) {
        console.error('Failed to generate audio:', error);
        setAudioError('Failed to generate audio. Please try again.');
        toast.error('Failed to generate audio');
      } finally {
        setIsGeneratingAudio(false);
      }
    });
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentSegment?.audio_url) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => {
          console.error('Error playing audio:', error);
          setAudioError('Failed to play audio');
          setIsPlaying(false);
        });
    }
  };

  const goToNextSegment = () => {
    if (currentSegmentIndex < localSegments.length - 1) {
      setCurrentSegmentIndex(currentSegmentIndex + 1);
      setCurrentTime(0);
      setIsPlaying(false);
      setAudioError(null);
    }
  };

  const goToPreviousSegment = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(currentSegmentIndex - 1);
      setCurrentTime(0);
      setIsPlaying(false);
      setAudioError(null);
    }
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
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

  const handleAudioEnd = () => {
    setIsPlaying(false);
    if (currentSegmentIndex < localSegments.length - 1) {
      setTimeout(() => goToNextSegment(), 1000);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="w-4 h-4" />;
    if (volume < 0.5) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center py-8">
      <article className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl">
        {/* subtle hero burst */}
        <div className={heroGrad + ' absolute inset-0 z-0 pointer-events-none'}/>

        {/* thin progress ribbon inside the card shadow */}
        <div
          className="card-progress absolute top-0 left-0 z-20"
          style={{ width: `${((currentSegmentIndex + 1) / localSegments.length) * 100}%` }}
        />

        {/* glass card */}
        <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-6 sm:p-8 z-10">

          {/* top nav */}
          <header className="border-b border-slate-300/20 dark:border-slate-700/20 pb-3 mb-6">
            <div className="flex items-center justify-between text-sm text-indigo-600 dark:text-indigo-400">
              <span>Story • {currentSegmentIndex + 1} / {localSegments.length}</span>
              <button onClick={() => bookmark(currentSegmentIndex)} className="hover:text-indigo-800">
                <BookmarkIcon className="w-5 h-5" />
              </button>
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
              Chapter {currentSegmentIndex + 1}
            </h1>
          </header>

          {/* rich body */}
          <section className="prose prose-slate dark:prose-invert max-w-none">
            {currentSegment?.image_url && (
              <figure className="mb-5 rounded-xl overflow-hidden shadow-sm">
                <StoryImage
                  imageUrl={currentSegment.image_url}
                  imageGenerationStatus={currentSegment.image_generation_status || ''}
                  altText={`Chapter ${currentSegmentIndex + 1}`}
                  className="w-full aspect-[16/9] object-cover"
                />
              </figure>
            )}
            <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
              {currentSegment?.segment_text}
            </p>
          </section>

          {/* Audio Player Controls */}
          {currentSegment?.audio_url && (
            <div className="mt-6 p-4 bg-slate-100/50 dark:bg-slate-700/50 rounded-xl">
              <audio
                ref={audioRef}
                src={currentSegment.audio_url}
                preload="metadata"
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                onEnded={handleAudioEnd}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setAudioError('Failed to load audio')}
              />

              {/* Progress Bar */}
              <div className="mb-4">
                <div 
                  className="w-full h-2 bg-slate-300 dark:bg-slate-600 rounded-full cursor-pointer"
                  onClick={handleSeek}
                >
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-100"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Main Control Buttons */}
              <div className="flex items-center justify-center space-x-4 mb-4">
                <Button
                  onClick={goToPreviousSegment}
                  disabled={currentSegmentIndex === 0}
                  variant="ghost"
                  size="sm"
                  className="fantasy-heading text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50"
                >
                  <SkipBack className="w-6 h-6" />
                </Button>

                <Button
                  onClick={togglePlayPause}
                  disabled={!currentSegment?.audio_url || isGeneratingAudio}
                  size="lg"
                  className="fantasy-heading bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 rounded-full w-16 h-16"
                >
                  {isGeneratingAudio ? (
                    <LoadingSpinner size="sm" className="w-6 h-6 " />
                  ) : isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </Button>

                <Button
                  onClick={goToNextSegment}
                  disabled={currentSegmentIndex === localSegments.length - 1}
                  variant="ghost"
                  size="sm"
                  className="fantasy-heading text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50"
                >
                  <SkipForward className="w-6 h-6" />
                </Button>
              </div>

              {/* Volume and Additional Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getVolumeIcon()}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 accent-indigo-500"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  {!currentSegment?.audio_url && !isGeneratingAudio && (
                    <Button
                      onClick={() => generateAudioForSegment(currentSegment)}
                      variant="outline"
                      size="sm"
                      className="fantasy-heading text-indigo-600 border-indigo-600 hover:bg-indigo-600 hover:text-white"
                    >
                      <Volume2 className="w-4 h-4 mr-1" />
                      Generate Audio
                    </Button>
                  )}
                  
                  {audioError && (
                    <Button
                      onClick={() => {
                        setAudioError(null);
                        if (currentSegment) generateAudioForSegment(currentSegment);
                      }}
                      variant="outline"
                      size="sm"
                      className="fantasy-heading text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>

              {/* Status Messages */}
              {isGeneratingAudio && (
                <div className="mt-4 text-center text-indigo-600 dark:text-indigo-400 text-sm flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" className="w-4 h-4 " />
                  <span>Generating audio for this chapter...</span>
                </div>
              )}
              
              {audioError && (
                <div className="mt-4 text-center text-red-500 text-sm">
                  {audioError}
                </div>
              )}
            </div>
          )}

          {/* Chapter Navigation */}
          <footer className="mt-8 border-t border-slate-300/20 dark:border-slate-700/20 pt-6">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {localSegments.map((segment, index) => (
                <Button
                  key={segment.id}
                  onClick={() => {
                    setCurrentSegmentIndex(index);
                    setCurrentTime(0);
                    setIsPlaying(false);
                    setAudioError(null);
                  }}
                  variant={index === currentSegmentIndex ? "default" : "outline"}
                  size="sm"
                  className={`fantasy-heading flex-shrink-0 ${
                    index === currentSegmentIndex
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                      : 'border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20'
                  }`}
                >
                  <span>Chapter {index + 1}</span>
                  {segment.audio_url && (
                    <Volume2 className="w-3 h-3 ml-1" />
                  )}
                </Button>
              ))}
            </div>
          </footer>
        </div>
      </article>
      
      {/* Authentication Required Modal */}
      <AuthRequiredModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        feature="audio generation"
      />
    </main>
  );
};

export default StoryPlayer;
