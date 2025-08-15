
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Wand2, User } from 'lucide-react';

const CreateCustomize: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const selectedGenre = searchParams.get('genre');
  const initialPrompt = searchParams.get('prompt') || '';
  
  const [prompt, setPrompt] = useState(initialPrompt);
  const [characterName, setCharacterName] = useState('');
  const [storyLength, setStoryLength] = useState('standard');
  const [narrativeStyle, setNarrativeStyle] = useState('third');
  const [contentRating, setContentRating] = useState('family');
  const [visualStyle, setVisualStyle] = useState('realistic');

  useEffect(() => {
    if (!selectedGenre) {
      navigate('/create/genre');
    }
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [selectedGenre, initialPrompt, navigate]);

  const handleStartJourney = () => {
    if (prompt.trim()) {
      const params = new URLSearchParams({
        genre: selectedGenre || '',
        prompt: prompt.trim(),
        characterName: characterName.trim(),
        storyLength,
        narrativeStyle,
        contentRating,
        visualStyle
      });
      
      // Generate a mock story ID for now
      const storyId = Math.random().toString(36).substr(2, 9);
      navigate(`/story/${storyId}?${params.toString()}`);
    }
  };

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

  return (
    <div 
      className="min-h-screen bg-slate-900"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="container mx-auto px-4 pb-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Button
            variant="ghost"
            onClick={() => navigate('/create/starting-point?genre=' + selectedGenre)}
            className="absolute top-8 left-8 text-white hover:text-amber-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Starting Point
          </Button>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif">
            Customize Your <span className="text-amber-400">Story</span>
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Selected Genre: <span className="text-amber-400 font-medium">{getGenreTitle(selectedGenre || '')}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Story Prompt */}
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-amber-400" />
                Story Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt" className="text-gray-300 mb-2 block">
                  Describe your story idea (up to 500 characters)
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="A brave knight discovers a hidden dragon's lair filled with ancient treasures..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
                  className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 min-h-[120px]"
                  required
                />
                <p className="text-sm text-gray-400 mt-1">
                  {prompt.length}/500 characters
                </p>
              </div>
              
              <div>
                <Label htmlFor="character" className="text-gray-300 mb-2 block">
                  <User className="inline h-4 w-4 mr-1" />
                  Character Name (Optional)
                </Label>
                <Input
                  id="character"
                  placeholder="Alex, Sarah, Marcus..."
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Customization Options */}
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Story Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Story Length */}
              <div>
                <Label className="text-gray-300 mb-3 block">Story Length</Label>
                <RadioGroup value={storyLength} onValueChange={setStoryLength}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quick" id="quick" />
                    <Label htmlFor="quick" className="text-gray-300">Quick (3-5 segments)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="text-gray-300">Standard (6-10 segments)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="epic" id="epic" />
                    <Label htmlFor="epic" className="text-gray-300">Epic (10+ segments)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Narrative Style */}
              <div>
                <Label className="text-gray-300 mb-2 block">Narrative Style</Label>
                <Select value={narrativeStyle} onValueChange={setNarrativeStyle}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">First Person ("I walked...")</SelectItem>
                    <SelectItem value="third">Third Person ("They walked...")</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content Rating */}
              <div>
                <Label className="text-gray-300 mb-2 block">Content Rating</Label>
                <Select value={contentRating} onValueChange={setContentRating}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family Friendly</SelectItem>
                    <SelectItem value="teen">Teen (13+)</SelectItem>
                    <SelectItem value="mature">Mature (18+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Visual Style */}
              <div>
                <Label className="text-gray-300 mb-2 block">Visual Style</Label>
                <Select value={visualStyle} onValueChange={setVisualStyle}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="artistic">Artistic</SelectItem>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Journey Button */}
        <div className="text-center mt-12">
          <Button
            onClick={handleStartJourney}
            disabled={!prompt.trim()}
            className="btn-primary px-12 py-4 text-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 className="mr-2 h-6 w-6" />
            Start Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomize;
