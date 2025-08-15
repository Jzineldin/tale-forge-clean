
import React from 'react';

const StoryModeHeader: React.FC = () => {
  return (
    <div className="text-center space-y-4">
      <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-2xl">
        Choose Your Adventure
      </h2>
      <p className="text-xl text-gray-100 font-light max-w-2xl mx-auto drop-shadow-lg">
        What kind of story calls to your soul today?
      </p>
    </div>
  );
};

export default StoryModeHeader;
