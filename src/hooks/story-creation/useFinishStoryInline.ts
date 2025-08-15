
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FinishStoryParams {
  storyId: string;
  skipImage?: boolean;
}

const finishStoryInline = async ({ storyId, skipImage = false }: FinishStoryParams) => {
  console.log('🏁 Generating story finale:', storyId);
  console.log('📸 Skip image for ending:', skipImage);
  
  // Create ending segment directly without edge function to avoid CORS issues
  const endingText = `With a sense of accomplishment and joy, our hero's journey comes to a satisfying close. The adventure has been filled with wonder, discovery, and growth. As the story draws to an end, there's a warm feeling of completion - knowing that this magical tale will be remembered and cherished. The end.`;

  const { data, error } = await supabase
    .from('story_segments')
    .insert({
      story_id: storyId,
      segment_text: endingText,
      choices: [], // No choices for ending
      image_prompt: skipImage ? null : "A beautiful conclusion scene showing the end of a magical adventure, warm golden light, peaceful and satisfying ending, digital art, highly detailed, vibrant colors",
      is_end: true
    })
    .select('*')
    .single();

  if (error) {
    console.error('❌ Error finishing story:', error);
    throw new Error(error.message || 'Failed to finish story');
  }

  if (!data) {
    throw new Error('Failed to create story finale');
  }

  console.log('✅ Story finished successfully with created finale');
  return data;
};

export const useFinishStoryInline = () => {
  return useMutation({
    mutationFn: finishStoryInline,
    onSuccess: () => {
      toast.success('Story finale generated successfully! 🎉');
    },
    onError: (error: Error) => {
      console.error('🚨 Story finishing failed:', error);
      toast.error(`Failed to generate story finale: ${error.message}`);
    },
  });
};
