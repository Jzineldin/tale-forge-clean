
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);

      if (error) {
        throw error;
      }

      return true;
    },
    onSuccess: () => {
      toast.success('Story deleted successfully');
      // Invalidate and refetch stories
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['my-stories'] });
    },
    onError: (error) => {
      console.error('Error deleting story:', error);
      toast.error('Failed to delete story');
    }
  });

  return mutation;
};
