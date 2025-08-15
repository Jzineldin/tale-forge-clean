
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { StorySegment } from '@/hooks/useStoryDisplay/types';

interface StoryChapterNavigationProps {
  segments: StorySegment[];
  currentChapterIndex: number;
  onChapterChange: (index: number) => void;
  isGenerating: boolean;
}

const StoryChapterNavigation: React.FC<StoryChapterNavigationProps> = ({
  segments,
  currentChapterIndex,
  onChapterChange,
  isGenerating
}) => {
  if (segments.length <= 1 && !isGenerating) return null;

  return (
    <div className="flex items-center justify-between bg-slate-800/60 border border-amber-500/30 rounded-lg p-3 mb-4">
      <Button
        onClick={() => onChapterChange(Math.max(0, currentChapterIndex - 1))}
        disabled={currentChapterIndex === 0}
        variant="ghost"
        size="sm"
        className="fantasy-heading text-amber-400 hover:text-amber-300 disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>

      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-amber-400" />
        <span className="fantasy-heading text-amber-300 text-sm font-medium">
          Chapter {currentChapterIndex + 1} of {segments.length + (isGenerating ? 1 : 0)}
        </span>
        {isGenerating && currentChapterIndex === segments.length - 1 && (
          <span className="fantasy-subtitle text-amber-400 text-xs">(Next chapter loading...)</span>
        )}
      </div>

      <Button
        onClick={() => onChapterChange(Math.min(segments.length - 1, currentChapterIndex + 1))}
        disabled={currentChapterIndex >= segments.length - 1}
        variant="ghost"
        size="sm"
        className="fantasy-heading text-amber-400 hover:text-amber-300 disabled:opacity-50"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};

export default StoryChapterNavigation;
