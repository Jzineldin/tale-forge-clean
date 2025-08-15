
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';

export const useStoryDatabase = () => {
  const { user } = useAuth();
  
  const createStoryInDatabase = async (title: string, prompt: string, storyMode: string) => {
    console.log('📝 Creating story in database:', { title, prompt, storyMode, userId: user?.id });
    
    const { data, error } = await supabase
      .from('stories')
      .insert({
        title: title,
        description: prompt,
        story_mode: storyMode,
        user_id: user?.id || null // Associate with user if authenticated, otherwise anonymous
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating story:', error);
      throw new Error(`Failed to create story: ${error.message}`);
    }

    if (!data) {
      throw new Error('No story data returned');
    }

    console.log('✅ Story created successfully:', data);
    return data;
  };

  const finishStoryInDatabase = async (segmentId: string, storyId: string) => {
    console.log('🏁 Finishing story for segment:', segmentId);
    
    // Mark the current segment as the end using Supabase
    const { error } = await supabase
      .from('story_segments')
      .update({ 
        is_end: true,
        choices: []
      })
      .eq('id', segmentId);
    
    if (error) {
      throw new Error(`Failed to finish story: ${error.message}`);
    }

    // Update the story to mark it as completed
    const { error: storyError } = await supabase
      .from('stories')
      .update({ is_completed: true })
      .eq('id', storyId);

    if (storyError) {
      console.warn('Warning: Could not mark story as completed:', storyError);
    }
  };

  return {
    createStoryInDatabase,
    finishStoryInDatabase
  };
};
