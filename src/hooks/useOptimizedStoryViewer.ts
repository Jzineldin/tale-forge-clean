
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStoryData } from '@/hooks/useStoryDisplay/useStoryData';
import { supabase } from '@/integrations/supabase/client';
import { secureConsole } from '@/utils/secureLogger';

export const useOptimizedStoryViewer = () => {
    const { storyId } = useParams<{ storyId: string }>();
    const { storyData, refreshStoryData } = useStoryData(storyId);
    const [segments, setSegments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch story segments
    useEffect(() => {
        const fetchSegments = async () => {
            if (!storyId) {
                setError('No story ID provided');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                console.log('📚 Fetching story segments for:', storyId);

                const { data: segmentsData, error: segmentsError } = await supabase
                    .from('story_segments')
                    .select('*')
                    .eq('story_id', storyId)
                    .order('created_at', { ascending: true });

                if (segmentsError) {
                    console.error('Error fetching segments:', segmentsError);
                    setError('Failed to load story segments');
                    return;
                }

                setSegments(segmentsData || []);
                setError(null);
            } catch (err) {
                console.error('Error in fetchSegments:', err);
                setError('Failed to load story');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSegments();
    }, [storyId]);

    // Fetch story data
    useEffect(() => {
        const fetchStoryData = async () => {
            if (!storyId) return;

            try {
                await refreshStoryData();
            } catch (err) {
                console.error('Error fetching story data:', err);
                setError('Failed to load story data');
            }
        };

        fetchStoryData();
    }, [storyId, refreshStoryData]);

    secureConsole.debug('[OptimizedStoryViewer] Current story data:', {
        hasStory: !!storyData,
        segmentsCount: segments.length,
        segments: segments.map((s: any) => ({
            id: s.id,
            hasImage: !!s.image_url,
            status: s.image_generation_status,
            imageUrl: s.image_url,
            isPlaceholder: s.image_url === '/placeholder.svg'
        }))
    });

    // Validate segment data integrity
    segments.forEach((segment: any, index: number) => {
        if (!segment.image_url || segment.image_url === '/placeholder.svg') {
            secureConsole.warn(`[OptimizedStoryViewer] Segment ${index} (${segment.id}) has no valid image:`, {
                image_url: segment.image_url,
                image_generation_status: segment.image_generation_status
            });
        }
    });

    // Mock realtime status for now
    const realtimeStatus = 'SUBSCRIBED';
    const connectionHealth = 'healthy';

    // Story actions
    const lastSegment = segments[segments.length - 1] || null;
    const canContinue = !storyData?.is_completed && lastSegment && lastSegment.choices && lastSegment.choices.length > 0;
    const handleSelectChoice = () => {
        // TODO: Implement choice selection
        console.log('Choice selected - TODO: implement');
    };
    const handlePublish = () => {
        // TODO: Implement publish
        console.log('Publish clicked - TODO: implement');
    };
    const handleManualRefresh = () => {
        refreshStoryData();
    };
    const mutation = { isPending: false };
    const publishMutation = { isPending: false };
    const refetchStory = refreshStoryData;

    secureConsole.debug('[OptimizedStoryViewer] Story state analysis:', {
        hasStory: !!storyData,
        segmentsCount: segments.length,
        isCompleted: storyData?.is_completed,
        isPublic: storyData?.is_public,
        canContinue,
        realtimeStatus,
        isLoading,
        error
    });

    return {
        story: storyData,
        isLoading,
        error,
        segments,
        lastSegment,
        canContinue,
        handleSelectChoice,
        handlePublish,
        handleManualRefresh,
        mutation,
        publishMutation,
        realtimeStatus,
        connectionHealth,
        refetchStory
    };
};
