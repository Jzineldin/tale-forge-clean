
import { useMemo, useState } from 'react';
import { Story } from '@/types/stories';
import { SortOption } from '@/components/shared/story-filter/types';

export const useStorySorting = (
  stories: Story[] | undefined,
  sortBy: SortOption = 'newest'
) => {
  const sortedStories = useMemo(() => {
    if (!stories) return [];

    return [...stories].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'newest':
          // Sort by created_at or published_at, newest first
          const aDate = new Date(a.published_at || a.created_at).getTime();
          const bDate = new Date(b.published_at || b.created_at).getTime();
          comparison = bDate - aDate;
          break;
          
        case 'oldest':
          // Sort by created_at or published_at, oldest first
          const aDateOld = new Date(a.published_at || a.created_at).getTime();
          const bDateOld = new Date(b.published_at || b.created_at).getTime();
          comparison = aDateOld - bDateOld;
          break;
          
        case 'title-asc':
          comparison = (a.title || 'Untitled').localeCompare(b.title || 'Untitled');
          break;
          
        case 'title-desc':
          comparison = (b.title || 'Untitled').localeCompare(a.title || 'Untitled');
          break;
          
        case 'length':
          // Sort by segment count, longest first
          comparison = b.segment_count - a.segment_count;
          break;
          
        case 'completion':
          // Sort by completion status (completed first), then by creation date
          if (a.is_completed !== b.is_completed) {
            comparison = a.is_completed ? -1 : 1;
          } else {
            const aCompDate = new Date(a.created_at).getTime();
            const bCompDate = new Date(b.created_at).getTime();
            comparison = bCompDate - aCompDate;
          }
          break;
          
        case 'popularity':
          // For now, use segment count as a proxy for popularity
          // In the future, this could be based on likes, views, etc.
          comparison = b.segment_count - a.segment_count;
          break;
          
        case 'recent-activity':
          // Sort by most recent activity (published_at or created_at)
          const aActivity = new Date(a.published_at || a.created_at).getTime();
          const bActivity = new Date(b.published_at || b.created_at).getTime();
          comparison = bActivity - aActivity;
          break;
          
        default:
          // Default to newest first
          const aDefault = new Date(a.created_at).getTime();
          const bDefault = new Date(b.created_at).getTime();
          comparison = bDefault - aDefault;
      }

      return comparison;
    });
  }, [stories, sortBy]);

  return {
    sortedStories,
    sortBy
  };
};

// Legacy hook for backward compatibility
export const useLegacyStorySorting = (stories: Story[] | undefined) => {
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'title' | 'length' | 'status'>('latest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedStories = useMemo(() => {
    if (!stories) return [];

    return [...stories].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'latest':
        case 'oldest':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'title':
          comparison = (a.title || 'Untitled').localeCompare(b.title || 'Untitled');
          break;
        case 'length':
          comparison = a.segment_count - b.segment_count;
          break;
        case 'status':
          if (a.is_completed !== b.is_completed) {
            comparison = a.is_completed ? -1 : 1;
          } else if (a.is_public !== b.is_public) {
            comparison = a.is_public ? -1 : 1;
          } else {
            comparison = 0;
          }
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [stories, sortBy, sortOrder]);

  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
  };

  const handleOrderToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return {
    sortedStories,
    sortBy,
    sortOrder,
    handleSortChange,
    handleOrderToggle,
  };
};
