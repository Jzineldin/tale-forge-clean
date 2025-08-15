
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const compileFullVideo = async ({ storyId }: { storyId: string }) => {
  const { error } = await supabase.functions.invoke('compile-full-video', {
    body: { storyId },
  });

  if (error) {
    const errorBody = await (error as any).context.json();
    throw new Error(errorBody.error || error.message);
  }
};

export const useCompileFullVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: compileFullVideo,
    onSuccess: (_, { storyId }) => {
      toast.success("Full video compilation started!", {
        description: "This can take several minutes. The page will update automatically when it's ready.",
      });
      queryClient.invalidateQueries({ queryKey: ['story', storyId] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to start full video compilation: ${error.message}`);
    },
  });
};
