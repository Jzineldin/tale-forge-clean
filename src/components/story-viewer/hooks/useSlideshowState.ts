
import { useState, useEffect } from 'react';
import { StorySegmentRow } from '@/types/stories';

interface UseSlideshowStateProps {
  segments: StorySegmentRow[];
  fullStoryAudioUrl?: string;
  isOpen: boolean;
}

export const useSlideshowState = ({ segments, isOpen }: UseSlideshowStateProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Reset state when slideshow opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setIsPlaying(false);
      setAutoAdvance(true); // Reset auto-advance to true when opening
    }
  }, [isOpen]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % segments.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + segments.length) % segments.length);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  const togglePlayback = () => {
    setIsPlaying(prev => !prev);
  };

  const toggleAutoAdvance = () => {
    setAutoAdvance(prev => !prev);
  };

  return {
    currentSlide,
    isPlaying,
    autoAdvance,
    setCurrentSlide,
    setIsPlaying,
    setAutoAdvance,
    nextSlide,
    prevSlide,
    goToSlide,
    togglePlayback,
    toggleAutoAdvance,
  };
};
