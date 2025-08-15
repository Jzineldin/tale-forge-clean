import React from 'react';

interface StoryCardContentProps {
  children?: React.ReactNode;
  story?: any;
  showDescription?: boolean;
  showMetadata?: boolean;
}

export const StoryCardContent: React.FC<StoryCardContentProps> = ({ children, story }) => {
  return (
    <div className="story-card-content">
      {children}
      {story && <p>{story.description || 'A wonderful story'}</p>}
    </div>
  );
};

export default StoryCardContent;