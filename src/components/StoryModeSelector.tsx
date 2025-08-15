
import React from 'react';
import { storyModes } from '@/data/storyModes';
import StoryModeHeader from './story-mode/StoryModeHeader';
import StoryModeCard from './story-mode/StoryModeCard';

interface StoryModeSelectorProps {
  selectedMode: string;
  onSelectMode: (mode: string) => void;
  disabled: boolean;
}

const StoryModeSelector: React.FC<StoryModeSelectorProps> = ({ 
  selectedMode, 
  onSelectMode, 
  disabled 
}) => {
  return (
    <div className="w-full space-y-8">
      <StoryModeHeader />
      
      <div className="story-grid">
        {storyModes.map((mode) => (
          <StoryModeCard
            key={mode.name}
            mode={mode}
            isSelected={selectedMode === mode.name}
            onSelect={() => onSelectMode(mode.name)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

export default StoryModeSelector;
