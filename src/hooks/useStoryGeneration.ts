import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateStorySegment } from '@/lib/ai-api';
import { secureConsole } from '@/utils/secureLogger';
import { useStoryChoices } from './useStoryChoices';
import { useTierEnforcement } from './useTierEnforcement';
import { useAuth } from '@/context/AuthProvider';
import { useSubscription } from './useSubscription';

interface GenerateStoryParams {
  prompt?: string;
  genre?: string;
  storyId?: string;
  parentSegmentId?: string;
  choiceText?: string;
  skipImage?: boolean;
  skipAudio?: boolean;
  voice?: string;
  targetAge?: '4-6' | '7-9' | '10-12';
  characters?: Array<{
    id: string;
    name: string;
    role: 'protagonist' | 'sidekick' | 'companion' | 'custom';
    description?: string;
    traits?: string[];
  }>;
}

export const useStoryGeneration = () => {
  const queryClient = useQueryClient();
  const { updateChoices } = useStoryChoices();
  const { enforceStoryCreation, enforceImageGeneration } = useTierEnforcement();

  const mutation = useMutation({
    mutationFn: async (params: GenerateStoryParams) => {
      console.log('🚀 [STORY_GENERATION] Starting story generation with params:', {
        prompt: params.prompt?.substring(0, 100) + '...',
        genre: params.genre,
        storyId: params.storyId,
        parentSegmentId: params.parentSegmentId,
        choiceText: params.choiceText,
        skipImage: params.skipImage,
        targetAge: params.targetAge,
        charactersCount: params.characters?.length || 0
      });

      // 🔒 TIER ENFORCEMENT: Check if user can create stories
      const canCreateStory = await enforceStoryCreation();
      if (!canCreateStory) {
        throw new Error('Story creation limit reached for your current tier');
      }

      // 🔒 TIER ENFORCEMENT: Check if user can generate images (if not skipping)
      if (!params.skipImage) {
        const canGenerateImage = await enforceImageGeneration();
        if (!canGenerateImage) {
          console.warn('⚠️ Image generation limit reached, proceeding without image');
          params.skipImage = true;
        }
      }

      // Use centralized AI API with context window capping
      const result = await generateStorySegment({
        prompt: params.prompt || '',
        age: params.targetAge || '7-9',
        genre: params.genre || 'fantasy',
        ...(params.storyId && { storyId: params.storyId }),
        ...(params.parentSegmentId && { parentSegmentId: params.parentSegmentId }),
        ...(params.choiceText && { choiceText: params.choiceText }),
        characters: params.characters,
        storyId: params.storyId,
      });

      console.log('📝 [STORY_GENERATION] AI response received:', {
        id: result.id,
        story_id: result.story_id,
        textLength: result.text?.length || 0,
        choicesCount: result.choices?.length || 0,
        choices: result.choices,
        isEnd: result.is_end,
        imageUrl: result.image_url
      });

      // Store choices in durable store immediately
      if (result.choices && result.choices.length > 0) {
        const segmentId = result.id || `temp-${Date.now()}`;
        console.log('💾 [STORY_GENERATION] Storing choices in durable store:', {
          segmentId,
          choices: result.choices,
          choicesCount: result.choices.length
        });
        updateChoices(segmentId, result.choices);
        secureConsole.debug('💾 Stored choices in durable store:', { segmentId, choices: result.choices });
      } else {
        console.warn('⚠️ [STORY_GENERATION] No choices received from AI response!');
      }

      // Create a segment object from the enhanced response
      const storyData = {
        id: result.id || `temp-${Date.now()}`,
        story_id: result.story_id || params.storyId || `story-${Date.now()}`,
        parent_segment_id: params.parentSegmentId || null,
        segment_text: result.text,
        choice_text: params.choiceText || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        audio_url: null,
        audio_status: 'not_started',
        image_url: result.image_url || '/placeholder.svg',
        image_status: result.image_url && result.image_url !== '/placeholder.svg' ? 'completed' : 'not_started',
        image_prompt: null,
        choices: result.choices || [],
        is_end: result.is_end || false
      };

      console.log('✅ [STORY_GENERATION] Story generation successful:', {
        id: storyData.id,
        story_id: storyData.story_id,
        textLength: storyData.segment_text?.length || 0,
        choicesCount: storyData.choices?.length || 0,
        choices: storyData.choices,
        imageUrl: storyData.image_url,
        isEnd: storyData.is_end
      });

      secureConsole.info('✅ Story generation successful:', storyData);
      return storyData;
    },
    onSuccess: (segment) => {
      console.log('🎉 [STORY_GENERATION] Mutation success callback:', {
        id: segment.id,
        story_id: segment.story_id,
        choicesCount: segment.choices?.length || 0,
        choices: segment.choices
      });
      
      secureConsole.info('🎉 Story segment generated successfully:', segment);
      
      // Invalidate and refetch story data
      if (segment.story_id) {
        console.log('🔄 [STORY_GENERATION] Invalidating story query:', segment.story_id);
        queryClient.invalidateQueries({ queryKey: ['story', segment.story_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
    onError: (error) => {
      console.error('💥 [STORY_GENERATION] Story generation failed:', error);
      secureConsole.error('💥 Story generation failed:', error);
      const errorMessage = error.message || 'Failed to generate story';
      secureConsole.error('Error details:', errorMessage);
    }
  });

  return {
    generateSegment: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    error: mutation.error?.message || null
  };
};