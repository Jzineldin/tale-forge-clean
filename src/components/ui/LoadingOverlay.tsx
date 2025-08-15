import React from 'react';

interface LoadingOverlayProps {
  message?: string;
  showBackground?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = "Building your magical world...",
  showBackground = true 
}) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      showBackground ? 'bg-slate-900' : 'bg-black/50 backdrop-blur-sm'
    }`}
    style={showBackground ? {
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    } : {}}
    >
      <div className="flex flex-col items-center justify-center text-center p-8">
        {/* Brand Spinner - matches OneRingLoader style */}
        <div className="mb-6">
          <svg className="w-20 h-20 animate-spin" viewBox="0 0 42 42">
            <circle 
              cx="21" 
              cy="21" 
              r="19" 
              strokeWidth="4" 
              stroke="#f97316" 
              fill="none"
              strokeLinecap="round"
              strokeDasharray="60 40"
              strokeDashoffset="0"
            />
          </svg>
        </div>
        
        {/* Loading Message */}
        <p className="text-white text-lg font-medium mb-2" style={{ textShadow: 'rgba(0, 0, 0, 0.8) 2px 2px 4px' }}>
          {message}
        </p>
        
        {/* Magical Sparkles */}
        <div className="flex space-x-1 mt-4">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}; 