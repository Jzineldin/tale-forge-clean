
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StorySegmentRow } from '@/types/stories';

interface SlideshowNavigationProps {
  segments: StorySegmentRow[];
  currentSlide: number;
  onClose: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onGoToSlide: (index: number) => void;
}

const SlideshowNavigation: React.FC<SlideshowNavigationProps> = ({
  segments,
  currentSlide,
  onClose,
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
}) => {
  const handleClose = () => {
    console.log('🎬 Slideshow back button clicked - closing slideshow');
    onClose();
  };

  return (
    <div className="flex items-center justify-between p-3 md:p-6 bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/95 border-t border-amber-400/40 backdrop-blur-lg shadow-2xl relative">
      {/* Magical effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-purple-500/5" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
      
      <div className="flex items-center gap-2 md:gap-3 relative z-10">
        <Button
          variant="ghost"
          onClick={handleClose}
          className="text-white hover:bg-amber-500/20 flex items-center gap-1 md:gap-2 border border-amber-400/40 mobile-friendly-button ring-1 ring-amber-300/20 backdrop-blur-sm transition-all duration-200 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-400/20"
        >
          <X className="h-3 w-3 md:h-4 md:w-4" />
          <span className="text-xs md:text-sm font-medium">Back</span>
        </Button>
        <Button
          variant="ghost"
          onClick={onPrevSlide}
          className="text-white hover:bg-amber-500/20 flex items-center gap-1 md:gap-2 border border-amber-400/40 mobile-friendly-button ring-1 ring-amber-300/20 backdrop-blur-sm transition-all duration-200 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-400/20"
          disabled={segments.length <= 1}
        >
          <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden sm:inline text-xs md:text-sm font-medium">Previous</span>
        </Button>
      </div>

      {/* Enhanced Slide indicators */}
      <div className="flex gap-1 max-w-xs sm:max-w-md overflow-x-auto bg-gradient-to-r from-slate-700/60 to-slate-600/60 px-3 md:px-4 py-2 md:py-3 rounded-full border border-amber-400/30 ring-1 ring-amber-300/20 backdrop-blur-sm shadow-lg relative z-10">
        {segments.slice(0, 10).map((_, index) => (
          <button
            key={index}
            onClick={() => onGoToSlide(index)}
            className={cn(
              "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 flex-shrink-0 ring-1",
              index === currentSlide 
                ? "bg-gradient-to-r from-amber-400 to-orange-400 scale-125 shadow-lg shadow-amber-400/60 ring-amber-300/40" 
                : "bg-gradient-to-r from-amber-200/30 to-orange-200/30 hover:from-amber-200/50 hover:to-orange-200/50 ring-amber-200/20 hover:ring-amber-200/30"
            )}
          />
        ))}
        {segments.length > 10 && (
          <span className="text-amber-200/70 text-xs ml-1 md:ml-2 font-medium">+{segments.length - 10}</span>
        )}
      </div>

      <Button
        variant="ghost"
        onClick={onNextSlide}
        className="text-white hover:bg-amber-500/20 flex items-center gap-1 md:gap-2 border border-amber-400/40 mobile-friendly-button ring-1 ring-amber-300/20 backdrop-blur-sm transition-all duration-200 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-400/20"
        disabled={segments.length <= 1}
      >
        <span className="hidden sm:inline text-xs md:text-sm font-medium">Next</span>
        <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
      </Button>
    </div>
  );
};

export default SlideshowNavigation;
