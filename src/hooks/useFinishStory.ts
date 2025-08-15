
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const finishStoryWithEnding = async (storyId: string) => {
  // First, get all story segments to understand the full narrative
  const { data: segments, error: segmentsError } = await supabase
    .from('story_segments')
    .select('*')
    .eq('story_id', storyId)
    .order('created_at', { ascending: true });

  if (segmentsError || !segments || segments.length === 0) {
    throw new Error('Failed to fetch story segments');
  }

  // Combine all segments into story context
  console.log('📊 Story analysis:', segments.length, 'segments found');

  // Create ending segment directly without edge function to avoid CORS issues

  console.log('🏁 Creating story finale');
  const endingText = `With a sense of accomplishment and joy, our hero's journey comes to a satisfying close. The adventure has been filled with wonder, discovery, and growth. As the story draws to an end, there's a warm feeling of completion - knowing that this magical tale will be remembered and cherished. The end.`;

  const { data: endingSegment, error: generationError } = await supabase
    .from('story_segments')
    .insert({
      story_id: storyId,
      segment_text: endingText,
      choices: [], // No choices for ending
      image_prompt: "A beautiful conclusion scene showing the end of a magical adventure, warm golden light, peaceful and satisfying ending, digital art, highly detailed, vibrant colors",
      is_end: true
    })
    .select('*')
    .single();

  if (generationError) {
    console.error('Story ending generation error:', generationError);
    throw new Error(`Failed to generate story finale: ${generationError.message}`);
  }

  if (!endingSegment || !endingSegment.id) {
    throw new Error('Invalid response from story creation');
  }

  console.log('✅ Story finale created successfully:', endingSegment.id);

  // Mark the story as completed and the new segment as the ending
  const { error: updateError } = await supabase
    .from('story_segments')
    .update({ is_end: true })
    .eq('id', endingSegment.id);

  if (updateError) {
    console.error('Error marking segment as end:', updateError);
    throw new Error('Failed to mark story as completed');
  }

  // Update the story status
  const { error: storyUpdateError } = await supabase
    .from('stories')
    .update({ 
      is_completed: true,
    })
    .eq('id', storyId);

  if (storyUpdateError) {
    console.error('Error updating story status:', storyUpdateError);
    throw new Error('Failed to update story status');
  }

  return { endingSegment, storyId };
};

export const useFinishStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: finishStoryWithEnding,
    onSuccess: (data) => {
      toast.success("Story completed! The finale is being generated. You can now create audio narration below. 🎉");
      
      // Force multiple refreshes to ensure we get the latest data
      queryClient.invalidateQueries({ queryKey: ['story', data.storyId] });
      queryClient.refetchQueries({ queryKey: ['story', data.storyId] });
      
      // Additional refresh after a short delay to catch any async updates
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['story', data.storyId] });
        queryClient.refetchQueries({ queryKey: ['story', data.storyId] });
      }, 1000);
    },
    onError: (error: Error) => {
      console.error('Finish story error:', error);
      toast.error(`Failed to generate story finale: ${error.message}`);
    },
  });
};
