import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Image } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { useGenerateInspiration } from '@/hooks/useGenerateInspiration';
import { usePromptSeeds } from '@/hooks/usePromptSeeds';
import { probe, assert } from '@/utils/testPipeline';
import { CharacterSelector } from '@/components/characters/CharacterSelector';
import { UserCharacter } from '@/hooks/useUserCharacters';
import { normalizeGenre } from '@/utils/genreUtils';
import { normalizeAgeInput } from '@/utils/ageUtils';

const CreatePromptWithCharacters: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [prompt, setPrompt] = useState('');
  const [currentPrompts, setCurrentPrompts] = useState<string[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [skipImage, setSkipImage] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState<UserCharacter[]>([]);

  const selectedGenre = searchParams.get('genre');
  const selectedAge = searchParams.get('age');
  
  const { generateNewPrompts } = useGenerateInspiration();
  const { mutateSeeds, isGenerating: isGeneratingSeeds } = usePromptSeeds();

  // Load initial prompts on mount
  useEffect(() => {
    if (selectedGenre) {
      loadAIPrompts();
    }
  }, [selectedGenre]);

  // Handle viewport changes for mobile
  useEffect(() => {
    const handleViewportChange = () => {
      if (window.visualViewport) {
        document.documentElement.style.setProperty('--vh', `${window.visualViewport.height * 0.01}px`);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      handleViewportChange();
      return () => window.visualViewport?.removeEventListener('resize', handleViewportChange);
    }
    return undefined; // Explicit return for case when visualViewport doesn't exist
  }, []);

  const loadAIPrompts = async () => {
    setIsLoadingPrompts(true);
    try {
      if (selectedAge && selectedGenre) {
        const seeds = await mutateSeeds(selectedAge, selectedGenre, prompt);
        setCurrentPrompts(seeds);
      } else {
        const aiPrompts = await generateNewPrompts(selectedGenre!, selectedAge || undefined);
        setCurrentPrompts(aiPrompts);
      }
    } catch (err) {
      console.error('Failed to load AI prompts, using fallbacks:', err);
      setCurrentPrompts(getFallbackPrompts(selectedGenre!));
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const getFallbackPrompts = (genre: string): string[] => {
    const fallbacks: Record<string, string[]> = {
      'bedtime-stories': [
        'A magical moonbeam visits your bedroom and takes you on a gentle adventure through the stars.',
        'Your stuffed animals come to life at midnight and throw a peaceful tea party.',
        'A friendly cloud floats down to your window and offers to show you how to make rainbows.',
      ],
      'fantasy-and-magic': [
        'A magical door appears in your bedroom wall, and a friendly dragon invites you to explore a world of floating islands.',
        'You discover that your pet can talk and has been hiding a secret magical kingdom in your backyard.',
        'An ancient book in the library opens by itself and transports you to a realm where everyone can fly.',
      ],
      'adventure-and-exploration': [
        'Your grandfather\'s old compass doesn\'t point north—it points to hidden treasures in your neighborhood.',
        'You find a map in the attic that leads to a secret garden filled with talking animals.',
        'A mysterious invitation arrives, inviting you to join a club of young explorers who discover hidden worlds.',
      ]
    };

    return fallbacks[genre] || fallbacks['fantasy-and-magic'];
  };

  const handlePromptSelect = async (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    setTimeout(() => {
      handleBeginAdventure();
    }, 300);
  };

  const handleGenerateNewPrompts = async () => {
    try {
      if (selectedAge && selectedGenre) {
        const newSeeds = await mutateSeeds(selectedAge, selectedGenre, prompt);
        setCurrentPrompts(newSeeds);
        toast.success('✨ New story seeds generated!');
      } else {
        const newPrompts = await generateNewPrompts(selectedGenre!, selectedAge || undefined);
        setCurrentPrompts(newPrompts);
        toast.success('✨ New inspiration prompts generated!');
      }
    } catch (err) {
      toast.error('Failed to generate new prompts. Please try again.');
    }
  };

  const handleCharacterToggle = (character: UserCharacter) => {
    setSelectedCharacters(prev => {
      const isSelected = prev.some(c => c.id === character.id);
      if (isSelected) {
        return prev.filter(c => c.id !== character.id);
      } else {
        return [...prev, character];
      }
    });
  };

  const handleBeginAdventure = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a story prompt or select one from the suggestions');
      return;
    }

    setIsCreating(true);
    
    try {
      console.log('Creating new story with prompt:', prompt);
      console.log('Selected characters:', selectedCharacters);
      
      const ageParam = searchParams.get('age');
      const normalizedAge = normalizeAgeInput(ageParam);
      const genre = normalizeGenre(selectedGenre || '');
      probe('story_creation_input', { age: normalizedAge || ageParam, genre, prompt, characters: selectedCharacters });
      
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          title: prompt.slice(0, 100) + (prompt.length > 100 ? '...' : ''),
          description: prompt,
          story_mode: normalizeGenre(selectedGenre || 'fantasy-magic'),
          target_age: normalizedAge ?? null,
          user_id: user?.id || null
        })
        .select()
        .single();

      if (storyError) {
        console.error('Error creating story:', storyError);
        throw new Error('Failed to create story');
      }

      if (!story) {
        throw new Error('No story data returned');
      }

      probe('story_created', { 
        storyId: story.id, 
        storyMode: story.story_mode, 
        description: story.description 
      });
      
      assert(story.story_mode === genre, `Genre drift: expected ${genre}, got ${story.story_mode}`);
      assert(story.description === prompt, `Prompt drift: expected ${prompt}, got ${story.description}`);

      console.log('Story created successfully:', story);

      // Save character associations if any characters are selected
      if (selectedCharacters.length > 0) {
        const characterAssociations = selectedCharacters.map(character => ({
          story_id: story.id,
          character_id: character.id
        }));

        const { error: charError } = await supabase
          .from('story_characters')
          .insert(characterAssociations);

        if (charError) {
          console.error('Error associating characters with story:', charError);
          // Don't fail the story creation if character association fails
        } else {
          console.log('Characters associated with story successfully');
        }
      }

      const params = new URLSearchParams({
        genre: normalizeGenre(selectedGenre || 'fantasy-magic'),
        prompt: prompt.trim(),
        mode: 'create',
        age: normalizedAge || '',
        skipImage: skipImage.toString()
      });
      const intent = 'general';
      if (intent) params.set('intent', intent);
      
      // Include selected characters
      if (selectedCharacters.length > 0) {
        const characterData = encodeURIComponent(JSON.stringify(selectedCharacters));
        params.set('characters', characterData);
        console.log('✅ [CreatePrompt] Selected characters added to navigation params:', selectedCharacters.map(c => c.name));
      }
      
      navigate(`/story/${story.id}?${params.toString()}`, { replace: true });
      
    } catch (err) {
      console.error('Error starting story:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start story';
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    navigate('/create/genre');
  };

  if (!selectedGenre) {
    return null;
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-border-primary">
                <ChevronLeft className="h-8 w-8 text-accent cursor-pointer" onClick={handleBack} />
              </div>
              {/* removed emoji */}
            </div>
            <h1 className="tale-forge-title mb-2">Story Seed</h1>
            <p className="text-body-large text-gray-200/90 max-w-2xl mx-auto mb-2">Plant the seed of your imagination and watch your story grow!</p>
            <p className="text-body text-amber-300/90">Write your own or choose from our magical suggestions.</p>
          </div>

          {/* Main Content Card */}
          <div className="max-w-4xl mx-auto">
            <div className="glass-enhanced p-8">
              
              {/* Text Input */}
              <div className="mb-8">
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) {
                      e.preventDefault();
                      handleBeginAdventure();
                    }
                  }}
                  placeholder="Eg. A lonely dragon meets a brave mouse... (Press Enter to start)"
                  className="prompt-textarea w-full rounded-xl p-4 resize-none"
                />
              </div>
              
              {/* Prompt Suggestions */}
              <div className="mb-8">
                <h3 className="text-heading text-white mb-4">Magical Story Seeds</h3>
                
                {isLoadingPrompts ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="w-full p-4 rounded-xl border border-white/15 bg-white/10 animate-pulse">
                        <div className="h-4 bg-white/20 rounded mb-2"></div>
                        <div className="h-4 bg-white/20 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {currentPrompts.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handlePromptSelect(suggestion)}
                        aria-pressed={prompt === suggestion}
                        className={`w-full text-left glass-card p-4 rounded-xl cursor-pointer border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${
                          prompt === suggestion
                            ? 'ring-2 ring-amber-400/50 bg-white/12 border-amber-300/40'
                            : 'hover:bg-white/12 hover:border-amber-300/30 active:bg-white/16 active:border-amber-400/40'
                        }`}
                      >
                        <p className="text-white text-sm leading-relaxed" style={{ textShadow: 'rgba(0, 0, 0, 0.7) 1px 1px 2px' }}>
                          {suggestion}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                
                <Button
                  onClick={handleGenerateNewPrompts}
                  disabled={isGeneratingSeeds || isLoadingPrompts}
                  variant="cta-secondary"
                  size="sm"
                  className="mt-4 mx-auto block"
                >
                  {isGeneratingSeeds ? '✨ Generating new magic...' : '✨ Generate new story seeds'}
                </Button>
              </div>

              {/* Character Selection */}
              <div className="mb-8">
                <CharacterSelector
                  selectedCharacters={selectedCharacters}
                  onCharacterToggle={handleCharacterToggle}
                  maxCharacters={3}
                  className="border-none"
                />
              </div>

              <div className="mb-8">
                <Card variant="enhanced" className="p-6 border-none">
                  <h4 className="text-accent font-semibold mb-3 flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Visual Magic Settings
                  </h4>
                  <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                    Choose whether to include AI-generated images with your story. You can always change this later!
                  </p>
                  <div className="flex items-center space-x-3 bg-bg-card rounded-lg p-4">
                    <input
                      type="checkbox"
                      id="skip-image"
                      checked={skipImage}
                      onChange={(e) => setSkipImage(e.target.checked)}
                      className="w-4 h-4 accent-[hsl(var(--ring))] bg-slate-700 border-border-primary rounded focus:ring-[hsl(var(--ring))] focus:ring-2"
                    />
                    <label htmlFor="skip-image" className="text-text-secondary cursor-pointer flex-1 text-sm">
                      Skip image generation for now (you can add images later)
                    </label>
                  </div>
                  {skipImage && (
                    <p className="text-text-secondary text-xs mt-2">
                      💡 Tip: You can enable images for future chapters anytime during your story!
                    </p>
                  )}
                </Card>
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <p className="text-text-secondary text-sm mb-4">Tip: Click any story seed above or press Enter in the text box to start automatically!</p>
                <Button 
                  onClick={handleBeginAdventure}
                  disabled={!prompt.trim() || isCreating}
                  variant="cta-primary"
                  size="lg"
                  className="font-bold rounded-xl text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Growing Your Story…' : 'Plant Your Story Seed'}
                </Button>
                {searchParams.get('age') && (
                  <p className="text-accent text-sm mt-3">
                    Creating stories perfect for {searchParams.get('age')} year olds

                    {selectedCharacters.length > 0 && (
                      <span className="block">
                        Featuring: {selectedCharacters.map(c => c.name).join(', ')}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 bg-bg-card border border-border-secondary rounded-lg px-4 py-2">
              <div className="w-3 h-3 bg-[hsl(var(--ring))] rounded-full animate-pulse" />
              <span className="text-accent text-sm font-medium">
                Step 3 of 3: Story Seed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePromptWithCharacters;