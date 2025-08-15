
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const CreateGenre: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedAge = searchParams.get('age');
  const intent = searchParams.get('intent') || undefined;

  useEffect(() => {
    if (!selectedAge) {
      navigate('/create/age');
    }
  }, [selectedAge, navigate]);

  const genres = [
    {
      value: 'bedtime-stories',
      label: 'Bedtime Stories',
      subtitle: 'Peaceful Dreams',
      icon: '',
      image: '/images/bedtime-stories.png',
      tags: ['#sleep', '#dreams', '#calm']
    },
    {
      value: 'fantasy-and-magic',
      label: 'Fantasy & Magic',
      subtitle: 'Epic Adventures',
      icon: '',
      image: '/images/fantasy-and-magic.png',
      tags: ['#magic', '#fantasy', '#adventure']
    },
    {
      value: 'adventure-and-exploration',
      label: 'Adventure & Exploration',
      subtitle: 'Explore & Discover',
      icon: '',
      image: '/images/adventure-and-exploration.png',
      tags: ['#explore', '#discover', '#journey']
    },
    {
      value: 'mystery-and-detective',
      label: 'Mystery & Detective',
      subtitle: 'Solve & Investigate',
      icon: '',
      image: '/images/mystery-and-detective.png',
      tags: ['#mystery', '#detective', '#clues']
    },
    {
      value: 'science-fiction-and-space',
      label: 'Science Fiction & Space',
      subtitle: 'Future Worlds',
      icon: '',
      image: '/images/science-fiction-and-space.png',
      tags: ['#space', '#future', '#technology']
    },
    {
      value: 'educational-stories',
      label: 'Educational Stories',
      subtitle: 'Learn & Grow',
      icon: '',
      image: '/images/educational-stories.png',
      tags: ['#learn', '#grow', '#knowledge']
    },
    {
      value: 'values-and-life-lessons',
      label: 'Values & Life Lessons',
      subtitle: 'Learn & Grow',
      icon: '',
      image: '/images/values-and-life-lessons.png',
      tags: ['#values', '#lessons', '#wisdom']
    },
    {
      value: 'silly-and-humorous',
      label: 'Silly & Humorous Stories',
      subtitle: 'Laugh & Play',
      icon: '',
      image: '/images/silly-and-humorous.png',
      tags: ['#funny', '#silly', '#laugh']
    }
  ];

  const handleGenreSelect = (genreValue: string) => {
    setSelectedGenre(genreValue);
    // Auto-navigate to prompt page after genre selection
    if (selectedAge) {
      const params = new URLSearchParams({
        genre: genreValue,
        age: selectedAge
      });
      if (intent) params.set('intent', intent);
      navigate(`/create/prompt?${params.toString()}`);
    }
  };


  const handleBack = () => {
    navigate('/create/age');
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="section">
          {/* Header */}
          <div className="text-center mb-12 animate-magical-fade-in">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-400/30">
                <ChevronLeft className="h-8 w-8 text-accent cursor-pointer" onClick={handleBack} />
              </div>
              {/* Removed emoji badge */}
            </div>
            <h1 className="tale-forge-title mb-2">Choose Your Genre</h1>
            <p className="text-body-large text-gray-200/90 max-w-2xl mx-auto mb-2">What kind of story would you like to create today?</p>
            <p className="text-body text-amber-300/90">Pick the genre that excites you most!</p>
          </div>

          {/* Genre Selection Grid - Desktop Grid, Mobile Carousel */}
          <div className="max-w-7xl mx-auto">
            {/* MOBILE VIEW: Horizontal scrolling carousel */}
              <div className="md:hidden bg-slate-800/20 backdrop-blur-md border border-white/10 rounded-xl p-4">
              <div className="flex overflow-x-auto space-x-4 custom-scrollbar">
                {genres.map((genre) => (
                  <button
                    key={genre.value}
                    onClick={() => handleGenreSelect(genre.value)}
                      className={`flex-shrink-0 w-[70vw] h-[80vh] rounded-lg overflow-hidden relative cursor-pointer ${
                      selectedGenre === genre.value
                        ? 'ring-4 ring-amber-400 shadow-2xl shadow-amber-500/50'
                          : ''
                    }`}
                  >
                    <img 
                      src={genre.image}
                      alt={`${genre.label} genre`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 text-left">
                      <h3 className="font-['Cinzel'] text-2xl font-bold text-white mb-2" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                        {genre.label}
                      </h3>
                      <p className="text-gray-200 text-lg mb-3" style={{textShadow: '0 1px 3px rgba(0,0,0,0.7)'}}>
                        {genre.subtitle}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {genre.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-amber-500/20 text-amber-200 text-sm rounded-full border border-amber-400/30 backdrop-blur-sm"
                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Selection indicator */}
                    {selectedGenre === genre.value && (
                      <div className="absolute top-3 right-3 z-20">
                        <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* DESKTOP VIEW: Original grid layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {genres.map((genre) => (
                <button
                  key={genre.value}
                  onClick={() => handleGenreSelect(genre.value)}
                   className={`relative group overflow-hidden rounded-2xl ${
                    selectedGenre === genre.value
                      ? 'ring-4 ring-amber-400 shadow-2xl shadow-amber-500/50'
                       : ''
                  }`}
                >
                  {/* Genre Image Background - Square/Portrait */}
                  <div className="relative w-full aspect-[3/4]">
                    <img 
                      src={genre.image}
                      alt={`${genre.label} genre`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    
                    {/* Centered Content Overlay */}
                    <div className="absolute inset-0 p-4 text-center z-10 flex flex-col justify-center items-center">
                      {/* icon removed */}
                      
                      {/* Title with Shadow */}
                      <h3 
                        className="card-title text-white text-lg font-bold mb-1"
                        style={{ textShadow: 'rgba(0, 0, 0, 0.7) 1px 1px 3px' }}
                      >
                        {genre.label}
                      </h3>
                      <p 
                        className="card-mood text-amber-300 font-medium text-sm mb-3"
                        style={{ textShadow: 'rgba(0, 0, 0, 0.6) 1px 1px 2px' }}
                      >
                        {genre.subtitle}
                      </p>
                      
                      <div className="
                        card-details transition-all duration-300 ease-out overflow-hidden
                        opacity-0 max-h-0
                        group-hover:opacity-100 group-hover:max-h-20
                        focus-within:opacity-100 focus-within:max-h-20
                      ">
                        <div className="flex flex-wrap justify-center gap-1 mt-2">
                          {genre.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="tag px-2 py-1 bg-amber-500/20 text-amber-200 text-xs rounded-full border border-amber-400/30 backdrop-blur-sm"
                              style={{ textShadow: 'rgba(0, 0, 0, 0.8) 1px 1px 2px' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {selectedGenre === genre.value && (
                      <div className="absolute top-3 right-3 z-20">
                        <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>



          {/* Auto-progression info */}
          {selectedGenre && (
            <div className="text-center mt-8 animate-magical-fade-in">
              <div className="inline-flex items-center gap-2 bg-green-600/20 border border-green-500/30 rounded-lg px-4 py-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-300 text-sm font-medium">
                  Taking you to story seeds... ✨
                </span>
              </div>
              {selectedAge && (
                <p className="text-amber-300 text-sm mt-3">
                  Creating stories perfect for {selectedAge} year olds
                </p>
              )}
            </div>
          )}

          {/* Progress indicator */}
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-500/30 rounded-lg px-4 py-2">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-amber-300 text-sm font-medium">
                Step 2 of 3: Genre Selection
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGenre;
