import React from 'react';

interface StoryCardContainerProps {
  children: React.ReactNode;
  story?: any;
  variant?: string;
  className?: string;
}

export const StoryCardContainer: React.FC<StoryCardContainerProps> = ({ children, className = "" }) => {
  return (
    <div className={`story-card-container ${className}`}>
      {children}
    </div>
  );
};

export default StoryCardContainer;