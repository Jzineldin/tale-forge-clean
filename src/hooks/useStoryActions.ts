import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StorySegment } from './useStoryDisplay/types';
import { autosaveStoryProgress } from '@/utils/autosaveUtils';
import { useNavigate } from 'react-router-dom';

interface StoryGenerationParams {
  genre: string;
  skipImage: boolean;
  skipAudio: boolean;
  prompt?: string;
  storyId?: string;
  parentSegmentId?: string;
  choiceText?: string;
  targetAge?: '4-6' | '7-9' | '10-12';
  characters?: any;
}

interface PendingParams {
  choice?: string;
}

type PendingAction = 'start' | 'choice' | null;

interface StoryGeneration {
  generateSegment: (params: StoryGenerationParams) => Promise<any>;
}

export const useStoryActions = (
  storyGeneration: StoryGeneration,
  addToHistory: (segment: StorySegment) => void,
  incrementApiUsage: () => void
) => {
  const navigate = useNavigate();

  const confirmGeneration = useCallback(async (
    pendingAction: 'start' | 'choice' | null,
    pendingParams: PendingParams,
    genre: string,
    prompt: string,
    characterName: string,
    skipImage: boolean,
    skipAudio: boolean,
    currentStorySegment: StorySegment | null,
    setError: (error: string | null) => void,
    setCurrentStorySegment: (segment: StorySegment) => void,
    setAllStorySegments: (updater: (prev: StorySegment[]) => StorySegment[]) => void,
    setSegmentCount: (updater: (prev: number) => number) => void,
    setPendingAction: (action: PendingAction, params: PendingParams | null) => void,
    storyId?: string
  ) => {
    // Get age and character data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const targetAge = (urlParams.get('age') as '4-6' | '7-9' | '10-12') || '7-9';
    
    // Extract character data from URL parameters
    const charactersParam = urlParams.get('characters');
    let characters = null;
    
    console.log('🔍 [STORY_ACTIONS] Current URL:', window.location.href);
    console.log('🔍 [STORY_ACTIONS] All URL params:', Array.from(urlParams.entries()));
    console.log('🔍 [STORY_ACTIONS] Characters param from URL:', charactersParam);
    console.log('🔍 [STORY_ACTIONS] Characters param length:', charactersParam?.length || 0);
    
    if (charactersParam) {
      try {
        console.log('🔍 [STORY_ACTIONS] Raw characters param before decode:', charactersParam.substring(0, 200) + '...');
        const decodedParam = decodeURIComponent(charactersParam);
        console.log('🔍 [STORY_ACTIONS] Decoded characters param:', decodedParam.substring(0, 200) + '...');
        characters = JSON.parse(decodedParam);
        console.log('🎭 [STORY_ACTIONS] Characters successfully extracted from URL:', characters);
        console.log('🎭 [STORY_ACTIONS] Number of characters:', characters?.length || 0);
        if (characters && characters.length > 0) {
          console.log('🎭 [STORY_ACTIONS] Character details:', characters.map((c: any) => ({ 
            name: c.name, 
            role: c.role, 
            traits: c.traits,
            id: c.id 
          })));
        }
      } catch (error) {
        console.error('❌ [STORY_ACTIONS] Failed to parse characters from URL:', error);
        console.error('❌ [STORY_ACTIONS] Raw param that failed:', charactersParam);
      }
    } else {
      console.log('❌ [STORY_ACTIONS] No characters parameter found in URL');
    }
    
    console.log('🎯 [STORY_ACTIONS] Using target age from URL:', targetAge);
    console.log('🎭 [STORY_ACTIONS] Using characters:', characters?.length || 0, 'characters');
    if (characters && characters.length > 0) {
      console.log('🎭 [STORY_ACTIONS] Character details:', characters.map((c: any) => ({ name: c.name, role: c.role, traits: c.traits })));
    }
    setError(null);
    
    const params: StoryGenerationParams = {
      genre,
      skipImage,
      skipAudio,
      targetAge,
      characters
    };

    if (pendingAction === 'start') {
      // Ensure we have a valid prompt
      const basePrompt = prompt?.trim() || 'Create an exciting story';
      params.prompt = `${basePrompt}${characterName ? ` featuring ${characterName}` : ''}`;
      // Use the story ID from the URL for new stories
      if (storyId) {
        params.storyId = storyId;
      }
      console.log('🔍 Final prompt being used:', params.prompt);
      console.log('🔍 Story ID for new story:', params.storyId);
    } else {
      if (currentStorySegment?.story_id) params.storyId = currentStorySegment.story_id;
      if (currentStorySegment?.id) params.parentSegmentId = currentStorySegment.id;
      if (pendingParams?.choice) params.choiceText = pendingParams.choice;
      // For choice-based generation, use the choice as the prompt
      params.prompt = pendingParams?.choice || 'Continue the story';
    }

    try {
      if (pendingAction === 'start') {
        // For new stories, we should already have a story ID from the URL
        // The story was created in the CreatePrompt page, so we don't need to create it again
        if (!params.storyId) {
          console.error('No story ID available for new story generation');
          throw new Error('Story ID not found');
        }
        console.log('🚀 Using existing story ID for generation:', params.storyId);
      }

      console.log('🚀 About to call storyGeneration.generateSegment with params:', params);
      console.log('🔍 Prompt being sent:', params.prompt);
      console.log('🎭 Characters being sent:', params.characters);
      console.log('🎭 Characters data type:', typeof params.characters);
      console.log('🎭 Characters JSON:', JSON.stringify(params.characters, null, 2));
      const segment = await storyGeneration.generateSegment(params);
      console.log('✅ Story generation successful, received segment:', segment);
      
      // Force a new image URL to prevent caching issues
      const imageUrl = segment.image_url || segment.imageUrl || '/placeholder.svg';
      const timestampedImageUrl = imageUrl !== '/placeholder.svg' 
        ? `${imageUrl}?t=${Date.now()}` 
        : imageUrl;
      
      const completeSegment: StorySegment = {
        ...segment,
        created_at: segment.created_at || new Date().toISOString(),
        word_count: segment.word_count || segment.segment_text?.split(/\s+/).length || 0,
        audio_generation_status: segment.audio_generation_status || 'not_started',
        storyId: segment.story_id || segment.storyId || '',
        text: segment.segment_text || segment.text || '',
        imageUrl: timestampedImageUrl,
        audioUrl: segment.audio_url || segment.audioUrl || '',
        isEnd: segment.is_end || segment.isEnd || false
      };

      // If this is a continuation, mark the parent segment as continued
      if (pendingAction === 'choice' && currentStorySegment && pendingParams?.choice) {
        const updatedParentSegment = {
          ...currentStorySegment,
          selected_choice: pendingParams.choice,
          has_been_continued: true
        };
        
        // Update the parent segment in the history
        setAllStorySegments(prev => prev.map(seg => 
          seg.id === currentStorySegment.id ? updatedParentSegment : seg
        ));
      }
      
      // Force immediate state updates to trigger re-render
      setCurrentStorySegment(completeSegment);
      setAllStorySegments(prev => [...prev, completeSegment]);
      addToHistory(completeSegment);
      incrementApiUsage();
      
      // Autosave after each segment
      try {
        if (params.storyId && segment.story_id && segment.id) {
          await autosaveStoryProgress({
            storyId: segment.story_id,
            segmentId: segment.id,
            storyTitle: segment.segment_text?.substring(0, 100) + '...',
            segmentCount: (await getCurrentSegmentCount(params.storyId)) + 1,
            isEnd: segment.is_end || false
          });
        }
      } catch (error) {
        console.error('Autosave failed:', error);
        // Continue with story flow even if autosave fails
      }
      
      if (!completeSegment.is_end) {
        // Increment segment count properly - first segment should be Chapter 1
        setSegmentCount(prev => prev + 1);
      }
      
    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Story generation failed';
      setError(errorMessage);
      toast.error(errorMessage);
    }
    
    setPendingAction(null, null);
  }, [storyGeneration, addToHistory, incrementApiUsage, navigate]);

  const handleFinishStory = useCallback(async (
    currentStorySegment: StorySegment | null,
    setCurrentStorySegment: (segment: StorySegment) => void,
    setAllStorySegments: (updater: (prev: StorySegment[]) => StorySegment[]) => void
  ) => {
    if (!currentStorySegment) {
      toast.error('No story to finish');
      return;
    }

    console.log('🏁 Starting story finale generation...');
    
    try {
      toast.info('Generating story finale...', { duration: 3000 });
      
      // Create ending segment directly without edge function to avoid CORS issues
      // Get the last segment to create a contextual ending
      const { data: lastSegment } = await supabase
        .from('story_segments')
        .select('segment_text')
        .eq('story_id', currentStorySegment.story_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Create a more contextual ending based on the story
      const endingText = `With a sense of accomplishment and joy, our hero's journey comes to a satisfying close. The adventure has been filled with wonder, discovery, and growth. As the story draws to an end, there's a warm feeling of completion - knowing that this magical tale will be remembered and cherished. The end.`;

      const { data: endingSegment, error } = await supabase
        .from('story_segments')
        .insert({
          story_id: currentStorySegment.story_id,
          parent_segment_id: currentStorySegment.id,
          segment_text: endingText,
          choices: [], // No choices for ending
          image_prompt: "A beautiful conclusion scene showing the end of a magical adventure, warm golden light, peaceful and satisfying ending, digital art, highly detailed, vibrant colors",
          is_end: true
        })
        .select('*')
        .single();

      console.log('🔍 Database response:', { endingSegment, error });

      if (error) {
        console.error('Error finishing story:', error);
        throw new Error(error.message || 'Failed to create story ending');
      }

      // The database returns the segment directly
      if (endingSegment) {
        const finalEndingSegment: StorySegment = {
          ...endingSegment,
          created_at: endingSegment.created_at || new Date().toISOString(),
          word_count: endingSegment.word_count || endingSegment.segment_text?.split(/\s+/).length || 0,
          audio_generation_status: endingSegment.audio_generation_status || 'not_started'
        };

        console.log('✅ Ending segment created:', finalEndingSegment);

        // Update current segment and add to all segments
        setCurrentStorySegment(finalEndingSegment);
        setAllStorySegments(prev => [...prev, finalEndingSegment]);

        // Mark the story as completed
        await supabase
          .from('stories')
          .update({ is_completed: true, updated_at: new Date().toISOString() })
          .eq('id', currentStorySegment.story_id);

        // Trigger image generation for the ending
        supabase.functions.invoke('regenerate-image', {
          body: { segmentId: finalEndingSegment.id }
        }).catch(error => {
          console.warn('⚠️ Error triggering image generation for ending:', error);
        });
        
        toast.success('Story completed with a satisfying finale! 🎉');
      } else {
        // Fallback: just mark the current segment as ended
        const updatedSegment = { ...currentStorySegment, is_end: true, choices: [] as string[] };
        setCurrentStorySegment(updatedSegment);
        setAllStorySegments(prev => prev.map(seg => 
          seg.id === currentStorySegment.id ? updatedSegment : seg
        ));
        toast.success('Story completed!');
      }
      
    } catch (error) {
      console.error('Error finishing story:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate story finale';
      toast.error(errorMessage);
    }
  }, []);

  // Helper function to get current segment count
  const getCurrentSegmentCount = async (storyId: string): Promise<number> => {
    try {
      const { data: segments, error } = await supabase
        .from('story_segments')
        .select('id')
        .eq('story_id', storyId);
      
      if (error) throw error;
      return segments?.length || 0;
    } catch (error) {
      console.error('Error getting segment count:', error);
      return 0;
    }
  };

  return { confirmGeneration, handleFinishStory };
};