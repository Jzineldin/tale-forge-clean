
import React from 'react';

interface StoryContentProps {
  text: string;
}

const StoryContent: React.FC<StoryContentProps> = ({ text }) => {
  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="prose prose-invert max-w-none w-full">
        <div 
          className="text-gray-200 text-lg sm:text-xl leading-relaxed whitespace-pre-wrap break-words hyphens-auto overflow-wrap-anywhere"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

export default StoryContent;
