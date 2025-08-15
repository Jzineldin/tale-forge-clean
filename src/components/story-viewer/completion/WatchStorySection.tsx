import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface WatchStorySectionProps {
  hasAudio: boolean;
  onWatchStory: () => void;
}

const WatchStorySection: React.FC<WatchStorySectionProps> = ({
  hasAudio,
  onWatchStory
}) => {
  return (
    <div className="relative">
      {/* Magical Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl"></div>
      
      {/* Main Content Card */}
      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-purple-400/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Magical Border Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-indigo-400/20 rounded-2xl blur-sm"></div>
        
        {/* Header */}
        <div className="relative p-6 text-center border-b border-purple-400/20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-400/30">
              <Eye className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <h3 className="fantasy-heading text-2xl text-white mb-2">
            Experience Your Story
          </h3>
          <p className="fantasy-subtitle text-gray-400">
            Watch your complete story as an immersive slideshow with synchronized text highlighting
          </p>
        </div>
        
        {/* Content */}
        <div className="relative p-6 text-center">
          <Button 
            onClick={onWatchStory}
            size="lg"
            className="fantasy-button bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-10 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            style={{ 
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.1)'
            }}
          >
            <Eye className="mr-3 h-6 w-6" />
            🎬 Watch Your Story
          </Button>
          {hasAudio && (
            <p className="fantasy-subtitle text-purple-300 text-sm mt-4">
              ✨ Complete with voice narration
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchStorySection;