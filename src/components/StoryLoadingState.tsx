
import React from 'react';


import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
const StoryLoadingState: React.FC = () => {
  return (
    <div className="text-center">
      <LoadingSpinner size="sm" className="h-6 w-6  mx-auto text-purple-400" />
      <p className="text-purple-200 mt-2">Loading next part...</p>
    </div>
  );
};

export default StoryLoadingState;
