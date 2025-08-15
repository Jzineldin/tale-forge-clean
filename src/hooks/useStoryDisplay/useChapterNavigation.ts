
import { useState, useEffect } from 'react';
import { StorySegment } from './types';

export const useChapterNavigation = (segments: StorySegment[]) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  // Auto-navigate to the latest chapter when new segments are added
  useEffect(() => {
    if (segments.length > 0) {
      const latestIndex = segments.length - 1;
      setCurrentChapterIndex(latestIndex);
    }
  }, [segments.length]);

  const handleChapterChange = (index: number) => {
    const validIndex = Math.max(0, Math.min(index, segments.length - 1));
    setCurrentChapterIndex(validIndex);
  };

  const goToLatestChapter = () => {
    if (segments.length > 0) {
      setCurrentChapterIndex(segments.length - 1);
    }
  };

  const currentSegment = segments[currentChapterIndex] || null;

  return {
    currentChapterIndex,
    currentSegment,
    handleChapterChange,
    goToLatestChapter
  };
};
