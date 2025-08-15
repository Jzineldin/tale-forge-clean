
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const GenreHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-12 relative">
      {/* Navigation container - adjusted positioning to work with Layout padding */}
      <div className="absolute top-2 left-0 right-0 flex justify-between items-center px-4 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-white hover:text-amber-400 flex items-center gap-2 bg-black/30 backdrop-blur-sm border border-white/20"
        >
          <Home className="h-4 w-4" />
          Home
        </Button>
        <div className="flex-1" /> {/* Spacer */}
      </div>
      
      {/* Title content - reduced padding since Layout already provides spacing */}
      <div className="pt-8 md:pt-12">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif magical-text">
          Choose Your <span className="text-amber-400">Adventure</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Select the perfect genre for your personalized story adventure
        </p>
      </div>
    </div>
  );
};

export default GenreHeader;
