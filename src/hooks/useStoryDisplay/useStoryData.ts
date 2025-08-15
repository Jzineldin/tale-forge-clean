import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isProperUUID, isValidUUID } from './utils';

export interface StoryData {
  id: string;
  title: string | null;
  full_story_audio_url: string | null;
  audio_generation_status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  is_public: boolean;
  is_completed: boolean;
  story_segments: any[];
  created_at: string;
  story_mode: string | null;
  thumbnail_url: string | null;
  segment_count: number;
}

export const useStoryData = (storyId?: string) => {
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const location = useLocation();

  // Fetch story data on mount and when storyId changes
  useEffect(() => {
    if (storyId) {
      fetchStoryData(storyId);
    }
  }, [storyId]);

  // Fetch story data including full audio URL
  const fetchStoryData = async (id: string) => {
    // Only query database for proper UUIDs
    if (!isProperUUID(id)) {
      console.log('Skipping database query for custom story ID:', id);
      return;
    }
    
    try {
      console.log('📚 Fetching story data for:', id);
      const { data: story, error } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          full_story_audio_url,
          audio_generation_status,
          is_public,
          is_completed,
          story_mode,
          thumbnail_url,
          created_at,
          story_segments(count)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching story data:', error);
        return;
      }

      if (!story) {
        console.log('📚 Story not found:', id);
        setStoryData(null);
        return;
      }

      if (story) {
        console.log('📚 Story data loaded:', { 
          id: story.id, 
          hasAudio: !!story.full_story_audio_url,
          audioStatus: story.audio_generation_status 
        });
        
        // Pipeline verification: Check story data matches URL parameters
        // TODO: Add verification once target_age column is available in database
        const urlParams = new URLSearchParams(location.search);
        const urlAge = urlParams.get('age');
        const urlGenre = urlParams.get('genre');
        
        console.log('🔍 Pipeline verification - URL params:', { urlAge, urlGenre });
        
        setStoryData({
          id: story.id,
          title: story.title,
          full_story_audio_url: story.full_story_audio_url,
          audio_generation_status: (story.audio_generation_status as 'not_started' | 'in_progress' | 'completed' | 'failed') || 'not_started',
          is_public: story.is_public ?? false,
          is_completed: story.is_completed ?? false,
          story_segments: [],
          created_at: story.created_at || new Date().toISOString(),
          story_mode: story.story_mode,
          thumbnail_url: story.thumbnail_url,
          segment_count: (story as any).story_segments?.[0]?.count || 0
        });
      }
    } catch (error) {
      console.error('Error fetching story data:', error);
    }
  };

  // Add refresh function for audio generation callbacks
  const refreshStoryData = async () => {
    if (!storyId || !isValidUUID(storyId)) return;
    
    console.log('🔄 Refreshing story data after audio generation...');
    await fetchStoryData(storyId);
  };

  // Set up real-time subscription for story updates
  useEffect(() => {
    // Only set up subscription for proper UUIDs
    if (!storyId || !isProperUUID(storyId)) return;

    console.log('🔔 Setting up real-time subscription for story:', storyId);
    
    const subscription = supabase
      .channel(`story-updates-${storyId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stories',
          filter: `id=eq.${storyId}`
        },
        (payload) => {
          console.log('🔔 Real-time story update received:', {
            storyId: storyId,
            audioStatus: payload.new?.audio_generation_status,
            audioUrl: payload.new?.full_story_audio_url ? 'Present' : 'Missing',
            timestamp: new Date().toISOString()
          });
          
          // Update story data with new audio information
          if (payload.new) {
            setStoryData(prev => {
              if (!prev) return null;
              return {
                ...prev,
                id: payload.new.id,
                title: payload.new.title || prev.title,
                full_story_audio_url: payload.new.full_story_audio_url,
                audio_generation_status: payload.new.audio_generation_status,
                is_public: payload.new.is_public ?? prev.is_public,
                is_completed: payload.new.is_completed ?? prev.is_completed,
                story_segments: prev.story_segments,
                created_at: prev.created_at,
                story_mode: prev.story_mode,
                thumbnail_url: prev.thumbnail_url,
                segment_count: prev.segment_count
              };
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up real-time subscription for story:', storyId);
      supabase.removeChannel(subscription);
    };
  }, [storyId]);

  return {
    storyData,
    setStoryData,
    fetchStoryData,
    refreshStoryData,
  };
};