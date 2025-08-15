
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Story } from '@/types/stories';

const fetchAnonymousStories = async (storyIds: string[]) => {
  if (!storyIds || storyIds.length === 0) {
    return [];
  }

  // Get stories data
  const { data: stories, error } = await supabase
    .from('stories')
    .select('id, title, created_at, is_public, is_completed, thumbnail_url, segment_count, story_mode, full_story_audio_url, audio_generation_status, shotstack_status, shotstack_video_url, description')
    .in('id', storyIds)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!stories || stories.length === 0) {
    return [];
  }

  // Get latest images for all stories in a single query (fixes potential N+1)
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

  // Combine stories with their images
  const storiesWithImages = stories.map(story => ({
    ...story,
    cover_image_url: imageMap.get(story.id) || null
  }));

  return storiesWithImages as Story[];
};

export const useAnonymousStories = (authLoading: boolean, user: any) => {
  const queryClient = useQueryClient();
  const [anonymousStoryIds, setAnonymousStoryIds] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      try {
        const storedIds = JSON.parse(localStorage.getItem('anonymous_story_ids') || '[]');
        setAnonymousStoryIds(storedIds);
      } catch (e) {
        console.error("Failed to load anonymous stories from local storage", e);
        setAnonymousStoryIds([]);
      }
    }
  }, [user, authLoading]);

  const { data: stories, isLoading, error } = useQuery({
    queryKey: ['stories', anonymousStoryIds.join(',')],
    queryFn: async () => await fetchAnonymousStories(anonymousStoryIds),
    enabled: !authLoading && !user && anonymousStoryIds.length > 0,
  });

  const handleRefresh = () => {
    try {
      const storedIds = JSON.parse(localStorage.getItem('anonymous_story_ids') || '[]');
      setAnonymousStoryIds(storedIds);
      queryClient.invalidateQueries({ queryKey: ['stories', storedIds.join(',')] });
    } catch (e) {
      console.error("Failed to refresh anonymous stories", e);
    }
  };

  const removeAnonymousStory = (storyId: string) => {
    const newIds = anonymousStoryIds.filter(id => id !== storyId);
    localStorage.setItem('anonymous_story_ids', JSON.stringify(newIds));
    setAnonymousStoryIds(newIds);
  };

  return {
    stories: stories || [],
    isLoading,
    error,
    anonymousStoryIds,
    handleRefresh,
    removeAnonymousStory,
  };
};
