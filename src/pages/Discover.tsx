import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Grid, List, BookOpen, User, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/shared/story-card';
import { StoryFilterBar } from '@/components/shared/story-filter';
import { useStoryFiltering, getDefaultFilterState } from '@/hooks/useStoryFiltering';
import { useStorySorting } from '@/hooks/useStorySorting';
import { FilterState, GenreOption, SortOptionConfig } from '@/components/shared/story-filter/types';
import { Story } from '@/types/stories';
import '../styles/story-filter.css';

interface PublicStory extends Story {
  like_count: number;
  comment_count: number;
  author_name: string;
  cover_image_url?: string; // Pre-fetched cover image to avoid N+1 queries
}

type ViewMode = 'grid' | 'list';

const DISCOVER_GENRES: GenreOption[] = [
  { value: 'bedtime-stories', label: 'Bedtime Stories', emoji: '🌙' },
  { value: 'fantasy-and-magic', label: 'Fantasy & Magic', emoji: '🧙‍♂️' },
  { value: 'adventure-and-exploration', label: 'Adventure & Exploration', emoji: '🗺️' },
  { value: 'mystery-and-detective', label: 'Mystery & Detective', emoji: '🔍' },
  { value: 'science-fiction-and-space', label: 'Science Fiction & Space', emoji: '🚀' },
  { value: 'educational-stories', label: 'Educational Stories', emoji: '📚' },
  { value: 'values-and-life-lessons', label: 'Values & Life Lessons', emoji: '💎' },
  { value: 'silly-and-humorous', label: 'Silly & Humorous Stories', emoji: '😄' }
];

const DISCOVER_SORT_OPTIONS: SortOptionConfig[] = [
  { value: 'newest', label: 'Newest First', section: 'common' },
  { value: 'oldest', label: 'Oldest First', section: 'common' },
  { value: 'popularity', label: 'Most Popular', section: 'discover' },
  { value: 'recent-activity', label: 'Recent Activity', section: 'discover' },
  { value: 'title-asc', label: 'Title A-Z', section: 'common' },
  { value: 'title-desc', label: 'Title Z-A', section: 'common' },
  { value: 'length', label: 'Longest First', section: 'common' }
];

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>(getDefaultFilterState('discover'));
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  
  const storiesPerPage = 12;

  // Fetch all public stories with their cover images in a single efficient query
  const { data: allStoriesData, isLoading, error } = useQuery({
    queryKey: ['public-stories-with-images'],
    queryFn: async () => {
      // Use the new database function to get stories with images in one query
      const { data, error } = await supabase.rpc('get_public_stories_with_images');

      if (error) {
        console.error('❌ Discover page query error:', error);
        throw error;
      }

      console.log('🔍 Discover page - Optimized stories query result:', {
        storiesFound: data?.length || 0,
        storiesWithImages: data?.filter((s: any) => s.latest_generated_image).length || 0
      });

      if (!data) return [];

      // Get likes and comments counts for all stories
      const storyIds = data.map((story: any) => story.id);
      
      const { data: likesData } = await supabase
        .from('story_likes')
        .select('story_id')
        .in('story_id', storyIds);

      const { data: commentsData } = await supabase
        .from('story_comments')
        .select('story_id')
        .in('story_id', storyIds);

      // Count likes and comments per story
      const likeCounts = likesData?.reduce((acc, like) => {
        if (like.story_id) {
          acc[like.story_id] = (acc[like.story_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const commentCounts = commentsData?.reduce((acc, comment) => {
        if (comment.story_id) {
          acc[comment.story_id] = (acc[comment.story_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      // Transform the data and include the cover image info
      const stories = data.map((story: any) => ({
        ...story,
        title: story.title || 'Untitled Story',
        description: story.description || '',
        author_name: story.user_id ? 'Story Creator' : 'Anonymous',
        like_count: likeCounts[story.id] || 0,
        comment_count: commentCounts[story.id] || 0,
        // Include the pre-fetched image URL to avoid N+1 queries
        cover_image_url: story.latest_generated_image
      })) as PublicStory[];

      return stories;
    }
  });

  // Apply filtering and sorting using our new hooks
  const filteredResult = useStoryFiltering(allStoriesData, filters);
  const { sortedStories } = useStorySorting(filteredResult.stories, filters.sortBy);

  // Cast back to PublicStory[] since we know these have the additional properties
  const publicSortedStories = sortedStories as PublicStory[];

  // Pagination
  const totalPages = Math.ceil(publicSortedStories.length / storiesPerPage);
  const startIndex = (currentPage - 1) * storiesPerPage;
  const endIndex = startIndex + storiesPerPage;
  const paginatedStories = publicSortedStories.slice(startIndex, endIndex);



  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Same beautiful background as landing page */}
      <div className="scene-bg"></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16">
          {/* Enhanced Page Header */}
          <div className="mb-12 pt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="fantasy-heading text-3xl md:text-4xl font-bold text-white mb-2" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>
                  Discover Amazing Stories
                </h1>
                <p className="fantasy-subtitle text-white/90 text-lg" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>
                  Explore stories created by our community of storytellers
                </p>
              </div>
              <div className="flex items-center gap-6 text-amber-300/80">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{filteredResult.totalCount} stories</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>Community created</span>
                </div>
              </div>
            </div>
          </div>

          {/* New Unified Filter Bar */}
          <StoryFilterBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            section="discover"
            genres={DISCOVER_GENRES}
            sortOptions={DISCOVER_SORT_OPTIONS}
            className="mb-8"
          />

          {/* View Mode Toggle */}
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'orange-amber' : 'secondary'}
                size="sm"
                className="px-3 py-2"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'orange-amber' : 'secondary'}
                size="sm"
                className="px-3 py-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-20">
              <LoadingSpinner size="lg" className="mx-auto" />
              <p className="text-white mt-4">Loading amazing stories...</p>
            </div>
          )}

          {/* Error State */}
              {error && (
                <div className="text-center py-20">
                  <div className="glass-card-enhanced max-w-lg mx-auto">
                    <div className="p-8">
                      <h3 className="fantasy-title text-2xl font-bold text-white mb-4">Oops! Something went wrong</h3>
                      <p className="text-gray-300 mb-6">
                        We couldn't load the stories right now. Please try again later.
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="btn-primary"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}

          {/* Stories Grid */}
          {!isLoading && !error && (
            <>
              {paginatedStories.length === 0 ? (
                <div className="text-center py-20">
                  <div className="glass-card-enhanced max-w-lg mx-auto">
                    <div className="p-8">
                      <Search className="h-16 w-16 text-amber-400 mx-auto mb-6" />
                      <h3 className="fantasy-title text-2xl font-bold text-white mb-4">No Stories Found</h3>
                      <p className="text-gray-300 mb-6">
                        Try adjusting your search terms or filters to find stories.
                      </p>
                      <button
                        onClick={() => setFilters(getDefaultFilterState('discover'))}
                        className="btn-primary"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                  {paginatedStories.map((story, _index) => {
                    // Ensure compatibility with DiscoverStoryCard's expected type
                    const discoverStory = {
                      ...story,
                      title: story.title || 'Untitled Story',
                      description: story.description || '',
                      story_mode: story.story_mode || 'adventure-quest',
                      published_at: story.published_at || story.created_at,
                      thumbnail_url: story.thumbnail_url || '',
                      full_story_audio_url: story.full_story_audio_url || ''
                    };
                    
                    return (
                      <StoryCard
                        key={story.id}
                        story={discoverStory}
                        variant={viewMode === 'grid' ? 'portrait' : 'landscape'}
                        onView={(story) => navigate(`/story/${story.id}`)}
                        showSecondaryActions={false}
                        className="h-full"
                      />
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="glass-card px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-white px-4 py-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="glass-card px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;