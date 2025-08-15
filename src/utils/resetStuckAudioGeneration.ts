import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Utility function to reset stuck audio generation status
 * This can be used to fix stories that are stuck in 'in_progress' state
 */
export const resetStuckAudioGeneration = async (storyId: string): Promise<boolean> => {
  try {
    console.log('🔄 Resetting stuck audio generation for story:', storyId);
    
    const { error } = await supabase
      .from('stories')
      .update({ 
        audio_generation_status: 'not_started',
        full_story_audio_url: null
      })
      .eq('id', storyId);

    if (error) {
      console.error('Error resetting audio generation status:', error);
      toast.error('Failed to reset audio generation status');
      return false;
    }

    console.log('✅ Successfully reset audio generation status for story:', storyId);
    toast.success('Audio generation status reset successfully. You can now try again with ElevenLabs voices.');
    return true;
  } catch (error) {
    console.error('Error in resetStuckAudioGeneration:', error);
    toast.error('Failed to reset audio generation status');
    return false;
  }
};

/**
 * Check if a story's audio generation is stuck (in_progress for more than 5 minutes)
 */
export const isAudioGenerationStuck = async (storyId: string): Promise<boolean> => {
  try {
    const { data: story, error } = await supabase
      .from('stories')
      .select('updated_at, audio_generation_status')
      .eq('id', storyId)
      .single();

    if (error || !story) {
      console.error('Error checking story status:', error);
      return false;
    }

    if (story.audio_generation_status === 'in_progress') {
      const lastUpdate = new Date(story.updated_at);
      const now = new Date();
      const timeDiff = now.getTime() - lastUpdate.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      // If it's been more than 5 minutes, consider it stuck
      return minutesDiff > 5;
    }

    return false;
  } catch (error) {
    console.error('Error checking if audio generation is stuck:', error);
    return false;
  }
};

/**
 * Get all stories with stuck audio generation (for admin use)
 */
export const getStuckAudioGenerationStories = async (): Promise<any[]> => {
  try {
    const { data: stories, error } = await supabase
      .from('stories')
      .select('id, title, audio_generation_status, updated_at')
      .eq('audio_generation_status', 'in_progress');

    if (error) {
      console.error('Error fetching stuck stories:', error);
      return [];
    }

    const now = new Date();
    const stuckStories = stories.filter(story => {
      const lastUpdate = new Date(story.updated_at);
      const timeDiff = now.getTime() - lastUpdate.getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      return minutesDiff > 5;
    });

    return stuckStories;
  } catch (error) {
    console.error('Error getting stuck audio generation stories:', error);
    return [];
  }
}; 