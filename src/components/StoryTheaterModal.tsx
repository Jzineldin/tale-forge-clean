import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Pause, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

// Custom styles for the scrollbar
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(51, 65, 85, 0.3);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #f59e0b, #ea580c);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #d97706, #dc2626);
  }
`;

import { StorySegmentRow } from '@/types/stories';

// Define a type for your story and segment for type safety
type Story = {
  segments: StorySegmentRow[];
};

interface StoryTheaterModalProps {
  story: Story & {
    full_story_audio_url?: string | null;
    audio_generation_status?: string;
  };
  onClose: () => void;
}

const StoryTheaterModal: React.FC<StoryTheaterModalProps> = ({ story, onClose }) => {
  // --- STATE AND LOGIC ---
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // New state to ensure we only render the portal on the client-side
  const [isClient, setIsClient] = useState(false);

  const currentSegment = story.segments[currentChapter];

  useEffect(() => {
    setIsClient(true);
  }, []); // Only run once on mount

  // Effect to handle audio playback - Use full story audio instead of segment audio
  useEffect(() => {
    if (story.full_story_audio_url && story.audio_generation_status === 'completed') {
      const newAudio = new Audio(story.full_story_audio_url);
      audioRef.current = newAudio;
      if (isPlaying) {
        newAudio.play();
      }
      
      newAudio.onended = () => {
        setIsPlaying(false);
      };

      // Update progress
      const updateProgress = () => {
        if (newAudio.duration) {
          setProgress((newAudio.currentTime / newAudio.duration) * 100);
        }
      };

      newAudio.addEventListener('timeupdate', updateProgress);

      return () => {
        newAudio.pause();
        newAudio.removeEventListener('timeupdate', updateProgress);
      };
    }
    
    return () => {};
  }, [story.full_story_audio_url, story.audio_generation_status, isPlaying]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const goToNext = () => {
    if (currentChapter < story.segments.length - 1) {
      setCurrentChapter(c => c + 1);
      setIsPlaying(false); // Stop current audio
    }
  };

  const goToPrev = () => {
    if (currentChapter > 0) {
      setCurrentChapter(c => c - 1);
      setIsPlaying(false); // Stop current audio
    }
  };

  // --- JSX TO BE RENDERED ---
  const modalContent = (
    <>
      {/* Inject custom styles */}
      <style>{customScrollbarStyles}</style>

      {/* This is the container for the modal itself. */}
      {/* It is fixed and has a high z-index to appear over everything. */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-theater-title"
        aria-describedby="story-theater-description"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/85 backdrop-blur-lg" onClick={onClose} />

      {/* Modal Card (This is the visible part of your component) */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/20 flex flex-col overflow-hidden backdrop-blur-sm">
        
        {/* Header - Enhanced with better styling */}
        <div className="bg-gradient-to-r from-amber-900/20 via-orange-900/20 to-amber-900/20 backdrop-blur-sm p-4 md:p-6 border-b border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl animate-pulse">🎭</div>
              <div>
                <h2 id="story-theater-title" className="font-cinzel font-bold text-2xl md:text-3xl text-amber-200">
                  Story Theater
                </h2>
                <p className="text-amber-400/80 text-sm">Immersive storytelling experience</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-2 transition-all duration-200 hover:scale-110"
              aria-label="Close story theater modal"
            >
              <X size={20} />
            </button>
          </div>
          <div id="story-theater-description" className="sr-only">
            Interactive story theater mode with chapter navigation and audio playback controls
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Left: Image */}
          <div className="flex-1 relative min-h-0">
            {currentSegment && currentSegment.image_url && currentSegment.image_url !== '/placeholder.svg' ? (
              <img
                src={currentSegment.image_url}
                alt={`Chapter ${currentChapter + 1} illustration`}
                className="w-full h-full object-cover rounded-l-lg"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-800 via-purple-900/30 to-amber-900/20 flex items-center justify-center rounded-l-lg">
                <div className="text-center text-slate-300">
                  <BookOpen className="h-24 w-24 mx-auto mb-6 opacity-60 text-amber-400" />
                  <p className="text-xl font-semibold text-amber-200 mb-2">Chapter {currentChapter + 1}</p>
                  <p className="text-sm text-slate-400">Continue reading the story</p>
                </div>
              </div>
            )}

            {/* Chapter Overlay - Enhanced */}
            <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-600/90 to-orange-600/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
              <span className="font-bold text-white text-lg">
                Chapter {currentChapter + 1}
              </span>
            </div>
          </div>

          {/* Right: Text and Controls */}
          <div className="w-96 md:w-[500px] bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-sm border-l border-amber-500/30 flex flex-col">
            {/* Text Area - Enhanced readability */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
              <div className="mb-6">
                <h3 className="font-cinzel font-bold text-2xl text-amber-300 mb-6 text-center">
                  Chapter {currentChapter + 1}
                </h3>
                <div className="prose prose-invert max-w-none">
                  <p className="font-sans text-slate-100 leading-relaxed text-lg md:text-xl tracking-wide">
                    {currentSegment?.segment_text || 'No content available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Audio Controls - Enhanced design */}
            {story.full_story_audio_url && story.audio_generation_status === 'completed' && (
              <div className="p-6 md:p-8 border-t border-amber-500/30 bg-gradient-to-r from-amber-900/20 to-orange-900/20">
                <div className="flex items-center gap-6 mb-4">
                  <button
                    onClick={handlePlayPause}
                    className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95"
                    aria-label={isPlaying ? 'Pause story audio' : 'Play story audio'}
                  >
                    {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
                  </button>
                  <div className="flex-1">
                    <div className="font-sans font-semibold text-sm text-amber-200 mb-3">🎵 Story Audio</div>
                    <div className="w-full bg-slate-700/50 rounded-full h-4 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-orange-400 h-4 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${progress}%` }}
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Audio playback progress"
                      />
                    </div>
                    <div className="text-xs text-slate-400 mt-2 text-center">
                      {Math.round(progress)}% complete
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Status - Show when audio is not available */}
            {(!story.full_story_audio_url || story.audio_generation_status !== 'completed') && (
              <div className="p-6 md:p-8 border-t border-slate-700/50">
                <div className="text-center">
                  <div className="font-sans text-sm text-slate-400 mb-2">
                    {story.audio_generation_status === 'in_progress' ? '🎵 Generating audio...' : 
                     story.audio_generation_status === 'failed' ? '❌ Audio generation failed' : 
                     '🔇 No audio available'}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation - Enhanced design */}
            <div className="p-6 md:p-8 border-t border-amber-500/30 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
              <div className="flex items-center justify-between">
                <button
                  onClick={goToPrev}
                  disabled={currentChapter === 0}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-slate-700 disabled:to-slate-600 disabled:text-slate-400 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:opacity-50"
                  aria-label="Go to previous chapter"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Previous
                </button>
                <div className="text-center">
                  <span className="font-sans font-bold text-amber-200 text-xl" aria-live="polite">
                    {currentChapter + 1} / {story.segments.length}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">chapters</p>
                </div>
                <button
                  onClick={goToNext}
                  disabled={currentChapter === story.segments.length - 1}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-slate-700 disabled:to-slate-600 disabled:text-slate-400 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:opacity-50"
                  aria-label="Go to next chapter"
                >
                  Next
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );

  // --- PORTAL LOGIC ---
  // If we are on the client, render the modal content inside a portal attached to the document body.
  if (isClient) {
    return createPortal(modalContent, document.body);
  }

  // If not on the client (e.g., during SSR), render nothing.
  return null;
};

export default StoryTheaterModal;