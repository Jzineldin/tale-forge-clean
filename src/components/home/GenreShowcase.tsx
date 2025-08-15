
import React from 'react';
import { storyModes } from '@/data/storyModes';
import GenreCard from './GenreCard';

import { useMobile } from '@/hooks/useResize';

interface GenreShowcaseProps {
  selectedMode: string;
  onSelectMode: (mode: string) => void;
  disabled?: boolean;
}

const GenreShowcase: React.FC<GenreShowcaseProps> = ({ 
  selectedMode, 
  onSelectMode, 
  disabled = false 
}) => {
  const mobile = useMobile();
  return (
    <section className="genre-showcase-mobile py-24 px-4 md:py-24" id="genres">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="genre-title-mobile text-4xl md:text-5xl font-serif font-bold text-white">
            Choose Your Adventure
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Select the perfect genre for your personalized story experience
          </p>
        </div>

        {/* Desktop View: Grid of Cards - Hidden on mobile */}
        {!mobile && (
          <div className="genre-grid-desktop grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {storyModes.map((mode) => (
              <GenreCard
                key={mode.name}
                mode={mode}
                isSelected={selectedMode === mode.name}
                onSelect={() => onSelectMode(mode.name)}
                disabled={disabled}
              />
            ))}
          </div>
        )}

        {/* Mobile View: Simple grid without accordion for now */}
        {mobile && (
          <div className="grid grid-cols-2 gap-4">
            {storyModes.map((mode) => (
              <button
                key={mode.name}
                onClick={() => onSelectMode(mode.name)}
                disabled={disabled}
                className={`bg-white/60 dark:bg-slate-800/60 rounded-lg px-3 py-2 text-sm transition-all ${
                  selectedMode === mode.name 
                    ? 'bg-amber-500/80 text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-slate-700/80'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {mode.name}
              </button>
            ))}
          </div>
        )}



        <div className="text-center">
          <div className="genre-selection-indicator inline-flex items-center gap-2 px-6 py-3 bg-amber-400/10 border border-amber-400/30 rounded-full">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-amber-400 font-medium">
              Selected: {selectedMode}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GenreShowcase;
