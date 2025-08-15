import { useMemo } from 'react';
import { Story } from '@/types/stories';
import { FilterState, FilteredStoriesResult } from '@/components/shared/story-filter/types';

export const useStoryFiltering = (
  stories: Story[] | undefined,
  filters: FilterState
): FilteredStoriesResult => {
  const filteredResult = useMemo(() => {
    if (!stories) {
      return {
        stories: [],
        totalCount: 0,
        hasActiveFilters: false
      };
    }

    // Check if any filters are active
    const hasActiveFilters = !!(
      filters.search ||
      filters.status !== 'all' ||
      filters.genre ||
      filters.voice !== 'all' ||
      (filters.visibility && filters.visibility !== 'all')
    );

    let filteredStories = [...stories];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredStories = filteredStories.filter(story => 
        (story.title?.toLowerCase().includes(searchTerm)) ||
        (story.description?.toLowerCase().includes(searchTerm))
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filteredStories = filteredStories.filter(story => {
        if (filters.status === 'completed') {
          return story.is_completed;
        } else if (filters.status === 'in-progress') {
          return !story.is_completed;
        }
        return true;
      });
    }

    // Apply genre filter
    if (filters.genre) {
      filteredStories = filteredStories.filter(story => 
        story.story_mode === filters.genre
      );
    }

    // Apply voice filter
    if (filters.voice !== 'all') {
      filteredStories = filteredStories.filter(story => {
        const hasVoice = story.audio_generation_status === 'completed' && 
                        story.full_story_audio_url;
        
        if (filters.voice === 'with-voice') {
          return hasVoice;
        } else if (filters.voice === 'without-voice') {
          return !hasVoice;
        }
        return true;
      });
    }

    // Apply visibility filter (for My Stories section)
    if (filters.visibility && filters.visibility !== 'all') {
      filteredStories = filteredStories.filter(story => {
        if (filters.visibility === 'public') {
          return story.is_public;
        } else if (filters.visibility === 'private') {
          return !story.is_public;
        }
        return true;
      });
    }

    return {
      stories: filteredStories,
      totalCount: filteredStories.length,
      hasActiveFilters
    };
  }, [stories, filters]);

  return filteredResult;
};

// Helper function to get default filter state
export const getDefaultFilterState = (section: 'my-stories' | 'discover'): FilterState => {
  const baseState = {
    search: '',
    status: 'all' as const,
    genre: '',
    voice: 'all' as const,
    sortBy: 'newest' as const
  };

  if (section === 'my-stories') {
    return {
      ...baseState,
      visibility: 'all' as const
    };
  }

  return baseState;
};

// Helper function to check if filters have any active values
export const hasActiveFilters = (filters: FilterState): boolean => {
  return !!(
    filters.search ||
    filters.status !== 'all' ||
    filters.genre ||
    filters.voice !== 'all' ||
    (filters.visibility && filters.visibility !== 'all')
  );
};

// Helper function to reset filters to default state
export const resetFilters = (section: 'my-stories' | 'discover'): FilterState => {
  return getDefaultFilterState(section);
};