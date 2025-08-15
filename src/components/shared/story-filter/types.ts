import { Story } from '@/types/stories';

export type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'length' | 'completion' | 'popularity' | 'recent-activity';

export type StatusFilter = 'all' | 'completed' | 'in-progress';
export type VoiceFilter = 'all' | 'with-voice' | 'without-voice';
export type VisibilityFilter = 'all' | 'public' | 'private';

export interface FilterState {
  search: string;
  status: StatusFilter;
  genre: string;
  voice: VoiceFilter;
  visibility?: VisibilityFilter; // Only for My Stories
  sortBy: SortOption;
}

export interface GenreOption {
  value: string;
  label: string;
  emoji: string;
}

export interface SortOptionConfig {
  value: SortOption;
  label: string;
  section?: 'common' | 'my-stories' | 'discover';
}

export interface StoryFilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  section: 'my-stories' | 'discover';
  showGenreFilter?: boolean;
  showVoiceFilter?: boolean;
  showVisibilityFilter?: boolean;
  showSearch?: boolean;
  className?: string;
  genres?: GenreOption[];
  sortOptions?: SortOptionConfig[];
}

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  options: SortOptionConfig[];
  className?: string;
}

export interface FilterChipsProps {
  filters: FilterState;
  onFilterRemove: (filterKey: keyof FilterState) => void;
  onClearAll: () => void;
  genres?: GenreOption[];
  className?: string;
}

export interface FilteredStoriesResult {
  stories: Story[];
  totalCount: number;
  hasActiveFilters: boolean;
}