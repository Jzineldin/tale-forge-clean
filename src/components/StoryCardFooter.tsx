import React from 'react';

interface StoryCardFooterProps {
  children?: React.ReactNode;
  story?: any;
  showActions?: boolean;
  id?: string;
  title?: string;
  createdAt?: string;
  isCompleted?: boolean;
  thumbnailUrl?: string;
}

export const StoryCardFooter: React.FC<StoryCardFooterProps> = ({ children, story }) => {
  return (
    <div className="story-card-footer">
      {children}
      {story && <span className="text-sm text-gray-500">{story.createdAt}</span>}
    </div>
  );
};

export default StoryCardFooter;