
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const generateFullStoryAudio = async ({ storyId, voiceId }: { storyId: string, voiceId: string }) => {
  console.log('🎵 Starting audio generation request:', { storyId, voiceId });

  const { data, error } = await supabase.functions.invoke('generate-full-story-audio', {
    body: { storyId, voiceId },
  });

  if (error) {
    console.error('🚨 Audio generation error:', error);

    let errorMessage = 'Audio generation failed';
    try {
      if ((error as any).message) {
        errorMessage = (error as any).message;
      } else if ((error as any).context && typeof (error as any).context.json === 'function') {
        const errorBody = await (error as any).context.json();
        errorMessage = errorBody.error || errorBody.message || errorMessage;
      } else if (typeof error === 'string') {
        errorMessage = error as string;
      }
    } catch (parseError) {
      console.error('🚨 Error parsing error response:', parseError);
    }

    throw new Error(errorMessage);
  }

  console.log('✅ Audio generation response:', data);
  return data;
};

export const useGenerateFullStoryAudio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateFullStoryAudio,
    onSuccess: (data, { storyId, voiceId }) => {
      console.log('✅ Audio generation mutation successful:', { storyId, voiceId, data });

      toast.success("Audio generation started!", {
        description: "This may take a few minutes. The audio will appear below when ready.",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['story', storyId] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['narrated-minutes'] });
      queryClient.invalidateQueries({ queryKey: ['usage'] });
    },
    onError: (error: Error, { storyId, voiceId }) => {
      console.error('🚨 Audio generation mutation failed:', {
        error: error.message,
        storyId,
        voiceId,
        stack: error.stack
      });

      toast.error(`Failed to start audio generation: ${error.message}`, {
        description: "Please try again or contact support if the issue persists.",
      });
    },
  });
};
