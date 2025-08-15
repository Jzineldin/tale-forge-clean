import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StorySegment } from './useStoryState';

interface UseInlineStoryRealtimeProps {
  currentSegment: StorySegment | null;
  setCurrentSegment: (segment: StorySegment | null) => void;
  setStoryHistory: (history: StorySegment[] | ((prev: StorySegment[]) => StorySegment[])) => void;
}

export const useInlineStoryRealtime = ({
  currentSegment,
  setCurrentSegment,
  setStoryHistory
}: UseInlineStoryRealtimeProps) => {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!currentSegment?.storyId) return;

    console.log('[InlineRealtime] Setting up subscription for story:', currentSegment.storyId);

    const channel = supabase
      .channel(`inline-story-${currentSegment.storyId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'story_segments',
          filter: `story_id=eq.${currentSegment.storyId}`
        },
        (payload) => {
          console.log('[InlineRealtime] Received segment update:', payload);
          
          const updatedSegment = payload.new;
          if (!updatedSegment || updatedSegment.id !== currentSegment.segmentId) {
            console.log('[InlineRealtime] Ignoring update - not current segment');
            return;
          }

          console.log('[InlineRealtime] Updating current segment with new data:', {
            segmentId: updatedSegment.id,
            imageUrl: updatedSegment.image_url ? 'present' : 'missing',
            status: updatedSegment.image_generation_status,
            text: updatedSegment.segment_text ? 'present' : 'missing'
          });

          // Update current segment with new data
          const updatedSegmentData: StorySegment = {
            ...currentSegment,
            text: updatedSegment.segment_text || currentSegment.text,
            imageUrl: updatedSegment.image_url || currentSegment.imageUrl,
            imageGenerationStatus: updatedSegment.image_generation_status || currentSegment.imageGenerationStatus,
            choices: updatedSegment.choices || currentSegment.choices,
            isEnd: updatedSegment.is_end !== undefined ? updatedSegment.is_end : currentSegment.isEnd
          };

          setCurrentSegment(updatedSegmentData);
          
          // Also update the segment in history
          setStoryHistory(prev => 
            prev.map(segment => 
              segment.segmentId === updatedSegment.id 
                ? updatedSegmentData 
                : segment
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('[InlineRealtime] Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('[InlineRealtime] Cleaning up subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentSegment?.storyId, currentSegment?.segmentId]);

  return {
    isSubscribed: channelRef.current !== null
  };
};