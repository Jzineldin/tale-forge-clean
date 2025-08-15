
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface SlideshowHeaderProps {
  currentSlide: number;
  totalSlides: number;
  isPlaying: boolean;
  onTogglePlayback: () => void;
}

const SlideshowHeader: React.FC<SlideshowHeaderProps> = ({
  currentSlide,
  totalSlides,
  isPlaying,
  onTogglePlayback,
}) => {
  return (
    <div className="flex items-center justify-between p-3 md:p-6 bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/95 border-b border-amber-400/40 backdrop-blur-lg shadow-2xl relative">
      {/* Magical effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-purple-500/5" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
      
      <div className="flex items-center gap-3 md:gap-6 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePlayback}
          className="text-white hover:bg-amber-500/20 border border-amber-400/40 mobile-friendly-button ring-1 ring-amber-300/20 backdrop-blur-sm transition-all duration-200 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-400/20"
        >
          {isPlaying ? <Pause className="h-4 w-4 md:h-5 md:w-5" /> : <Play className="h-4 w-4 md:h-5 md:w-5" />}
        </Button>
      </div>
      
      <div className="flex items-center gap-3 md:gap-4 relative z-10">
        <span className="text-amber-200 text-sm md:text-base font-semibold bg-gradient-to-r from-slate-700/60 to-slate-600/60 px-3 md:px-4 py-2 rounded-full border border-amber-400/30 ring-1 ring-amber-300/20 backdrop-blur-sm shadow-lg">
          Chapter {currentSlide + 1} of {totalSlides}
        </span>
        {isPlaying && (
          <span className="text-amber-400 text-xs md:text-sm animate-pulse bg-gradient-to-r from-amber-900/40 to-orange-900/40 px-2 md:px-3 py-1 md:py-2 rounded-full border border-amber-400/50 ring-1 ring-amber-300/30 hidden sm:inline font-medium shadow-lg backdrop-blur-sm">
            ● PLAYING
          </span>
        )}
      </div>
    </div>
  );
};

export default SlideshowHeader;
