
import { useRef, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const usePollingManager = (storyId: string | undefined) => {
    const queryClient = useQueryClient();
    const pollingInterval = useRef<number | null>(null);
    const fallbackPollingInterval = useRef<number | null>(null);
    const lastUpdateTime = useRef<number>(Date.now());
    const isActiveGeneration = useRef<boolean>(false);
    const isFallbackMode = useRef<boolean>(false);

    const forceRefresh = useCallback(() => {
        console.log('🔄 Force refreshing story data (immediate fetch)...');
        console.log('🔄 This will bypass cache and fetch fresh data from server');
        lastUpdateTime.current = Date.now();
        queryClient.invalidateQueries({ queryKey: ['story', storyId] });
        queryClient.refetchQueries({ queryKey: ['story', storyId] });
    }, [queryClient, storyId]);

    const startPolling = useCallback((interval: number = 15000) => { // Increased to 15 seconds
        if (pollingInterval.current || !isActiveGeneration.current) {
            console.log('⏭️ Skipping polling start - already polling or no active generation');
            return;
        }
        console.log(`🔄 Starting conservative polling (${interval}ms interval)...`);
        
        pollingInterval.current = window.setInterval(() => {
            const timeSinceUpdate = Date.now() - lastUpdateTime.current;
            
            // Only poll if we haven't had updates recently AND there's active generation
            if (timeSinceUpdate < 10000 || !isActiveGeneration.current) {
                console.log('⏭️ Skipping poll - recent update or no active generation');
                return;
            }
            
            console.log('📡 Polling for story updates...');
            queryClient.invalidateQueries({ queryKey: ['story', storyId] });
        }, interval);
    }, [queryClient, storyId]);

    const startFallbackPolling = useCallback(() => {
        if (fallbackPollingInterval.current) {
            return; // Already polling
        }
        
        console.log('🚨 Starting aggressive fallback polling (every 3 seconds)');
        isFallbackMode.current = true;
        
        // Immediate check then start interval
        queryClient.invalidateQueries({ queryKey: ['story', storyId] });
        queryClient.refetchQueries({ queryKey: ['story', storyId] });
        
        fallbackPollingInterval.current = window.setInterval(() => {
            queryClient.invalidateQueries({ queryKey: ['story', storyId] });
            queryClient.refetchQueries({ queryKey: ['story', storyId] });
        }, 3000);
    }, [queryClient, storyId]);

    const stopFallbackPolling = useCallback(() => {
        if (fallbackPollingInterval.current) {
            console.log('✅ Stopping fallback polling');
            clearInterval(fallbackPollingInterval.current);
            fallbackPollingInterval.current = null;
            isFallbackMode.current = false;
        }
    }, []);

    const stopPolling = useCallback(() => {
        if (pollingInterval.current) {
            console.log('✅ Stopping polling');
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
        stopFallbackPolling();
        isActiveGeneration.current = false;
    }, [stopFallbackPolling]);

    const updateLastUpdateTime = useCallback(() => {
        lastUpdateTime.current = Date.now();
        // If we got a real-time update, we can stop fallback polling
        if (isFallbackMode.current) {
            console.log('✅ Real-time working - stopping fallback polling');
            stopFallbackPolling();
        }
    }, [stopFallbackPolling]);

    const setActiveGeneration = useCallback((active: boolean) => {
        isActiveGeneration.current = active;
        console.log(`📊 Generation status changed: ${active ? 'active' : 'inactive'}`);
        
        if (!active) {
            // Stop polling when generation is complete
            stopPolling();
        }
    }, [stopPolling]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    return {
        startPolling,
        stopPolling,
        startFallbackPolling,
        stopFallbackPolling,
        forceRefresh,
        updateLastUpdateTime,
        setActiveGeneration,
        isPolling: !!pollingInterval.current,
        isFallbackPolling: !!fallbackPollingInterval.current
    };
};
