import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Wand2, Home } from 'lucide-react';

interface StartingPoint {
  id: string;
  text: string;
}

const CreateStartingPoint: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedStartingPoint, setSelectedStartingPoint] = useState<string>('');
  const [customStartingPoint, setCustomStartingPoint] = useState('');
  const [selectionType, setSelectionType] = useState<'generated' | 'custom'>('generated');

  const selectedGenre = searchParams.get('genre');

  useEffect(() => {
    if (!selectedGenre) {
      navigate('/create/genre');
    }
  }, [selectedGenre, navigate]);

  const getGenreTitle = (genreId: string) => {
    const genreMap: { [key: string]: string } = {
      'child-adapted': '👶 Child Adapted',
      'horror-story': '👻 Horror Story',
      'educational': '📚 Educational',
      'epic-fantasy': '🏰 Epic Fantasy',
      'sci-fi-thriller': '🚀 Sci-Fi Thriller',
      'mystery': '🕵️ Mystery',
      'romantic-drama': '💕 Romantic Drama',
      'adventure-quest': '🗺️ Adventure Quest'
    };
    return genreMap[genreId] || genreId;
  };

  const getStartingPoints = (genreId: string): StartingPoint[] => {
    const startingPointMap: { [key: string]: StartingPoint[] } = {
      'epic-fantasy': [
        { id: '1', text: 'The ancient map, clutched in your hand, hums with a faint, forgotten magic.' },
        { id: '2', text: 'Whispers of a fallen kingdom and a lost crown have led you to the edge of the Shadow-fen.' },
        { id: '3', text: 'A dragon\'s scale, warm to the touch, was the only inheritance your master left you.' }
      ],
      'sci-fi-thriller': [
        { id: '1', text: 'The space station\'s lights flicker as an unknown signal penetrates the hull.' },
        { id: '2', text: 'Your cryo-pod opens centuries earlier than planned, and Earth is no longer blue.' },
        { id: '3', text: 'The AI\'s voice has been silent for three days, and the ship is heading toward an uncharted system.' }
      ],
      'mystery': [
        { id: '1', text: 'The locked room contained only a chair, a photograph, and a single drop of blood.' },
        { id: '2', text: 'Every witness tells the same story, but their timelines don\'t match.' },
        { id: '3', text: 'The victim\'s last text message was sent an hour after they were declared dead.' }
      ],
      'horror-story': [
        { id: '1', text: 'The house has been empty for fifty years, but the lights turn on every night at midnight.' },
        { id: '2', text: 'You found the journal in the attic, and it contains entries dated in your handwriting.' },
        { id: '3', text: 'The reflection in the mirror moves a second before you do.' }
      ],
      'adventure-quest': [
        { id: '1', text: 'The treasure map was sewn into your grandmother\'s quilt, and X marks a spot in the forbidden forest.' },
        { id: '2', text: 'Your compass spins wildly as you approach the cavern marked with ancient symbols.' },
        { id: '3', text: 'The rope bridge sways over the chasm, and strange sounds echo from the valley below.' }
      ],
      'romantic-drama': [
        { id: '1', text: 'The letter arrived twenty years late, and it changes everything you thought you knew about love.' },
        { id: '2', text: 'You recognize the stranger across the café, but they died in your arms five years ago.' },
        { id: '3', text: 'The wedding invitation is addressed to you, but it\'s for marrying someone you\'ve never met.' }
      ],
      'child-adapted': [
        { id: '1', text: 'Your pet hamster starts talking and tells you about a secret world behind the bookshelf.' },
        { id: '2', text: 'The crayon box in your desk drawer contains colors that don\'t exist in the real world.' },
        { id: '3', text: 'Every night, the toys in your room have adventures while you sleep.' }
      ],
      'educational': [
        { id: '1', text: 'The history book falls open to a page about an event that hasn\'t happened yet.' },
        { id: '2', text: 'Your science experiment creates a miniature ecosystem that begins to evolve rapidly.' },
        { id: '3', text: 'The mathematical equation on the board solves itself and reveals coordinates to an unknown location.' }
      ]
    };
    
    return startingPointMap[genreId] || [
      { id: '1', text: 'Your adventure begins with a mysterious discovery that changes everything.' },
      { id: '2', text: 'A chance encounter leads you down an unexpected path.' },
      { id: '3', text: 'You find yourself in a situation that tests your courage and wit.' }
    ];
  };

  const startingPoints = getStartingPoints(selectedGenre || '');

  const handleSelectStartingPoint = (startingPoint: StartingPoint) => {
    setSelectedStartingPoint(startingPoint.text);
    setSelectionType('generated');
    setCustomStartingPoint('');
  };

  const handleCustomInput = (value: string) => {
    setCustomStartingPoint(value);
    setSelectionType('custom');
    setSelectedStartingPoint('');
  };

  const handleContinue = () => {
    const prompt = selectionType === 'custom' ? customStartingPoint.trim() : selectedStartingPoint;
    
    if (prompt) {
      const params = new URLSearchParams({
        genre: selectedGenre || '',
        prompt: prompt
      });
      
      navigate(`/create/customize?${params.toString()}`);
    }
  };

  const canContinue = (selectionType === 'generated' && selectedStartingPoint) || 
                     (selectionType === 'custom' && customStartingPoint.trim());

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="container mx-auto px-4 py-16">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="cta-ghost" size="sm" onClick={() => navigate('/create/genre')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Genres
            </Button>
            <Button variant="cta-ghost" size="sm" onClick={() => navigate('/')}> 
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </div>

          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="fantasy-heading text-4xl md:text-6xl font-bold text-white mb-4">
              Choose Your <span className="text-accent">Starting Point</span>
            </h1>
            <p className="fantasy-subtitle text-lg md:text-xl text-gray-300">
              Genre: <span className="text-accent font-medium">{getGenreTitle(selectedGenre || '')}</span>
            </p>
            <p className="text-text-secondary mt-2">Pick one of our crafted beginnings or write your own</p>
          </div>

          {/* Main Card */}
          <div className="max-w-4xl mx-auto">
            <div className="glass-card-enhanced p-6 md:p-8 rounded-2xl">
              {/* Custom Starting Point */}
              <div className="mb-8">
                <Textarea
                  placeholder="Start your story with your own opening sentence..."
                  value={customStartingPoint}
                  onChange={(e) => handleCustomInput(e.target.value)}
                  className="input-field w-full min-h-[120px]"
                  maxLength={500}
                />
                <p className="text-sm text-text-secondary mt-2">{customStartingPoint.length}/500 characters</p>
              </div>

              {/* Generated Starting Points */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">✨ Suggested Beginnings</h2>
                <div className="grid gap-3">
                  {startingPoints.map((point) => (
                    <button
                      key={point.id}
                      onClick={() => handleSelectStartingPoint(point)}
                      className={`w-full text-left glass-card p-4 ${
                        selectedStartingPoint === point.text ? 'ring-2 ring-[hsl(var(--ring))]' : ''
                      }`}
                    >
                      <p className="text-white text-sm leading-relaxed">{point.text}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <div className="text-center">
                <Button
                  onClick={handleContinue}
                  disabled={!canContinue}
                  variant="cta-primary"
                  size="lg"
                  className="w-full md:w-auto"
                >
                  <Wand2 className="mr-2 h-5 w-5" />
                  Continue to Customization
                </Button>
                {!canContinue && (
                  <p className="text-text-secondary mt-3">
                    Please select a starting point or write your own to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStartingPoint;