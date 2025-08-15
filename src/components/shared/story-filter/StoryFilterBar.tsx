import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchInput } from './SearchInput';
import { SortDropdown } from './SortDropdown';
import { FilterChips } from './FilterChips';
import { StoryFilterBarProps, GenreOption, SortOptionConfig } from './types';

const DEFAULT_GENRES: GenreOption[] = [
  { value: 'child-adapted', label: 'Child Adapted', emoji: '👶' },
  { value: 'horror-story', label: 'Horror Story', emoji: '👻' },
  { value: 'educational', label: 'Educational', emoji: '📚' },
  { value: 'epic-fantasy', label: 'Epic Fantasy', emoji: '🏰' },
  { value: 'sci-fi-thriller', label: 'Sci-Fi Thriller', emoji: '🚀' },
  { value: 'mystery', label: 'Mystery', emoji: '🕵️' },
  { value: 'romantic-drama', label: 'Romantic Drama', emoji: '💕' },
  { value: 'adventure-quest', label: 'Adventure Quest', emoji: '🗺️' }
];

const DEFAULT_SORT_OPTIONS: SortOptionConfig[] = [
  { value: 'newest', label: 'Newest First', section: 'common' },
  { value: 'oldest', label: 'Oldest First', section: 'common' },
  { value: 'title-asc', label: 'Title A-Z', section: 'common' },
  { value: 'title-desc', label: 'Title Z-A', section: 'common' },
  { value: 'length', label: 'Length (segments)', section: 'common' },
  { value: 'completion', label: 'Completion Status', section: 'my-stories' },
  { value: 'popularity', label: 'Most Popular', section: 'discover' },
  { value: 'recent-activity', label: 'Recent Activity', section: 'discover' }
];

export const StoryFilterBar: React.FC<StoryFilterBarProps> = ({
  filters,
  onFiltersChange,
  section,
  showGenreFilter = true,
  showVoiceFilter = true,
  showVisibilityFilter = false,
  showSearch = true,
  className = "",
  genres = DEFAULT_GENRES,
  sortOptions = DEFAULT_SORT_OPTIONS
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter sort options based on section
  const availableSortOptions = sortOptions.filter(
    option => option.section === 'common' || option.section === section
  );

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleFilterRemove = (key: keyof typeof filters) => {
    const resetValues = {
      search: '',
      status: 'all' as const,
      genre: '',
      voice: 'all' as const,
      visibility: 'all' as const,
      sortBy: 'newest' as const
    };

    onFiltersChange({
      ...filters,
      [key]: resetValues[key]
    });
  };

  const handleClearAllFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      genre: '',
      voice: 'all',
      visibility: 'all',
      sortBy: 'newest'
    });
  };

  return (
    <div className={`glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl shadow-xl ${className}`}>
      <div className="p-6 space-y-4">
        {/* Search Bar */}
        {showSearch && (
          <div className="max-w-2xl mx-auto">
            <SearchInput
              value={filters.search}
              onChange={(value) => handleFilterChange('search', value)}
              placeholder="Search stories by title or description..."
            />
          </div>
        )}

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              variant="secondary"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="font-bold"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <SortDropdown
              value={filters.sortBy}
              onChange={(value) => handleFilterChange('sortBy', value)}
              options={availableSortOptions}
            />

            {showVoiceFilter && (
              <Select 
                value={filters.voice} 
                onValueChange={(value) => handleFilterChange('voice', value)}
              >
                <SelectTrigger className="w-40 input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all" className="text-white hover:bg-slate-700">All Stories</SelectItem>
                  <SelectItem value="with-voice" className="text-white hover:bg-slate-700">🎵 With Voice</SelectItem>
                  <SelectItem value="without-voice" className="text-white hover:bg-slate-700">🔇 Without Voice</SelectItem>
                </SelectContent>
              </Select>
            )}

            {showVisibilityFilter && (
              <Select 
                value={filters.visibility || 'all'} 
                onValueChange={(value) => handleFilterChange('visibility', value)}
              >
                <SelectTrigger className="w-40 input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all" className="text-white hover:bg-slate-700">All Stories</SelectItem>
                  <SelectItem value="public" className="text-white hover:bg-slate-700">🌍 Public</SelectItem>
                  <SelectItem value="private" className="text-white hover:bg-slate-700">🔒 Private</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-slate-600 pt-4 space-y-4">
            {/* Status Filter */}
            <div className="flex items-center gap-4">
              <span className="text-gray-300 font-medium min-w-[80px]">Status:</span>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All Stories' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'in-progress', label: 'In Progress' }
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleFilterChange('status', status.value)}
                    className={`px-3 py-1 rounded text-sm ${
                      filters.status === status.value
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                         : 'glass-card text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Filter */}
            {showGenreFilter && (
              <div className="flex items-start gap-4">
                <span className="text-gray-300 font-medium min-w-[80px] pt-1">Genre:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange('genre', '')}
                    className={`px-3 py-1 rounded text-sm ${
                      filters.genre === ''
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                         : 'glass-card text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    All Genres
                  </button>
                  {genres.map((genre) => (
                    <button
                      key={genre.value}
                      onClick={() => handleFilterChange('genre', genre.value)}
                      className={`px-3 py-1 rounded text-sm ${
                        filters.genre === genre.value
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                           : 'glass-card text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      {genre.emoji} {genre.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Filter Chips */}
        <FilterChips
          filters={filters}
          onFilterRemove={handleFilterRemove}
          onClearAll={handleClearAllFilters}
          genres={genres}
        />
      </div>
    </div>
  );
};