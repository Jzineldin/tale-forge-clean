
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseStoryRealtimeWithPollingProps {
    storyId: string;
    segments: Array<{
        id: string;
        image_url?: string;
        image_generation_status?: string;
    }>;
}

export const useStoryRealtimeWithPolling = ({ 
    storyId, 
    segments 
}: UseStoryRealtimeWithPollingProps) => {
    const queryClient = useQueryClient();
    const [realtimeStatus, setRealtimeStatus] = useState<string>('disconnected');
    const pollingIntervalRef = useRef<number | null>(null);
    const channelRef = useRef<any>(null);

    // Check if any segments are still generating (more conservative check)
    const hasGeneratingSegments = segments.some(segment => {
        const isGenerating = segment.image_generation_status === 'pending' || 
                           segment.image_generation_status === 'in_progress' ||
                           (!segment.image_url && segment.image_generation_status !== 'failed');
        
        if (isGenerating) {
            console.log('[Realtime] Segment still generating:', {
                id: segment.id,
                image_url: segment.image_url ? 'present' : 'missing',
                status: segment.image_generation_status
            });
        }
        
        return isGenerating;
    });

    console.log('[Realtime] Generation status check:', {
        totalSegments: segments.length,
        hasGeneratingSegments,
        segmentStatuses: segments.map(s => ({
            id: s.id,
            hasImage: !!s.image_url,
            status: s.image_generation_status
        }))
    });

    const startPolling = () => {
        if (pollingIntervalRef.current || !hasGeneratingSegments) {
            console.log('[Realtime] Skipping polling start - already polling or no generating segments');
            return;
        }
        
        console.log('[Realtime] Starting conservative polling for story:', storyId);
        pollingIntervalRef.current = window.setInterval(() => {
            console.log('[Realtime] Polling for updates...');
            queryClient.invalidateQueries({ queryKey: ['story', storyId] });
        }, 10000); // Increased to 10 seconds to be less aggressive
    };

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            console.log('[Realtime] Stopping polling');
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

    // Set up real-time subscription
    useEffect(() => {
        if (!storyId) return;

        console.log('[Realtime] Setting up real-time subscription for story:', storyId);
        
        const channel = supabase
            .channel(`story-segments-${storyId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'story_segments',
                    filter: `story_id=eq.${storyId}`
                },
                (payload) => {
                    console.log('[Realtime] Received segment update:', {
                        segmentId: payload.new?.id,
                        imageStatus: payload.new?.image_generation_status,
                        hasImageUrl: !!payload.new?.image_url
                    });

                    // Update cache immediately and trigger re-render
                    queryClient.setQueryData(['story', storyId], (oldData: any) => {
                        if (!oldData?.story_segments) return oldData;
                        
                        const updatedData = {
                            ...oldData,
                            story_segments: oldData.story_segments.map((segment: any) => 
                                segment.id === payload.new?.id 
                                    ? { ...segment, ...payload.new }
                                    : segment
                            )
                        };
                        
                        console.log('[Realtime] Updated cache with new image data:', {
                            segmentId: payload.new?.id,
                            oldImageUrl: oldData.story_segments.find((s: any) => s.id === payload.new?.id)?.image_url,
                            newImageUrl: payload.new?.image_url,
                            oldStatus: oldData.story_segments.find((s: any) => s.id === payload.new?.id)?.image_generation_status,
                            newStatus: payload.new?.image_generation_status
                        });
                        
                        return updatedData;
                    });

                    // Force a re-fetch to ensure we have the latest data
                    setTimeout(() => {
                        queryClient.invalidateQueries({ queryKey: ['story', storyId] });
                    }, 100);
                    
                    setRealtimeStatus('connected');
                }
            )
            .subscribe((status) => {
                console.log('[Realtime] Subscription status:', status);
                setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
                
                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.warn('[Realtime] Subscription failed, starting polling fallback');
                    startPolling();
                } else if (status === 'SUBSCRIBED') {
                    console.log('[Realtime] Subscription active, stopping polling');
                    stopPolling();
                }
            });

        channelRef.current = channel;
        
        // Start polling if subscription fails initially
        const pollingSafetyTimeout = setTimeout(() => {
            if (realtimeStatus !== 'connected' && hasGeneratingSegments) {
                console.log('[Realtime] Safety timeout - starting polling as subscription fallback');
                startPolling();
            }
        }, 5000);

        return () => {
            console.log('[Realtime] Cleaning up subscription');
            clearTimeout(pollingSafetyTimeout);
            stopPolling();
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [storyId]);

    // Stop polling when no segments are generating
    useEffect(() => {
        if (!hasGeneratingSegments) {
            console.log('[Realtime] No more generating segments, stopping polling');
            stopPolling();
        }
    }, [hasGeneratingSegments]);

    return {
        realtimeStatus,
        isPolling: !!pollingIntervalRef.current
    };
};
