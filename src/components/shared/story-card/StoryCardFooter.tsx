import React from 'react';
import { StoryCardFooterProps } from './types';
import StoryCardActions from './StoryCardActions';
import { cn } from '@/lib/utils';

/**
 * StoryCardFooter - Contains action buttons
 * 
 * This component serves as a wrapper for the StoryCardActions component,
 * providing proper positioning and styling within the story card.
 */
const StoryCardFooter: React.FC<StoryCardFooterProps> = ({
  story,
  showActions = true,
  className = '',
  ...actionProps
}) => {
  return (
    <div className={cn(
      "p-4 pt-0 border-t border-white/20 mt-auto",
      // Keep the original class name for backward compatibility during transition
      "story-card-footer",
      className
    )}>
      {showActions && (
        <StoryCardActions 
          story={story} 
          className="w-full"
          {...actionProps}
        />
      )}
    </div>
  );
};

export default StoryCardFooter;