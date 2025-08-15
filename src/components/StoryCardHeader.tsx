import React from 'react';

interface StoryCardHeaderProps {
  title?: string;
  story?: any;
  showBadges?: boolean;
}

export const StoryCardHeader: React.FC<StoryCardHeaderProps> = ({ title, story }) => {
  return (
    <div className="story-card-header">
      <h3>{title || story?.title || 'Untitled Story'}</h3>
    </div>
  );
};

export default StoryCardHeader;