import { useState, useEffect } from 'react';
import { heroGrad } from '@/lib/theme';
import { X, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

interface Segment {
  id: string;
  title?: string;
  text: string;
  image?: string;
}

interface FullscreenPlayerProps {
  segments: Segment[];
  onClose: () => void;
}

export default function FullscreenPlayer({
  segments,
  onClose,
}: FullscreenPlayerProps) {
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(segments.length > 1);
  const segment = segments[index];

  useEffect(() => {
    if (!autoPlay) return;
    const t = setTimeout(() => setIndex(i => (i + 1) % segments.length), 5000);
    return () => clearTimeout(t);
  }, [index, autoPlay, segments.length]);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Main card */}
      <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl">
        <div className={heroGrad + ' absolute inset-0'} />

        {/* Close btn in corner */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 text-white/80 hover:text-white"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Scene content */}
        <div className="relative bg-black/40 backdrop-blur-md rounded-2xl mx-2 sm:mx-0 p-4">
          {segment.image && (
            <img src={segment.image} alt="" className="w-full aspect-video object-cover rounded-xl" />
          )}
          <div className="mt-4 px-4 text-white">
            <p className="text-sm opacity-70">Chapter {index + 1}</p>
            <h2 className="text-xl font-semibold mt-1 leading-tight">{segment.title || `Chapter ${index + 1}`}</h2>
            <p className="text-base mt-2 text-slate-200 leading-relaxed max-h-40 overflow-auto">
              {segment.text}
            </p>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="flex justify-between items-center mt-4 text-white px-4">
          <button 
            onClick={() => setAutoPlay(!autoPlay)} 
            className="flex items-center space-x-2 hover:text-indigo-300"
          >
            {autoPlay ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            <span className="text-sm">{autoPlay ? 'Pause' : 'Play'}</span>
          </button>

          <div className="flex space-x-2">
            <button 
              onClick={() => setIndex(i => Math.max(0, i - 1))}
              disabled={index === 0}
              className="px-3 py-1 rounded bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIndex(i => Math.min(segments.length - 1, i + 1))}
              disabled={index === segments.length - 1}
              className="px-3 py-1 rounded bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 