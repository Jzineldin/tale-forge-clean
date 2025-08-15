import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface RealtimePayload {
  new: any;
  old: any;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

interface StorySegmentData {
  id: string;
  image_generation_status?: string;
  image_url?: string;
}

export const useRealtimeHandlers = (
    storyId: string,
    forceRefresh: () => void,
    updateLastUpdateTime: () => void
) => {
    const queryClient = useQueryClient();

    const handleRealtimeUpdate = useCallback((payload: RealtimePayload) => {
        console.log('[Realtime] Story segment update received:', {
            segmentId: (payload.new as StorySegmentData)?.id,
            eventType: payload.eventType,
            imageStatus: (payload.new as StorySegmentData)?.image_generation_status,
            hasImageUrl: !!(payload.new as StorySegmentData)?.image_url
        });

        // Update React Query cache immediately
        if (payload.eventType === 'UPDATE' && payload.new) {
            const segmentData = payload.new as StorySegmentData;
            
            // Update the story segments cache
            queryClient.setQueryData(['story', storyId], (oldData: any) => {
                if (!oldData?.story_segments) return oldData;
                
                return {
                    ...oldData,
                    story_segments: oldData.story_segments.map((segment: any) => 
                        segment.id === segmentData.id 
                            ? { ...segment, ...segmentData }
                            : segment
                    )
                };
            });

            console.log('[Realtime] Cache updated for segment:', segmentData.id);
        }

        // Update timestamp for polling management
        updateLastUpdateTime();

        // Single refresh for image completion - no more staggered refreshes
        if ((payload.new as StorySegmentData)?.image_generation_status === 'completed') {
            console.log('🖼️ Image generation completed - triggering single refresh');
            
            // Single immediate refresh
            queryClient.invalidateQueries({ queryKey: ['story', storyId] });
            forceRefresh();
        }
    }, [queryClient, storyId, forceRefresh, updateLastUpdateTime]);

    return {
        handleRealtimeUpdate
    };
};
