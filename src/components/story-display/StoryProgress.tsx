
import React from 'react';

interface StoryProgressProps {
  segmentCount: number;
  maxSegments: number;
}

const StoryProgress: React.FC<StoryProgressProps> = ({
  segmentCount,
  maxSegments
}) => {
  const progressPercentage = (segmentCount / maxSegments) * 100;

  return (
    <div className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-amber-500/40 backdrop-blur-lg shadow-xl rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="fantasy-heading text-amber-300 text-sm font-medium">Story Progress</span>
        <span className="fantasy-heading text-amber-400 text-sm font-bold">{segmentCount}/{maxSegments}</span>
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full transition-all duration-1000 ease-out shadow-lg"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default StoryProgress;
