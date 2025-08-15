
import React, { useState } from 'react';
import GenreCard from './GenreCard';
import { genres, getStorytimeGenres, getLearningGenres } from '@/data/genres';
import { Button } from '@/components/ui/button';
import { Moon, GraduationCap } from 'lucide-react';

interface GenreGridProps {
  selectedGenre: string;
  onGenreSelect: (genreId: string) => void;
}

const GenreGrid: React.FC<GenreGridProps> = ({ selectedGenre, onGenreSelect }) => {
  const [mode, setMode] = useState<'storytime' | 'learning' | 'all'>('all');

  const getFilteredGenres = () => {
    switch (mode) {
      case 'storytime':
        return getStorytimeGenres();
      case 'learning':
        return getLearningGenres();
      default:
        return genres;
    }
  };

  const filteredGenres = getFilteredGenres();

  return (
    <div className="space-y-8">
      {/* Mode Selection Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-2 flex gap-2">
          <Button
            variant={mode === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('all')}
            className={`text-sm font-medium px-4 py-2 rounded-md transition-all ${
              mode === 'all' 
                ? 'bg-amber-500 text-white hover:bg-amber-600' 
                : 'text-gray-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            All Stories
          </Button>
          <Button
            variant={mode === 'storytime' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('storytime')}
            className={`text-sm font-medium px-4 py-2 rounded-md transition-all ${
              mode === 'storytime' 
                ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                : 'text-gray-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Moon className="w-4 h-4 mr-2" />
            Storytime Mode
          </Button>
          <Button
            variant={mode === 'learning' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('learning')}
            className={`text-sm font-medium px-4 py-2 rounded-md transition-all ${
              mode === 'learning' 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'text-gray-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Learning Mode
          </Button>
        </div>
      </div>

      {/* Mode Description */}
      {mode !== 'all' && (
        <div className="text-center mb-6">
          <p className="text-gray-300 text-sm max-w-2xl mx-auto">
            {mode === 'storytime' 
              ? "Perfect for bedtime reading and imaginative play with parents and kids! 🌙✨"
              : "Ideal for classroom learning and educational activities with teachers and students! 📚🎓"
            }
          </p>
        </div>
      )}

      {/* Genre Grid - Responsive grid with wider cards to prevent text cutoff */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto justify-items-center">
        {filteredGenres.map((genre) => (
          <GenreCard
            key={genre.id}
            genre={genre}
            isSelected={selectedGenre === genre.id}
            onSelect={onGenreSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default GenreGrid;
