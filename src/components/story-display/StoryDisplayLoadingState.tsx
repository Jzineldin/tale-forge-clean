
import React from 'react';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

interface StoryDisplayLoadingStateProps {
  onExit: () => void;
}

const StoryDisplayLoadingState: React.FC<StoryDisplayLoadingStateProps> = () => {
  return (
    <LoadingOverlay 
      message="Crafting your magical story..." 
    />
  );
};

export default StoryDisplayLoadingState;
