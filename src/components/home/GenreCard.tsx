
import React, { useState } from 'react';
import { StoryMode } from '@/data/storyModes';

interface GenreCardProps {
  mode: StoryMode;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const GenreCard: React.FC<GenreCardProps> = ({ 
  mode, 
  isSelected, 
  onSelect, 
  disabled = false 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getStoryModeImage = (modeName: string) => {
    const imageMap: { [key: string]: string } = {
      'Epic Fantasy': '/images/epic-fantasy.png',
      'Sci-Fi Thriller': '/images/sci-fi-thriller.png',
      'Mystery Detective': '/images/mystery-detective.png',
      'Horror Story': '/images/horror-story.png',
      'Adventure Quest': '/images/adventure-quest.png',
      'Romantic Drama': '/images/romantic-drama.png',
      'Comedy Adventure': '/images/comedy-adventure.png',
      'Historical Journey': '/images/historical-journey.png',
      'Child-Adapted Story': '/images/child-adapted-story.png',
      'Educational Adventure': '/images/educational-adventure.png',
    };
    
    return imageMap[modeName] || '/placeholder.svg';
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div
      className={`
        relative rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden
        aspect-[3/2] group
        ${isSelected 
          ? 'border-2 border-solid border-amber-400 shadow-2xl shadow-amber-400/30 transform -translate-y-2' 
          : 'border border-white/10 hover:border-amber-400/60 hover:scale-102 hover:shadow-xl'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={() => !disabled && onSelect()}
    >
      {/* Background Image - Full Coverage */}
      {!imageError && (
        <img
          src={getStoryModeImage(mode.name)}
          alt={mode.name}
          className={`
            absolute inset-0 w-full h-full object-cover transition-all duration-700
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            group-hover:scale-110
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      )}

      {/* Fallback gradient if image fails */}
      {imageError && (
        <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient || 'from-gray-800 to-gray-900'}`} />
      )}

      {/* Loading state */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Enhanced dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Icon badge - repositioned and enhanced */}
      <div className="absolute top-4 right-4 p-3 bg-black/70 backdrop-blur-md rounded-full border border-white/20 z-10">
        <mode.icon className="h-5 w-5 text-amber-400" />
      </div>
      
      {/* Content - enhanced typography */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-left z-10">
        <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg font-serif">
          {mode.name}
        </h3>
        <p className="text-sm text-gray-200 leading-relaxed drop-shadow-md line-clamp-2 opacity-90 font-sans">
          {mode.description}
        </p>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-amber-400/0 group-hover:bg-amber-400/5 transition-all duration-300" />
    </div>
  );
};

export default GenreCard;
