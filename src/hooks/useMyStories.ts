import { useEffect, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { Story } from '@/types/stories';
import { useToast } from '@/hooks/use-toast';
import { debug } from '@/utils/secureLogger';

const fetchUserStories = async (userId: string) => {
  // Use optimized single query to get stories with images - fixes N+1 problem
  try {
    // First try the optimized database function if it exists
    const { data: storiesWithImages, error: rpcError } = await supabase
      .rpc('get_user_stories_with_images', { user_id: userId });

    if (!rpcError && storiesWithImages) {
      return storiesWithImages.map(story => ({
        ...story,
        cover_image_url: story.latest_generated_image
      })) as Story[];
    }
  } catch (error) {
    // Fallback to optimized query if RPC function fails
  }

  // Fallback: Use a single optimized query with JOIN instead of N+1 queries
  const { data: stories, error } = await supabase
    .from('stories')
    .select(`
      id, title, created_at, is_public, is_completed, thumbnail_url,
      segment_count, story_mode, full_story_audio_url, audio_generation_status,
      shotstack_status, shotstack_video_url, updated_at, description
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!stories || stories.length === 0) {
    return [];
  }

  // Get all story IDs for a single batch query
  const storyIds = stories.map(story => story.id);

  // Single query to get latest images for ALL stories at once
  const { data: latestImages } = await supabase
    .from('story_segments')
    .select('story_id, image_url, created_at')
    .in('story_id', storyIds)
    .not('image_url', 'is', null)
    .neq('image_url', '/placeholder.svg')
    .eq('image_generation_status', 'completed')
    .order('created_at', { ascending: false });

  // Create a map of story_id -> latest image for O(1) lookup
  const imageMap = new Map<string, string>();
  if (latestImages) {
    for (const image of latestImages) {
      if (!imageMap.has(image.story_id)) {
        imageMap.set(image.story_id, image.image_url);
      }
    }
  }

  // Combine stories with their images in O(n) time
  const storiesWithImages = stories.map(story => ({
    ...story,
    cover_image_url: imageMap.get(story.id) || null
  }));

  return storiesWithImages as Story[];
};

export const useMyStories = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);
  const pollingInterval = useRef<number | null>(null);

  const { data: stories, isLoading, error, refetch } = useQuery({
    queryKey: ['stories', user?.id || ''],
    queryFn: async () => {
      if (user) {
        return await fetchUserStories(user.id);
      }
      return Promise.resolve([]);
    },
    enabled: !authLoading && !!user,
  });

  const handleRefresh = () => {
    if (user) {
      refetch();
    }
  };

  useEffect(() => {
    if (!user) return;

    const startPolling = () => {
        if (pollingInterval.current) return;
        pollingInterval.current = window.setInterval(() => {
            debug('Polling for stories list updates', { userId: user.id });
            queryClient.invalidateQueries({ queryKey: ['stories', user.id] });
        }, 15000);
    };

    const stopPolling = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
    };

    const channel = supabase
      .channel(`my-stories-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stories',
          filter: `user_id=eq.${user.id}`,
        },
        (_payload) => {
          queryClient.invalidateQueries({ queryKey: ['stories', user.id] });
        }
      )
      .subscribe((status) => {
        const isConnected = status === 'SUBSCRIBED';
        setIsRealtimeConnected(isConnected);

        if (isConnected) {
            stopPolling();
        } else if (status !== 'CLOSED') {
            if (!pollingInterval.current) {
                toast({
                    title: "Live updates paused",
                    description: "Connection issue detected. Checking for updates periodically.",
                    variant: "default",
                    duration: 5000,
                });
            }
            startPolling();
        }
      });

    return () => {
      stopPolling();
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast]);

  return {
    stories,
    isLoading,
    error,
    authLoading,
    isRealtimeConnected,
    handleRefresh,
  };
};