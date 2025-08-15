
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { realtime } from '@/utils/secureLogger';

interface StorySegmentRealtimePayload {
    new?: any;
    old?: any;
    eventType?: 'INSERT' | 'UPDATE' | 'DELETE';
}

export const useRealtimeHandlers = (
    storyId: string,
    forceRefresh: () => void,
    updateLastUpdateTime: () => void
) => {
    const queryClient = useQueryClient();

    const handleRealtimeUpdate = useCallback((payload: StorySegmentRealtimePayload) => {
        console.log('[Realtime] Processing segment update:', {
            segmentId: payload.new?.id,
            imageStatus: payload.new?.image_generation_status,
            hasImageUrl: !!payload.new?.image_url
        });

        // Update React Query cache immediately
        if (payload.eventType === 'UPDATE' && payload.new) {
            queryClient.setQueryData(['story', storyId], (oldData: any) => {
                if (!oldData?.story_segments) return oldData;
                
                return {
                    ...oldData,
                    story_segments: oldData.story_segments.map((segment: any) => 
                        segment.id === payload.new?.id 
                            ? { ...segment, ...payload.new }
                            : segment
                    )
                };
            });

            console.log('[Realtime] Cache updated for segment:', payload.new?.id);
        }

        // Update timestamp for polling management
        updateLastUpdateTime();

        // Single refresh for image completion - no more aggressive loops
        if (payload.new?.image_generation_status === 'completed') {
            realtime('Image generation completed - single refresh');
            
            // Single immediate refresh only
            queryClient.invalidateQueries({ queryKey: ['story', storyId] });
            forceRefresh();
        }
    }, [queryClient, storyId, forceRefresh, updateLastUpdateTime]);

    return {
        handleRealtimeUpdate
    };
};
