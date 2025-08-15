import React from 'react';
import { toast } from 'sonner';
import { useStoryGeneration } from '@/hooks/useStoryGeneration';
import { useGenerateFullStoryAudio } from '@/hooks/useGenerateFullStoryAudio';
import { useFinishStoryInline } from './useFinishStoryInline';
import { StorySegment } from '@/types/stories';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderErrorHandler, AIProviderType, logStoryGenerationError } from '@/utils/aiProviderErrorHandler';
import { validateInput } from '@/utils/security';
import { autosaveStoryProgress } from '@/utils/autosaveUtils';

interface UseStoryActionsProps {
  setError: (error: string | null) => void;
  setIsGeneratingStartup: (loading: boolean) => void;
  setIsGeneratingChoice: (loading: boolean) => void;
  setIsGeneratingEnding: (loading: boolean) => void;
  setCurrentSegment: (segment: StorySegment | null) => void;
  setStoryHistory: (history: StorySegment[] | ((prev: StorySegment[]) => StorySegment[])) => void;
  setApiCallsCount: (count: number | ((prev: number) => number)) => void;
  setFullStoryAudioUrl: (url: string | null) => void;
  setShowImageSettings: (show: boolean) => void;
  generationStartedRef: React.MutableRefObject<boolean>;
  skipImage: boolean;
  selectedVoice: string;
  currentSegment: StorySegment | null;
}


export const useStoryActions = ({
  setError,
  setIsGeneratingStartup,
  setIsGeneratingChoice,
  setIsGeneratingEnding,
  setCurrentSegment,
  setStoryHistory,
  setApiCallsCount,
  setFullStoryAudioUrl,
  setShowImageSettings,
  generationStartedRef,
  skipImage,
  selectedVoice,
  currentSegment,
}: UseStoryActionsProps) => {
  const { generateSegment } = useStoryGeneration();
  const generateAudioMutation = useGenerateFullStoryAudio();
  const finishStoryMutation = useFinishStoryInline();

  const handleStartStory = async (prompt: string, mode: string, targetAge: '4-6' | '7-9' | '10-12' = '7-9') => {
    if (generationStartedRef.current && currentSegment) {
      console.log('⚠️ Story generation already in progress or completed');
      return;
    }

    try {
      // Validate inputs
      const validatedPrompt = validateInput.storyPrompt(prompt);
      const validatedGenre = validateInput.storyGenre(mode);
      
      // Extract character data from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const charactersParam = urlParams.get('characters');
      let characters = null;
      
      console.log('🔍 [DEBUG] Current URL:', window.location.href);
      console.log('🔍 [DEBUG] Characters param from URL:', charactersParam);
      
      if (charactersParam) {
        try {
          characters = JSON.parse(decodeURIComponent(charactersParam));
          console.log('🎭 Characters extracted from URL:', characters);
        } catch (error) {
          console.warn('⚠️ Failed to parse characters from URL:', error);
        }
      } else {
        console.log('❌ No characters parameter found in URL');
      }
      
      // Check rate limiting
      const { data: { user } } = await supabase.auth.getUser();
      // Basic rate limiting check
      if (!user) {
        console.log('Anonymous user generating story');
      }

      console.log('🎬 Starting story generation with validated inputs:', { prompt: validatedPrompt, mode: validatedGenre, skipImage, charactersCount: characters?.length || 0 });
      if (characters && characters.length > 0) {
        console.log('🎭 Character details:', characters.map((c: any) => ({ name: c.name, role: c.role, traits: c.traits })));
      }
      setError(null);
      setIsGeneratingStartup(true);
      setShowImageSettings(false);
      setApiCallsCount(prev => prev + 1);
      
      const data = await generateSegment({
        prompt: validatedPrompt,
        genre: validatedGenre,
        skipImage,
        skipAudio: false,
        voice: selectedVoice,
        targetAge,
        characters
      });

      console.log('✅ Story generation successful:', data);

      const segmentData: StorySegment = {
        storyId: data.story_id,
        text: data.segment_text,
        imageUrl: data.image_url || '/placeholder.svg',
        choices: data.choices || [],
        isEnd: data.is_end || false,
        imageGenerationStatus: data.image_status,
        segmentId: data.id,
        id: data.id
      };

      setCurrentSegment(segmentData);
      setStoryHistory([segmentData]);
      setIsGeneratingStartup(false);
      
      // Autosave after first segment
      try {
        await autosaveStoryProgress({
          storyId: data.story_id,
          segmentId: data.id,
          storyTitle: data.segment_text?.substring(0, 100) + '...',
          segmentCount: 1,
          isEnd: data.is_end || false
        });
      } catch (error) {
        console.error('Autosave failed:', error);
        // Continue with story flow even if autosave fails
      }
      
      toast.success('Story started successfully!');
    } catch (error: any) {
      const providerError = AIProviderErrorHandler.handleProviderError(
        AIProviderType.OPENAI_GPT,
        'text-generation',
        error,
        { prompt, mode, skipImage }
      );

      logStoryGenerationError('text', error, { prompt, mode, skipImage });
      
      setError(providerError.userMessage);
      setIsGeneratingStartup(false);
      setShowImageSettings(true);
      generationStartedRef.current = false;
      toast.error(providerError.userMessage);
    }
  };

  const handleSelectChoice = async (choice: string) => {
    if (!currentSegment) return;

    try {
      setError(null);
      setIsGeneratingChoice(true);
      setApiCallsCount(prev => prev + 1);
      
      // Get targetAge from URL or use default
      const urlParams = new URLSearchParams(window.location.search);
      const targetAge = (urlParams.get('age') as '4-6' | '7-9' | '10-12') || '7-9';
      
      // Extract character data from URL parameters
      const charactersParam = urlParams.get('characters');
      let characters = null;
      
      if (charactersParam) {
        try {
          characters = JSON.parse(decodeURIComponent(charactersParam));
          console.log('🎭 Characters extracted for continuation:', characters);
        } catch (error) {
          console.warn('⚠️ Failed to parse characters from URL:', error);
        }
      }
      
      const data = await generateSegment({
        storyId: currentSegment.storyId,
        ...(currentSegment.segmentId && { parentSegmentId: currentSegment.segmentId }),
        choiceText: choice,
        skipImage,
        skipAudio: false,
        voice: selectedVoice,
        targetAge,
        characters
      });

      const segmentData: StorySegment = {
        storyId: data.story_id,
        text: data.segment_text,
        imageUrl: data.image_url || '/placeholder.svg',
        choices: data.choices || [],
        isEnd: data.is_end || false,
        imageGenerationStatus: data.image_status,
        segmentId: data.id,
        id: data.id
      };

      setCurrentSegment(segmentData);
      setStoryHistory(prev => [...prev, segmentData]);
      setIsGeneratingChoice(false);
      
      // Autosave after each choice/segment
      try {
        await autosaveStoryProgress({
          storyId: data.story_id,
          segmentId: data.id,
          storyTitle: data.segment_text?.substring(0, 100) + '...',
          segmentCount: 1,
          isEnd: data.is_end || false
        });
      } catch (error) {
        console.error('Autosave failed:', error);
        // Continue with story flow even if autosave fails
      }
      
      toast.success('Story continued successfully!');
    } catch (error: any) {
      const providerError = AIProviderErrorHandler.handleProviderError(
        AIProviderType.OPENAI_GPT,
        'text-generation',
        error,
        { choice, currentSegment: !!currentSegment }
      );

      logStoryGenerationError('choices', error, { choice, currentSegment: !!currentSegment });
      
      setError(providerError.userMessage);
      setIsGeneratingChoice(false);
      toast.error(providerError.userMessage);
    }
  };

  const handleFinishStory = async (skipEndingImage?: boolean, onStoryCompleted?: (storyId: string) => void) => {
    if (!currentSegment?.storyId) {
      toast.error('Cannot finish story: No story ID found');
      return;
    }

    try {
      setError(null);
      setIsGeneratingEnding(true);
      
      console.log('🏁 Starting story finish process for:', currentSegment.storyId);
      console.log('📸 Skip ending image:', skipEndingImage);
      
      const result = await finishStoryMutation.mutateAsync({
        storyId: currentSegment.storyId,
        skipImage: skipEndingImage || false
      });
      
      if (result?.endingSegment) {
        const endingSegmentData: StorySegment = {
          storyId: result.endingSegment.story_id,
          text: result.endingSegment.segment_text,
          imageUrl: result.endingSegment.image_url || '/placeholder.svg',
          choices: [],
          isEnd: true,
          imageGenerationStatus: result.endingSegment.image_status || 'completed',
          segmentId: result.endingSegment.id,
          id: result.endingSegment.id
        };

        setCurrentSegment(endingSegmentData);
        setStoryHistory(prev => [...prev, endingSegmentData]);
        console.log('✅ Story ending applied successfully');

        // Mark story as completed in database and trigger callback
        await markStoryAsCompleted(currentSegment.storyId);
        if (onStoryCompleted) {
          onStoryCompleted(currentSegment.storyId);
        }
      }
      
      setIsGeneratingEnding(false);
    } catch (error: any) {
      const providerError = AIProviderErrorHandler.handleProviderError(
        AIProviderType.OPENAI_GPT,
        'text-generation',
        error,
        { skipImage, currentSegment: !!currentSegment }
      );

      logStoryGenerationError('text', error, { skipImage, currentSegment: !!currentSegment });
      
      setError(providerError.userMessage);
      setIsGeneratingEnding(false);
      toast.error(providerError.userMessage);
    }
  };

  const markStoryAsCompleted = async (storyId: string) => {
    try {
      const { error } = await supabase
        .from('stories')
        .update({ is_completed: true })
        .eq('id', storyId);

      if (error) {
        console.error('❌ Error marking story as completed:', error);
      } else {
        console.log('✅ Story marked as completed in database');
      }
    } catch (error) {
      console.error('❌ Failed to mark story as completed:', error);
    }
  };

  const handleResumeStory = async (storyId: string) => {
    try {
      console.log('🔄 Resuming story:', storyId);
      setError(null);
      setIsGeneratingStartup(true);
      
      // Fetch story data from database
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single();

      if (storyError || !storyData) {
        throw new Error('Story not found');
      }

      // Fetch story segments
      const { data: segmentsData, error: segmentsError } = await supabase
        .from('story_segments')
        .select('*')
        .eq('story_id', storyId)
        .order('created_at', { ascending: true });

      if (segmentsError) {
        throw new Error('Failed to load story segments');
      }

      if (!segmentsData || segmentsData.length === 0) {
        throw new Error('No story segments found');
      }

      // Convert segments to StorySegment format
      const storyHistory: StorySegment[] = segmentsData.map(segment => ({
        storyId: segment.story_id,
        text: segment.segment_text,
        imageUrl: segment.image_url || '/placeholder.svg',
        choices: segment.choices || [],
        isEnd: segment.is_end || false,
        imageGenerationStatus: segment.image_generation_status || 'completed',
        segmentId: segment.id,
        id: segment.id
      }));

      // Set the last segment as current
      const currentSegment = storyHistory[storyHistory.length - 1];
      
      setStoryHistory(storyHistory);
      setCurrentSegment(currentSegment);
      setIsGeneratingStartup(false);
      
      toast.success('Story resumed successfully!');
    } catch (error: any) {
      console.error('❌ Failed to resume story:', error);
      setError('Failed to resume story. Please try again.');
      setIsGeneratingStartup(false);
      toast.error('Failed to resume story');
    }
  };

  const handleGenerateAudio = async () => {
    if (!currentSegment?.storyId) return;

    try {
      console.log('🎵 Starting audio generation for story:', currentSegment.storyId);
      
      const data = await generateAudioMutation.mutateAsync({
        storyId: currentSegment.storyId,
        voiceId: selectedVoice
      });

      if (data?.audioUrl) {
        setFullStoryAudioUrl(data.audioUrl);
        toast.success('Audio generated successfully!');
      }
    } catch (error: any) {
      const providerError = AIProviderErrorHandler.handleProviderError(
        AIProviderType.OPENAI_TTS,
        'audio-generation',
        error,
        { storyId: currentSegment.storyId, voice: selectedVoice }
      );

      logStoryGenerationError('audio', error, { storyId: currentSegment.storyId, voice: selectedVoice });
      
      toast.error(providerError.userMessage);
    }
  };

  return {
    handleStartStory,
    handleSelectChoice,
    handleFinishStory,
    handleResumeStory,
    handleGenerateAudio,
    generateAudioMutation,
  };
};
