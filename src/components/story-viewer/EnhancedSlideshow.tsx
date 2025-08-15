import React, { useState, useRef, useEffect } from 'react';
import { StorySegmentRow } from '@/types/stories';
import { useSlideshow } from '@/context/SlideshowContext';
import { actionBtn } from '@/lib/theme';

interface EnhancedSlideshowProps {
  segments: StorySegmentRow[];
  fullStoryAudioUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedSlideshow: React.FC<EnhancedSlideshowProps> = ({ 
  segments, 
  fullStoryAudioUrl, 
  isOpen, 
  onClose 
}) => {
  const { openSlideshow, closeSlideshow } = useSlideshow();
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Update slideshow context when isOpen changes
  useEffect(() => {
    if (isOpen) {
      openSlideshow();
    } else {
      closeSlideshow();
    }
  }, [isOpen, openSlideshow, closeSlideshow]);


  // Update highlighting and chapter based on audio time
  useEffect(() => {
    if (!audioRef.current || !isPlaying) return;

    const updateSync = () => {
      const currentTime = audioRef.current?.currentTime || 0;
      const totalDuration = audioRef.current?.duration || 1;
      
      // Calculate which chapter should be active
      const chapterDuration = totalDuration / segments.length;
      const newChapter = Math.floor(currentTime / chapterDuration);
      
      if (newChapter !== currentChapter && newChapter < segments.length) {
        setCurrentChapter(newChapter);
      }
      
    };

    const interval = setInterval(updateSync, 200);
    return () => clearInterval(interval);
  }, [isPlaying, currentChapter, segments]);


  const handleChapterJump = (chapterIndex: number) => {
    if (chapterIndex >= 0 && chapterIndex < segments.length) {
      setCurrentChapter(chapterIndex);
      if (audioRef.current && duration > 0) {
        const chapterStartTime = (chapterIndex * duration) / segments.length;
        audioRef.current.currentTime = chapterStartTime;
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    switch(e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handleChapterJump(currentChapter - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleChapterJump(currentChapter + 1);
        break;
      case ' ':
        e.preventDefault();
        handlePlayPause();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentChapter, isPlaying]);

  // Prevent body scroll and hide header when slideshow is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('slideshow-open');
      document.body.classList.add('slideshow-active');
    } else {
      document.body.classList.remove('slideshow-open');
      document.body.classList.remove('slideshow-active');
    }
    
    return () => {
      document.body.classList.remove('slideshow-open');
      document.body.classList.remove('slideshow-active');
    };
  }, [isOpen]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };


  if (!isOpen) return null;

  const currentSegment = segments[currentChapter];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex flex-col slideshow-container">
      
      {/* Enhanced Header with Controls */}
      <div className="flex justify-between items-center p-4 text-white bg-black bg-opacity-50">
        <div className="flex items-center space-x-4">
          {/* Removed old exit button - now using fixed positioned one */}
        </div>
        
        <div className="text-sm opacity-75">
          Chapter {currentChapter + 1} of {segments.length}
        </div>
        
        <div className="text-xs opacity-60">
          ESC to exit • ← → to navigate • Space to play/pause
        </div>
      </div>

      {/* Fixed Position Exit Button - More Visible */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 md:top-6 md:right-6 z-10 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-all duration-200 p-2 rounded-full border border-white/10 hover:border-white/20"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Enhanced Audio Controls */}
      {fullStoryAudioUrl && (
        <div className="px-6 py-3 bg-black bg-opacity-50">
          <audio
            ref={audioRef}
            src={fullStoryAudioUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            
            onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
            className="w-full h-10"
            controls
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl w-full mx-auto">
          
          {/* Chapter Image - Much Larger */}
          <div className="mb-6">
            {currentSegment?.image_url && currentSegment.image_url !== '/placeholder.svg' ? (
              <img 
                src={currentSegment.image_url} 
                alt={`Chapter ${currentChapter + 1}`}
                className="w-full max-h-[60vh] object-contain rounded-lg mx-auto shadow-2xl border border-amber-500/30"
              />
            ) : (
              <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center border border-amber-500/30">
                <span className="text-gray-400 text-lg">📖 No image for this chapter</span>
              </div>
            )}
          </div>

          {/* Chapter Text */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-lg p-6 border border-slate-300/20 dark:border-slate-700/20">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
              Chapter {currentChapter + 1}
            </h3>
            <div 
              className="text-base leading-relaxed text-slate-700 dark:text-slate-300 overflow-y-auto slideshow-scrollbar-styles"
              style={{ 
                height: '300px',
                maxHeight: '300px',
                overflowY: 'scroll',
                paddingRight: '8px'
              }}
            >
              {currentSegment?.segment_text || 'No text available for this chapter.'}
            </div>
          </div>

        </div>
      </div>

      {/* Enhanced Navigation Controls */}
      <div className="p-6 bg-black bg-opacity-50">
        <div className="flex justify-between items-center text-white max-w-7xl mx-auto">
          
          {/* Previous Button */}
          <button 
            onClick={() => handleChapterJump(currentChapter - 1)}
            disabled={currentChapter === 0}
            className={`fantasy-heading min-w-11 min-h-11 ${actionBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span>←</span>
            <span>Previous</span>
          </button>
          
          {/* Chapter Dots */}
          <div className="flex space-x-2">
            {segments.map((_, index) => (
              <button
                key={index}
                onClick={() => handleChapterJump(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentChapter 
                    ? 'bg-indigo-500 scale-125' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                title={`Go to Chapter ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Next Button */}
          <button 
            onClick={() => handleChapterJump(currentChapter + 1)}
            disabled={currentChapter === segments.length - 1}
            className={`fantasy-heading min-w-11 min-h-11 ${actionBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span>Next</span>
            <span>→</span>
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 max-w-7xl mx-auto">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((currentChapter + 1) / segments.length) * 100}%` 
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Chapter {currentChapter + 1}</span>
            <span>{segments.length} Total Chapters</span>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default EnhancedSlideshow; 