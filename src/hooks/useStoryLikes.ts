
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';

export const useStoryLikes = (storyId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get total likes count for the story
  const { data: likesCount = 0 } = useQuery({
    queryKey: ['story-likes-count', storyId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('story_likes')
        .select('*', { count: 'exact', head: true })
        .eq('story_id', storyId);

      if (error) throw error;
      return count || 0;
    },
  });

  // Check if current user has liked the story
  const { data: userHasLiked = false } = useQuery({
    queryKey: ['story-user-liked', storyId, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('story_likes')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('You must be logged in to like stories');
      }

      if (userHasLiked) {
        // Unlike
        const { error } = await supabase
          .from('story_likes')
          .delete()
          .eq('story_id', storyId)
          .eq('user_id', user.id);

        if (error) throw error;
        return { action: 'unliked' };
      } else {
        // Like
        const { error } = await supabase
          .from('story_likes')
          .insert({ story_id: storyId, user_id: user.id });

        if (error) throw error;
        return { action: 'liked' };
      }
    },
    onSuccess: (result) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['story-likes-count', storyId] });
      queryClient.invalidateQueries({ queryKey: ['story-user-liked', storyId, user?.id] });
      
      toast.success(result.action === 'liked' ? 'Story liked!' : 'Story unliked');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update like status');
    },
  });

  return {
    likesCount,
    userHasLiked,
    toggleLike: toggleLikeMutation.mutate,
    isToggling: toggleLikeMutation.isPending,
  };
}; 