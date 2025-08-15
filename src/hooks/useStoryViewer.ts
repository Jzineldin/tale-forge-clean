
import { useStoryData } from '@/hooks/useStoryDisplay/useStoryData';

export const useStoryViewer = () => {
    const { storyData, refreshStoryData } = useStoryData();
    
    // Mock realtime for now
    const realtimeStatus = 'SUBSCRIBED';
    const connectionHealth = 'healthy';
    
    // Mock story actions
    const segments: any[] = [];
    const lastSegment = segments[segments.length - 1] || null;
    const canContinue = true;
    const handleSelectChoice = () => {};
    const handlePublish = () => {};
    const handleGoBack = () => {};
    const handleManualRefresh = () => {};
    const mutation = { isPending: false };
    const publishMutation = { isPending: false };
    const goBackMutation = { isPending: false };

    console.log('useStoryViewer: Story state analysis:', {
        hasStory: !!storyData,
        segmentsCount: segments.length,
        isCompleted: storyData?.is_completed,
        isPublic: storyData?.is_public,
        canContinue,
        realtimeStatus,
        connectionHealth
    });

    return {
        story: storyData,
        isLoading: false,
        error: null,
        segments,
        lastSegment,
        canContinue,
        handleSelectChoice,
        handlePublish,
        handleGoBack,
        handleManualRefresh,
        mutation,
        publishMutation,
        goBackMutation,
        realtimeStatus,
        connectionHealth,
        refetchStory: refreshStoryData,
    };
};
