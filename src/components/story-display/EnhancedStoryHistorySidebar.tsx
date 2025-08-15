
import React, { useEffect, useRef } from 'react';
import { StorySegment } from '@/hooks/useStoryDisplay/types';

interface EnhancedStoryHistorySidebarProps {
  storySegments: StorySegment[];
  currentSegmentId?: string;
  storyTitle: string;
  onSegmentClick: (segmentIndex: number) => void;
  currentChapterIndex?: number;
}

const EnhancedStoryHistorySidebar: React.FC<EnhancedStoryHistorySidebarProps> = ({
  storySegments,
  onSegmentClick,
  currentChapterIndex = 0
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const currentChapterRef = useRef<HTMLDivElement>(null);
  
  const totalWords = storySegments.reduce((sum, segment) => sum + (segment.word_count || 0), 0);

  // Auto-scroll to current chapter when it changes
  useEffect(() => {
    if (currentChapterRef.current && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const chapterElement = currentChapterRef.current;
        const containerRect = scrollContainer.getBoundingClientRect();
        const chapterRect = chapterElement.getBoundingClientRect();
        
        // Calculate if the chapter is outside the visible area
        const isAbove = chapterRect.top < containerRect.top;
        const isBelow = chapterRect.bottom > containerRect.bottom;
        
        if (isAbove || isBelow) {
          chapterElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    }
  }, [currentChapterIndex, storySegments.length]);

  const handleChapterClick = (index: number) => {
    console.log('Sidebar chapter clicked:', index, 'calling onSegmentClick');
    onSegmentClick(index);
  };

  return (
    <div className="w-full lg:w-80">
      <div className="bg-slate-800/50 border border-yellow-500/20 rounded-xl p-6 shadow-lg backdrop-blur-sm lg:sticky lg:top-24">
        
        {/* New Unified Title */}
        <h2 className="font-['Cinzel'] text-2xl text-yellow-400 mb-4">Story Log</h2>

        {/* STATS SECTION (No longer in a separate box) */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6 border-b border-yellow-500/10 pb-6">
          <div className="text-left">
            <span className="text-2xl font-semibold text-white">{storySegments.length}</span>
            <p className="text-sm text-slate-400">Chapters</p>
          </div>
          <div className="text-left">
            <span className="text-2xl font-semibold text-white">{totalWords}</span>
            <p className="text-sm text-slate-400">Words</p>
          </div>
        </div>

        {/* HISTORY LIST */}
        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
          {storySegments.slice().reverse().map((segment, index) => {
            const originalIndex = storySegments.length - 1 - index;
            const isCurrentChapter = originalIndex === currentChapterIndex;
            return (
              <div
                key={segment.id}
                ref={isCurrentChapter ? currentChapterRef : null}
                onClick={() => handleChapterClick(originalIndex)}
                className="p-3 bg-slate-900/60 rounded-lg border-l-4 border-yellow-500/50 cursor-pointer hover:bg-slate-900/80 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-sans font-semibold text-white">Chapter {originalIndex + 1}</h3>
                  {isCurrentChapter && (
                    <span className="font-cinzel text-xs font-bold text-yellow-400 tracking-wider">CURRENT</span>
                  )}
                </div>
                <p className="text-sm text-slate-300 line-clamp-2">
                  {segment.segment_text.length > 100
                    ? `${segment.segment_text.substring(0, 100)}...`
                    : segment.segment_text}
                </p>
                <div className="text-xs text-slate-400 mt-2">
                  {segment.word_count || segment.segment_text.split(/\s+/).length} words
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnhancedStoryHistorySidebar;
