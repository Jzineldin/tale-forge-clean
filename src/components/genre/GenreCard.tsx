import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

interface Genre {
  id: string;
  title: string;
  description: string;
  mood: string;
  tags: string[];
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
  gradient: string;
  image: string;
  category?: 'storytime' | 'learning' | 'both';
}

interface GenreCardProps {
  genre: Genre;
  isSelected: boolean;
  onSelect: (genreId: string) => void;
}

const GenreCard: React.FC<GenreCardProps> = ({ genre, isSelected, onSelect }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleClick = () => {
    onSelect(genre.id);
  };

  const handleMobileToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card
      className={`
        glass-card relative cursor-pointer
        aspect-[3/4] overflow-hidden group
        w-full max-w-[180px] sm:max-w-[200px] lg:max-w-[240px] xl:max-w-[280px]
        ${isSelected 
          ? 'border-2 border-amber-400 shadow-2xl shadow-amber-400/30 scale-105' 
          : 'border border-slate-600 hover:border-amber-400/60'
        }
        ${isExpanded ? 'expanded' : ''}
      `}
      onClick={handleClick}
      onTouchStart={handleMobileToggle}
    >
      {/* Background Image */}
      {!imageError && (
        <img
          src={genre.image}
          alt={genre.title}
          className={`
            absolute inset-0 w-full h-full object-cover transition-all duration-700
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            group-hover:scale-110
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      
      {/* Loading state */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Fallback gradient background */}
      {imageError && (
        <div className={`absolute inset-0 bg-gradient-to-br ${genre.gradient}`} />
      )}

      {/* Enhanced dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

      {/* Content - Using unified design system */}
      <div className="absolute inset-0 p-4 text-center z-10 flex flex-col justify-center items-center">
        {/* Large Emoji Icon */}
        <div className="text-6xl mb-3 drop-shadow-2xl">
          {genre.emoji}
        </div>
        
        {/* Title */}
        <h3 className="text-heading text-white mb-2">
          {genre.title}
        </h3>
        
        {/* Mood Keyword */}
        <p className="text-small text-accent mb-4">
          {genre.mood}
        </p>

        {/* Expandable Details */}
        <div className={`
          transition-all duration-300 ease-out overflow-hidden
          ${isExpanded ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'}
          group-hover:opacity-100 group-hover:max-h-20
          focus-within:opacity-100 focus-within:max-h-20
        `}>
          <div className="flex flex-wrap justify-center gap-1 mt-2">
            {genre.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-amber-500/20 text-amber-200 text-xs rounded-full border border-amber-400/30 backdrop-blur-sm text-shadow"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 bg-amber-400/20 border-2 border-amber-400 rounded-xl animate-pulse" />
      )}
    </Card>
  );
};

export default GenreCard;