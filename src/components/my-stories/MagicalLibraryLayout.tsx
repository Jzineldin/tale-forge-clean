import React, { useState } from 'react';
import { Story } from '@/types/stories';
import MagicalStoryCard from './MagicalStoryCard';
import { RefreshCw, BookOpen, Plus, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { batchUpdateStoryThumbnails } from '@/utils/storyCoverUtils';
import { StoryFilterBar } from '@/components/shared/story-filter';
import { useStoryFiltering, getDefaultFilterState } from '@/hooks/useStoryFiltering';
import { useStorySorting } from '@/hooks/useStorySorting';
import { FilterState, GenreOption, SortOptionConfig } from '@/components/shared/story-filter/types';
import '../../styles/story-filter.css';

const MY_STORIES_GENRES: GenreOption[] = [
  { value: 'child-adapted', label: 'Child Adapted', emoji: '👶' },
  { value: 'horror-story', label: 'Horror Story', emoji: '👻' },
  { value: 'educational', label: 'Educational', emoji: '📚' },
  { value: 'epic-fantasy', label: 'Epic Fantasy', emoji: '🏰' },
  { value: 'sci-fi-thriller', label: 'Sci-Fi Thriller', emoji: '🚀' },
  { value: 'mystery', label: 'Mystery', emoji: '🕵️' },
  { value: 'romantic-drama', label: 'Romantic Drama', emoji: '💕' },
  { value: 'adventure-quest', label: 'Adventure Quest', emoji: '🗺️' }
];

const MY_STORIES_SORT_OPTIONS: SortOptionConfig[] = [
  { value: 'newest', label: 'Newest First', section: 'common' },
  { value: 'oldest', label: 'Oldest First', section: 'common' },
  { value: 'title-asc', label: 'Title A-Z', section: 'common' },
  { value: 'title-desc', label: 'Title Z-A', section: 'common' },
  { value: 'length', label: 'Length (segments)', section: 'common' },
  { value: 'completion', label: 'Completion Status', section: 'my-stories' }
];

interface MagicalLibraryLayoutProps {
  stories: Story[];
  onSetStoryToDelete: (storyId: string) => void;
  onStoryUpdate?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  showRefresh?: boolean;
  viewMode?: 'grid' | 'list';
}

export const MagicalLibraryLayout: React.FC<MagicalLibraryLayoutProps> = ({
  stories,
  onSetStoryToDelete,
  onRefresh,
  isLoading = false,
  showRefresh = false,
  viewMode = 'grid'
}) => {
  const [isUpdatingThumbnails, setIsUpdatingThumbnails] = useState(false);
  const [filters, setFilters] = useState<FilterState>(getDefaultFilterState('my-stories'));

  // Apply filtering and sorting using our new hooks
  const filteredResult = useStoryFiltering(stories, filters);
  const { sortedStories } = useStorySorting(filteredResult.stories, filters.sortBy);

  // Group filtered stories by completion status
  const completedStories = sortedStories.filter(story => story.is_completed);
  const inProgressStories = sortedStories.filter(story => !story.is_completed);

  const handleUpdateThumbnails = async () => {
    setIsUpdatingThumbnails(true);
    try {
      await batchUpdateStoryThumbnails();
      // Refresh the stories list to show updated thumbnails
      if (onRefresh) {
        onRefresh();
      }
    } finally {
      setIsUpdatingThumbnails(false);
    }
  };

  const renderStoryGroup = (groupStories: Story[], title: string, groupClass: string, startIndex: number) => {
    if (groupStories.length === 0) return null;

    // Mobile-optimized grid classes with enhanced accessibility
    const gridClass = viewMode === 'grid' 
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 auto-rows-fr'
      : 'space-y-3 sm:space-y-4';

    return (
      <div className={`mb-8 sm:mb-12 ${groupClass}`}>
        <div className="story-group-header rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-serif text-amber-100 font-semibold tracking-wide">
            {title}
          </h2>
          <p className="text-amber-300/70 text-xs sm:text-sm mt-1">
            {groupStories.length} {groupStories.length === 1 ? 'story' : 'stories'}
          </p>
        </div>
        
        <div className={gridClass}>
          {groupStories.map((story, index) => (
            <div
              key={story.id}
              className={`book-entrance-animation opacity-0 book-entrance-delay-${Math.min((startIndex + index) % 6 + 1, 6)} focus-within:ring-2 focus-within:ring-amber-400 focus-within:ring-offset-2 rounded-lg`}
            >
              <MagicalStoryCard
                story={story}
                onSetStoryToDelete={onSetStoryToDelete}
                viewMode={viewMode}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cozy library background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/Leonardo_Phoenix_10_A_cozy_wooden_library_at_night_with_floati_2.jpg')"
        }}
      />
      
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 library-background-overlay" />

      {/* Enhanced ambient magical particles - reduced on mobile for performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-1/6 left-1/5 w-2 h-2 bg-amber-300 rounded-full shadow-lg shadow-amber-300/50 ambient-particle-1"></div>
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full shadow-lg shadow-purple-300/50 ambient-particle-2"></div>
        <div className="absolute top-1/2 left-3/4 w-2.5 h-2.5 bg-blue-300 rounded-full shadow-lg shadow-blue-300/50 ambient-particle-3"></div>
        <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50 ambient-particle-1"></div>
        <div className="absolute top-3/4 left-1/6 w-1.5 h-1.5 bg-emerald-300 rounded-full shadow-lg shadow-emerald-300/50 ambient-particle-2"></div>
        <div className="absolute top-1/8 right-1/5 w-2 h-2 bg-rose-300 rounded-full shadow-lg shadow-rose-300/50 ambient-particle-3"></div>
        
        {/* Additional floating book pages */}
        <div className="absolute top-1/3 left-1/8 w-4 h-6 bg-amber-100/10 rounded-sm transform rotate-12 ambient-particle-1"></div>
        <div className="absolute top-2/5 right-1/8 w-3 h-5 bg-amber-100/8 rounded-sm transform -rotate-6 ambient-particle-2"></div>
      </div>

      <div className="container mx-auto p-3 sm:p-6 relative z-10">
        {/* Enhanced Library Header - Mobile Optimized with Safe Areas */}
        <div className="mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="p-2 sm:p-4 bg-gradient-to-br from-amber-900/40 to-amber-700/30 border-2 border-amber-400/40 rounded-xl backdrop-blur-sm shadow-xl">
                <BookOpen className="h-6 w-6 sm:h-10 sm:w-10 text-amber-200" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-amber-100 tracking-wide drop-shadow-2xl"
                    style={{ fontFamily: 'Cinzel Decorative, serif' }}>
                  My Enchanted Library
                </h1>
                <p className="text-amber-300/90 text-sm sm:text-lg lg:text-xl mt-1 sm:mt-2 font-serif">
                  Your collection of magical tales awaits
                </p>
              </div>
            </div>
            
            {/* Mobile-optimized action buttons with enhanced accessibility */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              {showRefresh && (
                <Button 
                  variant="outline" 
                  size="default"
                  onClick={onRefresh} 
                  disabled={isLoading}
                  className="bg-amber-900/40 border-amber-400/50 text-amber-200 hover:bg-amber-800/50 backdrop-blur-sm shadow-lg min-h-[44px] touch-manipulation focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                  aria-label={isLoading ? "Refreshing collection..." : "Refresh story collection"}
                >
                  <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="text-sm sm:text-base">Refresh Collection</span>
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="default"
                onClick={handleUpdateThumbnails} 
                disabled={isUpdatingThumbnails}
                className="bg-purple-900/40 border-purple-400/50 text-purple-200 hover:bg-purple-800/50 backdrop-blur-sm shadow-lg min-h-[44px] touch-manipulation focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                aria-label={isUpdatingThumbnails ? "Updating story covers..." : "Fix story covers"}
              >
                <ImageIcon className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 ${isUpdatingThumbnails ? 'animate-pulse' : ''}`} />
                <span className="text-sm sm:text-base">
                  {isUpdatingThumbnails ? 'Updating Covers...' : 'Fix Story Covers'}
                </span>
              </Button>
              
              <Link to="/" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white shadow-xl border-2 border-amber-400/60 text-sm sm:text-base lg:text-lg px-4 sm:px-6 py-3 min-h-[44px] touch-manipulation focus:ring-2 focus:ring-amber-400 focus:ring-offset-2">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Craft New Tale
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Enhanced library stats - Mobile responsive */}
          <div className="bg-gradient-to-r from-slate-900/60 to-slate-800/40 backdrop-blur-sm border border-amber-400/30 rounded-lg p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 lg:gap-8 text-amber-300/80 text-xs sm:text-sm lg:text-base">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span>{stories.length} total stories</span>
              </div>
              <span className="text-amber-400/50 hidden sm:inline">•</span>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>{filteredResult.totalCount} filtered</span>
              </div>
              <span className="text-amber-400/50 hidden sm:inline">•</span>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{completedStories.length} completed</span>
              </div>
              <span className="text-amber-400/50 hidden sm:inline">•</span>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>{inProgressStories.length} in progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        {stories.length > 0 && (
          <StoryFilterBar
            filters={filters}
            onFiltersChange={setFilters}
            section="my-stories"
            showVisibilityFilter={true}
            genres={MY_STORIES_GENRES}
            sortOptions={MY_STORIES_SORT_OPTIONS}
            className="mb-6 sm:mb-8"
          />
        )}

        {/* Empty state - no stories at all */}
        {stories.length === 0 && (
          <div className="text-center py-12 sm:py-20">
            <div className="max-w-lg mx-auto px-4">
              <div className="p-6 sm:p-8 bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-2 border-amber-400/30 rounded-3xl backdrop-blur-sm mb-6 sm:mb-8 shadow-2xl">
                <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-amber-300/60 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-amber-200 mb-3 sm:mb-4 font-serif">
                  Your Library Awaits Its First Tale
                </h3>
                <p className="text-amber-300/80 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed">
                  Every grand library begins with a single story. Let your imagination flourish and create your first magical adventure.
                </p>
                <Link to="/">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white shadow-xl text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] touch-manipulation focus:ring-2 focus:ring-amber-400 focus:ring-offset-2">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Begin Your First Story
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Empty state - no filtered results */}
        {stories.length > 0 && filteredResult.totalCount === 0 && (
          <div className="text-center py-12 sm:py-20">
            <div className="max-w-lg mx-auto px-4">
              <div className="p-6 sm:p-8 bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-2 border-amber-400/30 rounded-3xl backdrop-blur-sm mb-6 sm:mb-8 shadow-2xl">
                <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-amber-300/60 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-amber-200 mb-3 sm:mb-4 font-serif">
                  No Stories Match Your Filters
                </h3>
                <p className="text-amber-300/80 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed">
                  Try adjusting your search terms or filters to find your stories.
                </p>
                <Button
                  onClick={() => setFilters(getDefaultFilterState('my-stories'))}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white shadow-xl text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] touch-manipulation focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                  aria-label="Clear all filters to show all stories"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Story collection grouped by status */}
        {stories.length > 0 && filteredResult.totalCount > 0 && (
          <div className="space-y-6 sm:space-y-8">
            {renderStoryGroup(completedStories, "📚 Completed Tales", "story-group-completed", 0)}
            {renderStoryGroup(inProgressStories, "✍️ Tales in Progress", "story-group-in-progress", completedStories.length)}
          </div>
        )}
      </div>
    </div>
  );
};