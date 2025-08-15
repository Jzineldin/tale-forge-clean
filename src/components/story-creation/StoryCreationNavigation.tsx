
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface StoryCreationNavigationProps {
  gameState: 'not_started' | 'playing' | 'completed';
  onGoHome: () => void;
  onRestart: () => void;
}

const StoryCreationNavigation: React.FC<StoryCreationNavigationProps> = ({
  gameState,
  onGoHome,
  onRestart
}) => {
  return (
    <div className="sticky top-16 z-40 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoHome}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Home
            </Button>
            <span>/</span>
            <span className="text-purple-400">Story Creation</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Removed debug API calls counter for production */}
            {gameState !== 'not_started' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRestart}
                className="text-slate-300 hover:text-white"
              >
                Start New Story
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCreationNavigation;
