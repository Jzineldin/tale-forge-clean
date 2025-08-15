
import React from 'react';

interface StoryDisplayLayoutProps {
  children: React.ReactNode;
}

const StoryDisplayLayout: React.FC<StoryDisplayLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full relative">
      {/* Same beautiful background as landing page */}
      <div className="scene-bg"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
};

export default StoryDisplayLayout;
