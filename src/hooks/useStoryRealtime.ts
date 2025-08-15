
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { StorySegmentRow } from '@/types/stories';
import { usePollingManager } from './realtime/usePollingManager';
import { useTabVisibility } from './realtime/useTabVisibility';
import { useConnectionHealth } from './realtime/useConnectionHealth';

const SEGMENTS_KEY = (storyId: string) => ['segments', storyId];

export const useStoryRealtime = (storyId: string | undefined) => {
    const queryClient = useQueryClient();
    const [realtimeStatus, setRealtimeStatus] = useState<string | null>(null);
    
    const {
        startPolling,
        stopPolling,
        forceRefresh,
        updateLastUpdateTime
    } = usePollingManager(storyId);

    const {
        connectionHealth,
        setHealthy,
        setDegraded: _setDegraded,
        setFailed,
        incrementReconnectAttempts,
        hasMaxReconnectAttemptsReached,
        maxReconnectAttempts
    } = useConnectionHealth();

    const { isActiveTab } = useTabVisibility((isActive) => {
        const interval = isActive ? 2000 : 10000;
        startPolling(interval);
    });

    function handleUpdate(payload: any) {
        const seg = payload.new as StorySegmentRow;
        
        // write the new row into the list cache
        queryClient.setQueryData<StorySegmentRow[]>(
            SEGMENTS_KEY(seg.story_id),
            old =>
                old?.map(s => (s.id === seg.id ? { ...s, ...seg } : s)) ?? [seg],
        );

        // also update any detail cache
        queryClient.setQueryData(['segment', seg.id], seg);

        // ensure components refetch if they don't listen to setQueryData
        queryClient.invalidateQueries({ queryKey: SEGMENTS_KEY(seg.story_id) });
        
        updateLastUpdateTime();
        forceRefresh();
    }

    useEffect(() => {
        if (!storyId) return;

        console.log(`🚀 Setting up realtime subscription for story: ${storyId}`);
        
        // subscribe WITHOUT story_id filter until confirmed working
        const channel = supabase
            .channel('story_segments-all')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'story_segments' },
                handleUpdate,
            )
            .subscribe(status => {
                console.log('[Realtime] status', status);
                setRealtimeStatus(status);
                
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Realtime connected successfully');
                    stopPolling();
                    setHealthy();
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.log('❌ Realtime connection failed, starting intelligent polling');
                    setFailed();
                    
                    if (!hasMaxReconnectAttemptsReached()) {
                        const attempts = incrementReconnectAttempts();
                        console.log(`🔄 Attempting reconnect ${attempts}/${maxReconnectAttempts}`);
                        setTimeout(() => {
                            supabase.removeChannel(channel);
                        }, 1000 * attempts);
                    } else {
                        console.log('❌ Max reconnect attempts reached, using intelligent polling');
                        startPolling(isActiveTab.current ? 2000 : 10000);
                    }
                } else if (status === 'CLOSED' || status === 'UNSUBSCRIBED') {
                    console.log('❌ Realtime connection closed, fallback to intelligent polling');
                    setFailed();
                    startPolling(isActiveTab.current ? 2000 : 10000);
                }
            });

        return () => {
            console.log(`🧹 Cleaning up realtime subscription for ${storyId}`);
            stopPolling();
            supabase.removeChannel(channel);
        };
    }, [storyId, startPolling, stopPolling, setHealthy, setFailed, incrementReconnectAttempts, hasMaxReconnectAttemptsReached, maxReconnectAttempts, isActiveTab, queryClient, forceRefresh, updateLastUpdateTime]);

    return {
        realtimeStatus,
        connectionHealth
    };
};
