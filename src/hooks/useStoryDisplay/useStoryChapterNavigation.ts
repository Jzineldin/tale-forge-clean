
import { useState, useEffect, useCallback } from 'react';
import { StorySegment } from './types';

export const useStoryChapterNavigation = (segments: StorySegment[]) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  // Auto-navigate to the latest chapter when new segments are added
  useEffect(() => {
    if (segments.length > 0) {
      const latestIndex = segments.length - 1;
      console.log('📖 Auto-navigating to latest chapter:', latestIndex);
      setCurrentChapterIndex(latestIndex);
    }
  }, [segments.length]);

  const handleChapterChange = useCallback((index: number) => {
    const validIndex = Math.max(0, Math.min(index, segments.length - 1));
    console.log('📖 Chapter navigation: changing from', currentChapterIndex, 'to', validIndex);
    console.log('📖 Chapter has audio:', !!segments[validIndex]?.audio_url);
    setCurrentChapterIndex(validIndex);
  }, [segments.length, currentChapterIndex]);

  const goToLatestChapter = useCallback(() => {
    if (segments.length > 0) {
      const latestIndex = segments.length - 1;
      console.log('📖 Going to latest chapter:', latestIndex);
      setCurrentChapterIndex(latestIndex);
    }
  }, [segments.length]);

  const goToPreviousChapter = useCallback(() => {
    const newIndex = Math.max(0, currentChapterIndex - 1);
    console.log('📖 Going to previous chapter:', newIndex);
    setCurrentChapterIndex(newIndex);
  }, [currentChapterIndex]);

  const goToNextChapter = useCallback(() => {
    const newIndex = Math.min(segments.length - 1, currentChapterIndex + 1);
    console.log('📖 Going to next chapter:', newIndex);
    setCurrentChapterIndex(newIndex);
  }, [segments.length, currentChapterIndex]);

  const currentSegment = segments[currentChapterIndex] || null;

  return {
    currentChapterIndex,
    currentSegment,
    handleChapterChange,
    goToLatestChapter,
    goToPreviousChapter,
    goToNextChapter
  };
};
