import React from 'react';
import { StoryCardProps } from './types';
import StoryCardContainer from './StoryCardContainer';
import StoryCardHeader from './StoryCardHeader';
import StoryCardContent from './StoryCardContent';
import StoryCardFooter from './StoryCardFooter';
import { Link } from 'react-router-dom';

/**
 * StoryCard - The main story card component
 * 
 * This component combines all the story card sub-components into a complete
 * story card. It handles click events, navigation, and passes appropriate
 * props to each sub-component.
 */
const StoryCard: React.FC<StoryCardProps> = ({
  story,
  variant = 'landscape',
  onClick,
  linkTo,
  className = '',
  ...actionProps
}) => {
  // Handle click on the card
  const handleCardClick = (e: React.MouseEvent) => {
    // If the click is on a button or link inside the card, don't trigger the card click
    if ((e.target as HTMLElement).closest('button, a')) {
      return;
    }
    
    // Otherwise, trigger the onClick handler if provided
    if (onClick) {
      onClick(story);
    }
  };

  // Determine if the card should be clickable
  const isClickable = onClick || linkTo;
  
  // Render the card content
  const cardContent = (
    <StoryCardContainer 
      story={story} 
      variant={variant}
      className={`${isClickable ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Header with thumbnail and badges */}
      <StoryCardHeader 
        story={story} 
        showBadges={true}
      />
      
      {/* Content with title, description, and metadata */}
      <StoryCardContent 
        story={story} 
        showDescription={true}
        showMetadata={true}
      />
      
      {/* Footer with actions */}
      <StoryCardFooter 
        story={story}
        showActions={true}
        {...actionProps}
      />
    </StoryCardContainer>
  );

  // If linkTo is provided, wrap the card in a Link component
  if (linkTo) {
    return (
      <Link to={linkTo} className="block">
        {cardContent}
      </Link>
    );
  }

  // Otherwise, return the card with onClick handler if provided
  return (
    <div onClick={handleCardClick}>
      {cardContent}
    </div>
  );
};

export default StoryCard;