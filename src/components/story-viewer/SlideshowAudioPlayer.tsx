
import React from 'react';
import AudioPlayer from '@/components/AudioPlayer';

interface SlideshowAudioPlayerProps {
  fullStoryAudioUrl: string;
}

const SlideshowAudioPlayer: React.FC<SlideshowAudioPlayerProps> = ({
  fullStoryAudioUrl,
}) => {
  return (
    <div className="p-3 md:p-6 bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/95 border-t border-amber-400/40 backdrop-blur-lg shadow-2xl relative">
      {/* Magical effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-purple-500/5" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
      
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="bg-gradient-to-r from-slate-700/60 to-slate-600/60 border border-amber-400/30 ring-1 ring-amber-300/20 rounded-xl p-3 md:p-4 backdrop-blur-sm shadow-lg">
          <AudioPlayer src={fullStoryAudioUrl} />
        </div>
      </div>
    </div>
  );
};

export default SlideshowAudioPlayer;
