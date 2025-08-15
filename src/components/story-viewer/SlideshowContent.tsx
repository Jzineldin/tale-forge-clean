
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { StorySegmentRow } from '@/types/stories';

interface SlideshowContentProps {
  currentSegment: StorySegmentRow;
  currentSlide: number;
}

const SlideshowContent: React.FC<SlideshowContentProps> = ({
  currentSegment,
  currentSlide,
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-8">
      <div className="max-w-5xl w-full">
        <Card className="bg-gradient-to-br from-slate-800/95 via-slate-700/90 to-slate-800/95 border-amber-400/40 shadow-2xl backdrop-blur-md border-2 ring-1 ring-amber-300/20">
          <CardContent className="card-content p-4 sm:p-6 md:p-10 relative overflow-hidden">
            {/* Magical overlay effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-radial from-amber-400/10 to-transparent rounded-full blur-xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-radial from-purple-400/8 to-transparent rounded-full blur-xl" />
            
            {/* Content */}
            <div className="relative z-10">
            {/* Image - Mobile responsive with enhanced styling */}
            {currentSegment.image_url ? (
              <div className="mb-6 md:mb-8 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-purple-400/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
                <img
                  src={currentSegment.image_url}
                  alt={`Story chapter ${currentSlide + 1}`}
                  className="relative w-full max-h-60 sm:max-h-80 md:max-h-96 object-contain rounded-xl shadow-2xl border border-amber-400/30 ring-1 ring-amber-300/20 backdrop-blur-sm"
                  onError={(e) => {
                    console.warn('Image failed to load:', currentSegment.image_url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              // Enhanced placeholder for missing images
              <div className="mb-6 md:mb-8 relative">
                <div className="bg-gradient-to-br from-slate-700/80 via-slate-600/70 to-slate-700/80 rounded-xl flex items-center justify-center h-48 sm:h-64 md:h-80 border border-amber-400/30 ring-1 ring-amber-300/20 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10" />
                  <div className="text-center text-amber-200 relative z-10">
                    <Eye className="h-10 w-10 md:h-14 md:w-14 mx-auto mb-3 opacity-70 text-amber-400 drop-shadow-lg" />
                    <p className="text-lg font-semibold tracking-wide">Chapter {currentSlide + 1}</p>
                    <p className="text-sm opacity-70 font-medium">✨ Visual essence manifesting...</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Enhanced Text - Mobile optimized */}
            <div className="text-slate-100 space-y-4 md:space-y-6">
              <p className="text-base sm:text-lg md:text-xl leading-relaxed font-medium story-creation-text text-slate-100 drop-shadow-sm tracking-wide">
                {currentSegment.segment_text}
              </p>
              
              {/* Choice indicator with improved styling */}
              {currentSegment.triggering_choice_text && (
                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-amber-400/40 relative">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                  <p className="text-sm md:text-base text-amber-300 italic font-medium tracking-wide">
                    → Choice made: <span className="text-amber-200 font-semibold">{currentSegment.triggering_choice_text}</span>
                  </p>
                </div>
              )}
            </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SlideshowContent;
