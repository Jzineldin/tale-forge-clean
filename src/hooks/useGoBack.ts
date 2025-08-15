
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useGoBack = ({ storyId }: { storyId: string }) => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (_segmentId: string) => {
      try {
        // Check if the story exists
        const { data: story } = await supabase
          .from('stories')
          .select('id')
          .eq('id', storyId)
          .single();

        if (story) {
          navigate(`/story/${storyId}`);
        } else {
          navigate('/my-stories');
        }
      } catch (error) {
        console.error('Error checking story existence:', error);
        navigate('/my-stories');
      }
    }
  });

  return mutation;
};
