import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { Story } from '@/types/stories';

export interface SearchResult {
  stories: Story[];
  totalCount: number;
  isSearching: boolean;
  searchTerm: string;
}

export const useStorySearch = (
  stories: Story[] | undefined,
  debounceMs: number = 300
): SearchResult & {
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
} => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const searchResult = useMemo(() => {
    if (!stories) {
      return {
        stories: [],
        totalCount: 0,
        isSearching: false,
        searchTerm: debouncedSearchTerm
      };
    }

    // If no search term, return all stories
    if (!debouncedSearchTerm.trim()) {
      return {
        stories,
        totalCount: stories.length,
        isSearching: false,
        searchTerm: debouncedSearchTerm
      };
    }

    // Perform search
    const searchTermLower = debouncedSearchTerm.toLowerCase();
    const filteredStories = stories.filter(story => {
      // Search in title
      if (story.title?.toLowerCase().includes(searchTermLower)) {
        return true;
      }

      // Search in description
      if (story.description?.toLowerCase().includes(searchTermLower)) {
        return true;
      }

      // Search in story mode/genre
      if (story.story_mode?.toLowerCase().includes(searchTermLower)) {
        return true;
      }

      return false;
    });

    return {
      stories: filteredStories,
      totalCount: filteredStories.length,
      isSearching: searchTerm !== debouncedSearchTerm, // Still debouncing
      searchTerm: debouncedSearchTerm
    };
  }, [stories, debouncedSearchTerm, searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  return {
    ...searchResult,
    setSearchTerm,
    clearSearch
  };
};

// Advanced search hook with multiple criteria
export const useAdvancedStorySearch = (
  stories: Story[] | undefined,
  debounceMs: number = 300
) => {
  const [searchCriteria, setSearchCriteria] = useState({
    title: '',
    description: '',
    genre: '',
    minSegments: 0,
    maxSegments: Infinity,
    hasVoice: null as boolean | null,
    isCompleted: null as boolean | null,
    isPublic: null as boolean | null
  });

  const debouncedCriteria = useDebounce(searchCriteria, debounceMs);

  const searchResult = useMemo(() => {
    if (!stories) {
      return {
        stories: [],
        totalCount: 0,
        isSearching: false
      };
    }

    let filteredStories = [...stories];

    // Filter by title
    if (debouncedCriteria.title.trim()) {
      const titleTerm = debouncedCriteria.title.toLowerCase();
      filteredStories = filteredStories.filter(story =>
        story.title?.toLowerCase().includes(titleTerm)
      );
    }

    // Filter by description
    if (debouncedCriteria.description.trim()) {
      const descTerm = debouncedCriteria.description.toLowerCase();
      filteredStories = filteredStories.filter(story =>
        story.description?.toLowerCase().includes(descTerm)
      );
    }

    // Filter by genre
    if (debouncedCriteria.genre.trim()) {
      const genreTerm = debouncedCriteria.genre.toLowerCase();
      filteredStories = filteredStories.filter(story =>
        story.story_mode?.toLowerCase().includes(genreTerm)
      );
    }

    // Filter by segment count
    if (debouncedCriteria.minSegments > 0 || debouncedCriteria.maxSegments < Infinity) {
      filteredStories = filteredStories.filter(story =>
        story.segment_count >= debouncedCriteria.minSegments &&
        story.segment_count <= debouncedCriteria.maxSegments
      );
    }

    // Filter by voice availability
    if (debouncedCriteria.hasVoice !== null) {
      filteredStories = filteredStories.filter(story => {
        const hasVoice = story.audio_generation_status === 'completed' && 
                        story.full_story_audio_url;
        return hasVoice === debouncedCriteria.hasVoice;
      });
    }

    // Filter by completion status
    if (debouncedCriteria.isCompleted !== null) {
      filteredStories = filteredStories.filter(story =>
        story.is_completed === debouncedCriteria.isCompleted
      );
    }

    // Filter by public status
    if (debouncedCriteria.isPublic !== null) {
      filteredStories = filteredStories.filter(story =>
        story.is_public === debouncedCriteria.isPublic
      );
    }

    return {
      stories: filteredStories,
      totalCount: filteredStories.length,
      isSearching: JSON.stringify(searchCriteria) !== JSON.stringify(debouncedCriteria)
    };
  }, [stories, debouncedCriteria, searchCriteria]);

  const updateCriteria = (updates: Partial<typeof searchCriteria>) => {
    setSearchCriteria(prev => ({ ...prev, ...updates }));
  };

  const clearCriteria = () => {
    setSearchCriteria({
      title: '',
      description: '',
      genre: '',
      minSegments: 0,
      maxSegments: Infinity,
      hasVoice: null,
      isCompleted: null,
      isPublic: null
    });
  };

  return {
    ...searchResult,
    searchCriteria,
    updateCriteria,
    clearCriteria
  };
};