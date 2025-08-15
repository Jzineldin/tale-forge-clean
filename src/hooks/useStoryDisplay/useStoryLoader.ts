
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StorySegment } from './types';
import { isValidUUID, isProperUUID } from './utils';

export const useStoryLoader = () => {
  const loadExistingStory = useCallback(async (
    id: string | undefined,
    setAllStorySegments: (segments: StorySegment[]) => void,
    setCurrentStorySegment: (segment: StorySegment) => void,
    setSegmentCount: (count: number) => void,
    setViewMode: (mode: 'create' | 'player') => void
  ): Promise<boolean> => {
    // Only try to load if the ID is valid and looks like a UUID (not a custom ID)
    if (!id || !isValidUUID(id)) {
      console.log('ID is not valid, skipping story load:', id);
      return false;
    }

    // Skip database queries for custom IDs that aren't proper UUIDs
    if (!isProperUUID(id)) {
      console.log('ID is a custom ID, not querying database:', id);
      return false;
    }

    try {
      // First, get the story data to check if it's completed
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('is_completed')
        .eq('id', id)
        .maybeSingle();

      if (storyError) {
        console.error('Error fetching story data:', storyError);
        // Continue with segments even if story data fails
      }

      const { data: segments, error } = await supabase
        .from('story_segments')
        .select('*')
        .eq('story_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (segments && segments.length > 0) {
        // Map database segments to TypeScript interface
        const enhancedSegments: StorySegment[] = segments.map(segment => ({
          ...segment,
          storyId: segment.story_id,
          text: segment.segment_text,
          imageUrl: segment.image_url || '',
          audioUrl: segment.audio_url || '',
          audio_url: segment.audio_url || '',
          image_url: segment.image_url || '',
          is_end: segment.is_end || false,
          choices: segment.choices || [],
          isEnd: segment.is_end || false,
          image_generation_status: segment.image_generation_status || 'not_started',
          audio_generation_status: segment.audio_generation_status || 'not_started',
          word_count: segment.word_count || segment.segment_text?.split(/\s+/).length || 0,
          audio_duration: segment.audio_duration || 0,
          triggering_choice_text: segment.triggering_choice_text || ''
        }));
        
        setAllStorySegments(enhancedSegments);
        setCurrentStorySegment(enhancedSegments[enhancedSegments.length - 1]);
        // Set proper segment count (segments.length, not segments.length - 1)
        setSegmentCount(enhancedSegments.length);
        
        // Determine view mode based on story completion status
        const isCompleted = story?.is_completed || enhancedSegments.some(s => s.isEnd);
        const viewMode = isCompleted ? 'player' : 'create';
        setViewMode(viewMode);
        
        console.log('📖 Successfully loaded existing story with', enhancedSegments.length, 'segments, viewMode:', viewMode, 'isCompleted:', isCompleted);
        return true;
      }
      
      console.log('📖 No existing segments found for story:', id);
      return false;
    } catch (error) {
      console.error('Error loading existing story:', error);
      toast.error('Failed to load story');
      return false;
    }
  }, []);

  return { loadExistingStory };
};
