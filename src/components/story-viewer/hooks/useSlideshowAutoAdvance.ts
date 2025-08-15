
import { useEffect, useRef, useState } from 'react';
import { StorySegmentRow } from '@/types/stories';

interface UseSlideshowAutoAdvanceProps {
  isPlaying: boolean;
  autoAdvance: boolean;
  segments: StorySegmentRow[];
  currentSlide: number;
  setCurrentSlide: (value: number | ((prev: number) => number)) => void;
  setIsPlaying: (value: boolean) => void;
  fullStoryAudioUrl?: string;
}

export const useSlideshowAutoAdvance = ({
  isPlaying,
  autoAdvance,
  segments,
  currentSlide,
  setCurrentSlide,
  setIsPlaying,
  fullStoryAudioUrl,
}: UseSlideshowAutoAdvanceProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [segmentTimings, setSegmentTimings] = useState<{ start: number; end: number }[]>([]);

  // Initialize audio and calculate segment timings using word count distribution
  useEffect(() => {
    if (fullStoryAudioUrl && segments.length > 0) {
      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio(fullStoryAudioUrl);
        audio.preload = 'metadata';
        audioRef.current = audio;
      }

      

      const handleLoadedMetadata = () => {
        const totalDuration = audio.duration;
        setDuration(totalDuration);

        // Distribute timings by word count for slide transitions only
        const totalWords = segments.reduce((sum, seg) => sum + (seg.segment_text?.split(' ').length || 0), 0);
        let currentTime = 0;
        let newSegmentTimings: { start: number; end: number }[] = [];
        
        if (totalWords > 0 && totalDuration > 0) {
          newSegmentTimings = segments.map(segment => {
            const segmentWords = segment.segment_text?.split(' ').length || 0;
            const proportion = segmentWords / totalWords;
            const segmentDuration = totalDuration * proportion;
            const start = currentTime;
            const end = currentTime + segmentDuration;
            currentTime = end;
            return { start, end };
          });
        } else {
          // fallback: equal split
          const segmentDuration = totalDuration / segments.length;
          newSegmentTimings = segments.map((_, i) => ({
            start: i * segmentDuration,
            end: (i + 1) * segmentDuration
          }));
        }

        setSegmentTimings(newSegmentTimings);

        console.log('🎵 Slideshow: Segment timings calculated for slide transitions', {
          totalDuration,
          segmentTimings: newSegmentTimings,
          segments: segments.length
        });
      };

      const handleTimeUpdate = () => {
        if (audio && isPlaying && autoAdvance) {
          const currentAudioTime = audio.currentTime;
          setCurrentTime(currentAudioTime);

          // Find which segment should be shown based on current audio time
          const newSlideIndex = segmentTimings.findIndex(
            timing => currentAudioTime >= timing.start && currentAudioTime < timing.end
          );

          if (newSlideIndex !== -1 && newSlideIndex !== currentSlide) {
            console.log('🎵 Slideshow: Auto-advancing to slide', newSlideIndex, 'at time', currentAudioTime);
            setCurrentSlide(newSlideIndex);
          }

          // Check if we've reached the end
          if (currentAudioTime >= audio.duration && currentSlide === segments.length - 1) {
            console.log('🎵 Slideshow: Reached end, stopping');
            setIsPlaying(false);
            audio.pause();
            audio.currentTime = 0;
          }
        }
      };

      const handleEnded = () => {
        console.log('🎵 Slideshow: Audio ended, stopping');
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [fullStoryAudioUrl, segments, isPlaying, autoAdvance, currentSlide, setCurrentSlide, setIsPlaying]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        if (audioRef.current.paused) {
          audioRef.current.play().catch(err => {
            console.error('🎵 Slideshow: Failed to play audio:', err);
          });
        }
      } else {
        if (!audioRef.current.paused) {
          audioRef.current.pause();
        }
      }
    }
  }, [isPlaying]);

  // Manual slide navigation (for when user clicks prev/next)
  const goToSlide = (slideIndex: number) => {
    if (audioRef.current && segmentTimings[slideIndex]) {
      const timing = segmentTimings[slideIndex];
      audioRef.current.currentTime = timing.start;
      setCurrentSlide(slideIndex);
      setCurrentTime(timing.start);
    }
  };

  // Simplified progress function - just returns 0 since we're not doing word highlighting
  const getCurrentSegmentProgress = () => {
    return 0; // No highlighting for now
  };

  return {
    currentTime,
    duration,
    goToSlide,
    getCurrentSegmentProgress,
    segmentTimings
  };
};
