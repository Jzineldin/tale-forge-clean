
import React from 'react';
import { StorySegmentRow } from '@/types/stories';
import { useSlideshowState } from './hooks/useSlideshowState';
import { useSlideshowAutoAdvance } from './hooks/useSlideshowAutoAdvance';

interface StorySlideshowProps {
  segments: StorySegmentRow[];
  fullStoryAudioUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

const StorySlideshow: React.FC<StorySlideshowProps> = ({ 
  segments, 
  fullStoryAudioUrl, 
  isOpen, 
  onClose 
}) => {
  const {
    currentSlide,
    isPlaying,
    autoAdvance,
    setCurrentSlide,
    setIsPlaying,
    nextSlide,
    prevSlide,
    togglePlayback,
    goToSlide,
  } = useSlideshowState({ segments, fullStoryAudioUrl: fullStoryAudioUrl || '', isOpen });

  const {
    currentTime,
    duration
  } = useSlideshowAutoAdvance({
    isPlaying,
    autoAdvance,
    segments,
    currentSlide,
    setCurrentSlide,
    setIsPlaying,
    fullStoryAudioUrl: fullStoryAudioUrl || '',
  });

  const currentSegment = segments[currentSlide];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Format time without decimals
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Removed word-by-word highlighting system - just show full text
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4">
      {/* Magical Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-purple-500/5 to-blue-500/5"></div>
      
      {/* Main Slideshow Container */}
      <div className="relative bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-amber-400/30">
        {/* Magical Border Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 via-purple-400/10 to-blue-400/10 rounded-2xl sm:rounded-3xl blur-sm"></div>
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-800/90 via-purple-800/20 to-slate-800/90 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-between border-b border-amber-400/20">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 border border-slate-600/50 hover:border-amber-400/50"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <p className="fantasy-subtitle text-amber-300 text-sm sm:text-base">
                Chapter {currentSlide + 1} of {segments.length}
              </p>
            </div>
          </div>
          
          {/* Auto-advance toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl transition-all duration-300 text-sm font-semibold min-w-[80px] min-h-[44px] flex items-center justify-center flex-shrink-0 ${
              autoAdvance 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg' 
                : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/50'
            }`}
          >
            {autoAdvance ? 'Auto' : 'Manual'}
          </button>
        </div>

        {/* Compact Audio Controls */}
        {fullStoryAudioUrl && (
          <div className="relative bg-gradient-to-r from-slate-800/80 to-purple-800/20 backdrop-blur-sm p-3 sm:p-4 border-b border-amber-400/20">
            <div className="flex items-center gap-3 sm:gap-4 justify-center">
              <button
                onClick={togglePlayback}
                className="p-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center transform hover:scale-105"
              >
                {isPlaying ? (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
              
              <div className="flex items-center gap-2 sm:gap-3 text-slate-300 text-xs sm:text-sm">
                <span className="font-mono text-amber-300">{formatTime(currentTime)}</span>
                <div className="w-20 sm:w-32 h-2 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/50">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-100 rounded-full shadow-sm"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="font-mono text-amber-300">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-8 overflow-y-auto max-h-[50vh] sm:max-h-[60vh]">
          {/* Image */}
          {currentSegment?.image_url && (
            <div className="relative mb-6 sm:mb-8 rounded-2xl overflow-hidden shadow-2xl border border-amber-400/20">
              <img
                src={currentSegment.image_url}
                alt={`Scene ${currentSlide + 1}`}
                className="w-full h-48 sm:h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          )}

          {/* Text Content */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-2xl p-4 sm:p-6 border border-amber-400/20 backdrop-blur-sm">
            <div className="relative">
              <p className="fantasy-subtitle text-slate-200 text-sm sm:text-base leading-relaxed break-words overflow-hidden">
                {currentSegment?.segment_text}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="relative bg-gradient-to-r from-slate-800/90 to-purple-800/20 backdrop-blur-sm p-4 sm:p-6 border-t border-amber-400/20">
          <div className="flex items-center justify-between">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="p-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center border border-slate-600/50 hover:border-amber-400/50 transform hover:scale-105"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex gap-2 sm:gap-3">
              {segments.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 min-w-[12px] min-h-[12px] ${
                    index === currentSlide 
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg scale-110' 
                      : 'bg-slate-600 hover:bg-slate-500 hover:scale-110'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              disabled={currentSlide === segments.length - 1}
              className="p-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center border border-slate-600/50 hover:border-amber-400/50 transform hover:scale-105"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorySlideshow;
