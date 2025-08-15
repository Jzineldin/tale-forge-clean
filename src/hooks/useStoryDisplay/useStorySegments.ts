import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StorySegment } from './types';
import { isProperUUID } from './utils';

export const useStorySegments = () => {
  const [currentStorySegment, setCurrentStorySegment] = useState<StorySegment | null>(null);
  const [allStorySegments, setAllStorySegments] = useState<StorySegment[]>([]);
  const [segmentCount, setSegmentCount] = useState(0);

  // Refetch story segments when switching modes to ensure data is fresh
  const refetchStorySegments = async (storyId: string, fetchStoryData: (id: string) => Promise<void>) => {
    // Only refetch for proper UUIDs
    if (!storyId || !isProperUUID(storyId)) return;
    
    console.log('🔄 Refetching story segments for mode switch...');
    try {
      const { data: segments, error } = await supabase
        .from('story_segments')
        .select('*')
        .eq('story_id', storyId)
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
        
        console.log('🔄 Refreshed segments:', enhancedSegments.map(s => ({ 
          id: s.id, 
          hasAudio: !!s.audio_url,
          audioStatus: s.audio_generation_status 
        })));
        
        // Context window capping: keep only last 2 segments (< 1 kB)
        const cappedSegments = enhancedSegments.slice(-2);
        console.log(`📏 Context window: ${enhancedSegments.length} total segments, keeping last ${cappedSegments.length}`);
        
        setAllStorySegments(cappedSegments);
        setCurrentStorySegment(enhancedSegments[enhancedSegments.length - 1]);
        setSegmentCount(enhancedSegments.length);
      }
      
      // Also refetch story data when refetching segments
      await fetchStoryData(storyId);
    } catch (error) {
      console.error('Error refetching story segments:', error);
    }
  };

  return {
    currentStorySegment,
    setCurrentStorySegment,
    allStorySegments,
    setAllStorySegments,
    segmentCount,
    setSegmentCount,
    refetchStorySegments,
  };
};