
import { useState, useEffect, useCallback } from 'react';

export const useImageState = (
    imageUrl?: string,
    imageGenerationStatus?: string,
    segmentId?: string
) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [forceRefresh, setForceRefresh] = useState(0);
    const [lastImageUrl, setLastImageUrl] = useState<string>('');
    
    const validSegmentId = segmentId && segmentId !== 'fallback' ? segmentId : `temp-${Date.now()}`;
    
    // State logging available in development mode
    
    // Reset when URL changes or status becomes completed
    useEffect(() => {
        const cleanUrl = imageUrl?.split('?')[0] || '';
        const cleanLastUrl = lastImageUrl?.split('?')[0] || '';
        
        // Only reset if URL actually changed or if we have a completed status but image isn't loaded
        const shouldReset = cleanUrl !== cleanLastUrl || 
                           (imageGenerationStatus === 'completed' && !imageLoaded && !imageError);
        
        if (shouldReset) {
            console.log(`[useImageState ${validSegmentId}] 🔄 Resetting image state:`, {
                reason: cleanUrl !== cleanLastUrl ? 'URL changed' : 'completed status but not loaded',
                oldUrl: cleanLastUrl,
                newUrl: cleanUrl,
                imageGenerationStatus,
                imageLoaded,
                imageError
            });
            setImageLoaded(false);
            setImageError(false);
            setLastImageUrl(imageUrl || '');
            setForceRefresh(prev => prev + 1);
        }
    }, [validSegmentId, imageUrl, lastImageUrl, imageGenerationStatus, imageLoaded, imageError]);

    // Listen for custom refresh events
    useEffect(() => {
        const handleForceRefreshEvent = (event: CustomEvent) => {
            const eventSegmentId = event.detail?.segmentId;
            const eventImageUrl = event.detail?.imageUrl;
            const eventTimestamp = event.detail?.timestamp;
            
            if (eventSegmentId === validSegmentId || eventSegmentId === segmentId) {
                console.log(`[useImageState ${validSegmentId}] 🔄 Custom refresh event received`, {
                    eventImageUrl,
                    currentImageUrl: imageUrl,
                    timestamp: eventTimestamp,
                    willForceRefresh: true
                });
                
                // Force refresh and reset state
                setForceRefresh(prev => prev + 1);
                setImageLoaded(false);
                setImageError(false);
                
                // Update tracking if new URL provided
                if (eventImageUrl && eventImageUrl !== imageUrl) {
                    console.log(`[useImageState ${validSegmentId}] Updating lastImageUrl from event:`, {
                        from: lastImageUrl,
                        to: eventImageUrl
                    });
                    setLastImageUrl(eventImageUrl);
                }
            }
        };

        window.addEventListener('force-image-refresh', handleForceRefreshEvent as EventListener);
        
        return () => {
            window.removeEventListener('force-image-refresh', handleForceRefreshEvent as EventListener);
        };
    }, [validSegmentId, segmentId, imageUrl, lastImageUrl]);

    const handleImageLoad = useCallback(() => {
        console.log(`[useImageState ${validSegmentId}] ✅ Image loaded successfully`);
        setImageLoaded(true);
        setImageError(false);
    }, [validSegmentId]);

    const handleImageError = useCallback((_e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        console.error(`[useImageState ${validSegmentId}] ❌ Image failed to load:`, imageUrl);
        setImageError(true);
        setImageLoaded(false);
        
        // Auto-retry after error
        setTimeout(() => {
            console.log(`[useImageState ${validSegmentId}] Auto-retry after error`);
            setForceRefresh(prev => prev + 1);
            setImageError(false);
        }, 1000);
    }, [validSegmentId, imageUrl]);

    const handleForceRefresh = useCallback(() => {
        console.log(`[useImageState ${validSegmentId}] 🔄 Manual force refresh triggered`);
        setForceRefresh(prev => prev + 1);
        setImageLoaded(false);
        setImageError(false);
    }, [validSegmentId]);

    return {
        imageLoaded,
        imageError,
        forceRefresh,
        handleImageLoad,
        handleImageError,
        handleForceRefresh
    };
};
