
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Image } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { useGenerateInspiration } from '@/hooks/useGenerateInspiration';
import { usePromptSeeds } from '@/hooks/usePromptSeeds';
import { probe, assert } from '@/utils/testPipeline';
import { useAuthRequired } from '@/hooks/useAuthRequired';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import { useSubscription } from '@/hooks/useSubscription';
import { StoryCreationLimitChecker } from '@/components/pricing/UsageLimitChecker';
import { normalizeAgeInput } from '@/utils/ageUtils';



const CreatePrompt: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { canCreateStory, incrementUsage } = useSubscription();
  
  const [prompt, setPrompt] = useState('');
  const [currentPrompts, setCurrentPrompts] = useState<string[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [skipImage, setSkipImage] = useState(false);
  

  const selectedGenre = searchParams.get('genre');
  const selectedAge = searchParams.get('age');
  
  const { generateNewPrompts } = useGenerateInspiration();
  const { mutateSeeds, isGenerating: isGeneratingSeeds } = usePromptSeeds();
  
  const { checkAuthAndExecute, showAuthModal, setShowAuthModal } = useAuthRequired({
    feature: 'AI story generation'
  });

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
        // Use new dynamic seed system - use main prompt as seed
        const seeds = await mutateSeeds(selectedAge, selectedGenre, prompt);
        setCurrentPrompts(seeds);
      } else {
        // Fallback to old system
        const aiPrompts = await generateNewPrompts(selectedGenre!, selectedAge || undefined);
        setCurrentPrompts(aiPrompts);
      }
    } catch (err) {
      console.error('Failed to load AI prompts, using fallbacks:', err);
      // Use fallback prompts if AI generation fails
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
        'You discover a secret door in your closet that leads to a land where dreams are made.',
        'A wise old owl teaches you the language of the night and helps you understand your dreams.'
      ],
      'fantasy-and-magic': [
        'A magical door appears in your bedroom wall, and a friendly dragon invites you to explore a world of floating islands.',
        'You discover that your pet can talk and has been hiding a secret magical kingdom in your backyard.',
        'An ancient book in the library opens by itself and transports you to a realm where everyone can fly.',
        'A mysterious wizard appears in your backyard and asks for your help to save magic itself.',
        'You inherit a magical library where the stories inside the books are real and need your help.'
      ],
      'adventure-and-exploration': [
        'Your grandfather\'s old compass doesn\'t point north—it points to hidden treasures in your neighborhood.',
        'You find a map in the attic that leads to a secret garden filled with talking animals.',
        'A mysterious invitation arrives, inviting you to join a club of young explorers who discover hidden worlds.',
        'You discover that your school has secret passages leading to hidden worlds.',
        'A mysterious island appears on your local lake that wasn\'t there yesterday.'
      ],
      'mystery-and-detective': [
        'Every book you check out from the library contains a hidden message meant just for you.',
        'You notice that all the toys in your room are arranged differently each morning.',
        'A friendly ghost appears in your house and needs help solving a gentle mystery.',
        'You inherit your detective grandfather\'s office and find his unsolved case files.',
        'A mysterious package arrives at your door with clues to a treasure hunt.'
      ],
      'science-fiction-and-space': [
        'Your new smartphone starts receiving messages from your future self about amazing discoveries.',
        'You wake up on a friendly space station where robots help you learn about the solar system.',
        'A friendly alien visits your school and needs help understanding Earth\'s customs.',
        'You discover that your dreams are actually glimpses into parallel universes.',
        'A tiny alien crash-lands in your backyard and needs help fixing their spaceship.'
      ],
      'educational-stories': [
        'You shrink down to explore the human body and learn how it works from the inside.',
        'A time machine takes you back to ancient Egypt where you help build the pyramids using math.',
        'You become friends with a robot who teaches you about science through fun experiments.',
        'You discover a magical school where every subject is taught through real adventures.',
        'A talking computer virus teaches you about internet safety while trying to fix the digital world.'
      ],
      'values-and-life-lessons': [
        'You meet a new student at school who seems sad and needs a friend to help them feel welcome.',
        'You find a wallet full of money on the playground and must decide what to do.',
        'Your best friend starts spreading rumors about someone, and you have to choose what\'s right.',
        'You discover that your words have the power to make people feel better or worse.',
        'A magical mirror shows you how your actions affect others in ways you never imagined.'
      ],
      'silly-and-humorous': [
        'Your pet goldfish becomes a stand-up comedian and starts telling jokes to other pets.',
        'You wake up to find that gravity works backwards in your house for one day.',
        'Your school cafeteria food comes to life and starts a food fight revolution.',
        'You discover that your shadow has a mind of its own and keeps getting you into trouble.',
        'A magical remote control lets you change the channel on real life, but with hilarious consequences.'
      ]
    };

    // Handle potential URL truncation issues
    if (genre === 'and-magic') {
      console.log('Detected truncated genre "and-magic", using fantasy-and-magic fallback');
      return fallbacks['fantasy-and-magic'];
    }

    return fallbacks[genre] || fallbacks['fantasy-and-magic'];
  };

  const handlePromptSelect = async (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    // Auto-start story creation when a prompt is selected
    if (selectedPrompt.trim()) {
      // Small delay to show the selection
      setTimeout(() => {
        handleBeginAdventure();
      }, 300);
    }
  };

  const handleGenerateNewPrompts = async () => {
    checkAuthAndExecute(async () => {
      try {
        if (selectedAge && selectedGenre) {
          // Use new dynamic seed system - use main prompt as seed
          const newSeeds = await mutateSeeds(selectedAge, selectedGenre, prompt);
          setCurrentPrompts(newSeeds);
          toast.success('✨ New story seeds generated!');
        } else {
          // Fallback to old system
          const newPrompts = await generateNewPrompts(selectedGenre!, selectedAge || undefined);
          setCurrentPrompts(newPrompts);
          toast.success('✨ New inspiration prompts generated!');
        }
      } catch (err) {
        toast.error('Failed to generate new prompts. Please try again.');
      }
    });
  };


  const handleBeginAdventure = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a story prompt or select one from the suggestions');
      return;
    }

    // Check if user can create a story based on their tier limits
    if (!canCreateStory) {
      toast.error('You have reached your monthly story limit. Please upgrade your plan to continue creating stories.');
      navigate('/pricing');
      return;
    }

    checkAuthAndExecute(async () => {
      setIsCreating(true);
      
      try {
      console.log('Creating new story with prompt:', prompt);
      
      // Pipeline verification: Step 1 - Verify input parameters
      const ageParam = searchParams.get('age');
      const normalizedAge = normalizeAgeInput(ageParam);
      const genre = selectedGenre;
      probe('story_creation_input', { age: normalizedAge || ageParam, genre, prompt });
      
      // Create a new story first
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          title: prompt.slice(0, 100) + (prompt.length > 100 ? '...' : ''),
          description: prompt,
          story_mode: selectedGenre || 'fantasy',
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

      // Increment usage counter after successful story creation
      await incrementUsage({ stories: 1 });

      // Pipeline verification: Step 2 - Verify story creation
      probe('story_created', { 
        storyId: story.id, 
        storyMode: story.story_mode, 
        description: story.description 
      });
      
      // Verify the story matches our input parameters
      assert(story.story_mode === genre, `Genre drift: expected ${genre}, got ${story.story_mode}`);
      assert(story.description === prompt, `Prompt drift: expected ${prompt}, got ${story.description}`);

      console.log('Story created successfully:', story);

      // Navigate to the enhanced story display with initial parameters
      const params = new URLSearchParams({
        id: story.id,
        genre: selectedGenre || 'fantasy',
        prompt: prompt.trim(),
        mode: 'create',
        age: normalizedAge || '',
        skipImage: skipImage.toString()
      });
      
      // Include character data if present
      const charactersParam = searchParams.get('characters');
      console.log('🔍 [CreatePrompt] Characters param before navigation:', charactersParam);
      console.log('🔍 [CreatePrompt] Characters param length:', charactersParam?.length || 0);
      if (charactersParam) {
        try {
          const parsedCharacters = JSON.parse(decodeURIComponent(charactersParam));
          console.log('🎭 [CreatePrompt] Parsed characters:', parsedCharacters);
          params.set('characters', charactersParam);
          console.log('✅ [CreatePrompt] Characters added to navigation params');
        } catch (error) {
          console.error('❌ [CreatePrompt] Failed to parse characters:', error);
        }
      } else {
        console.log('❌ [CreatePrompt] No characters found in search params');
      }
      
      navigate(`/story-display?${params.toString()}`, { replace: true });
      
      } catch (err) {
        console.error('Error starting story:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to start story';
        toast.error(errorMessage);
      } finally {
        setIsCreating(false);
      }
    });
  };

  const handleBack = () => {
    navigate('/create/genre');
  };

  if (!selectedGenre) {
    return null;
  }

  return (
    <div className="magical-page-container">
      <div className="magical-content">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12 animate-magical-fade-in">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-400/30">
                <ChevronLeft className="h-8 w-8 text-amber-400 cursor-pointer" onClick={handleBack} />
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-400/30">
                <span className="text-2xl">🌱</span>
              </div>
            </div>
            <h1 className="fantasy-heading text-4xl md:text-6xl font-bold text-white mb-6">
              Story <span className="text-amber-400">Seed</span>
            </h1>
            <p className="fantasy-subtitle text-xl text-gray-300 max-w-2xl mx-auto">
              Plant the seed of your imagination and watch your story grow!
              <br />
              <span className="text-amber-300 font-medium">Write your own or choose from our magical suggestions.</span>
            </p>
          </div>

          {/* Wrap main content with StoryCreationLimitChecker */}
          <StoryCreationLimitChecker>
            {/* Main Content Card */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-8">
              
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
                  className="w-full break-words overflow-y-auto rounded-xl p-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                  style={{ textShadow: 'rgba(0, 0, 0, 0.7) 1px 1px 2px' }}
                />
              </div>
              
              {/* Prompt Suggestions */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-4" style={{ textShadow: 'rgba(0, 0, 0, 0.8) 2px 2px 4px' }}>
                  ✨ Magical Story Seeds
                </h3>
                
                {isLoadingPrompts ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="w-full p-4 rounded-xl border border-white/30 bg-white/10 animate-pulse">
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
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                          prompt === suggestion
                            ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/30'
                            : 'border-white/30 bg-white/10 hover:border-amber-400/50 hover:bg-white/15'
                        }`}
                      >
                        <p className="text-white text-sm leading-relaxed" style={{ textShadow: 'rgba(0, 0, 0, 0.7) 1px 1px 2px' }}>
                          {suggestion}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                
                <button
                  onClick={handleGenerateNewPrompts}
                  disabled={isGeneratingSeeds || isLoadingPrompts}
                  className="mt-4 text-amber-300 hover:text-amber-200 text-sm font-medium hover:underline disabled:opacity-50 transition-colors"
                >
                  {isGeneratingSeeds ? '✨ Generating new magic...' : '✨ Generate new story seeds'}
                </button>
              </div>

              {/* Image Generation Choice */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/20 border-2 border-amber-500/50 p-6 rounded-xl backdrop-blur-sm">
                  <h4 className="text-amber-300 font-semibold mb-3 flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Visual Magic Settings
                  </h4>
                  <p className="text-amber-200 text-sm mb-4 leading-relaxed">
                    Choose whether to include AI-generated images with your story. You can always change this later!
                  </p>
                  <div className="flex items-center space-x-3 bg-amber-900/30 p-4 rounded-lg">
                    <input
                      type="checkbox"
                      id="skip-image"
                      checked={skipImage}
                      onChange={(e) => setSkipImage(e.target.checked)}
                      className="w-4 h-4 text-amber-500 bg-slate-700 border-amber-400 rounded focus:ring-amber-500 focus:ring-2"
                    />
                    <label htmlFor="skip-image" className="text-amber-200 cursor-pointer flex-1 text-sm">
                      Skip image generation for now (you can add images later)
                    </label>
                  </div>
                  {skipImage && (
                    <p className="text-amber-300/70 text-xs mt-2">
                      💡 Tip: You can enable images for future chapters anytime during your story!
                    </p>
                  )}
                </div>
              </div>

              {/* Manual Generate Button (Fallback) */}
              <div className="text-center">
                <p className="text-amber-300 text-sm mb-4">
                  💡 Tip: Click any story seed above or press Enter in the text box to start automatically!
                </p>
                <button 
                  onClick={handleBeginAdventure}
                  disabled={!prompt.trim() || isCreating}
                  className="fantasy-button bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-amber-400/50"
                  style={{ 
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.1)',
                    color: 'white !important'
                  }}
                >
                  {isCreating ? '🌱 Growing Your Story...' : '🌱 Plant Your Story Seed'}
                </button>
                {searchParams.get('age') && (
                  <p className="text-amber-300 text-sm mt-3">
                    Creating stories perfect for {searchParams.get('age')} year olds
                  </p>
                )}
                </div>
              </div>
            </div>
          </StoryCreationLimitChecker>

          {/* Progress indicator */}
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-500/30 rounded-lg px-4 py-2">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-amber-300 text-sm font-medium">
                Step 3 of 3: Story Seed
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Authentication Required Modal */}
      <AuthRequiredModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        feature="AI story generation"
      />
    </div>
  );
};

export default CreatePrompt;
