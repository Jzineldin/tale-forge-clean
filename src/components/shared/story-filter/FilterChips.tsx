import React from 'react';
import { X } from 'lucide-react';
import { FilterChipsProps } from './types';

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onFilterRemove,
  onClearAll,
  genres = [],
  className = ""
}) => {
  const activeFilters = [];

  // Add search filter chip
  if (filters.search) {
    activeFilters.push({
      key: 'search' as const,
      label: `Search: "${filters.search}"`,
      value: filters.search
    });
  }

  // Add status filter chip
  if (filters.status !== 'all') {
    activeFilters.push({
      key: 'status' as const,
      label: `Status: ${filters.status === 'completed' ? 'Completed' : 'In Progress'}`,
      value: filters.status
    });
  }

  // Add genre filter chip
  if (filters.genre) {
    const genre = genres.find(g => g.value === filters.genre);
    activeFilters.push({
      key: 'genre' as const,
      label: `Genre: ${genre ? `${genre.emoji} ${genre.label}` : filters.genre}`,
      value: filters.genre
    });
  }

  // Add voice filter chip
  if (filters.voice !== 'all') {
    activeFilters.push({
      key: 'voice' as const,
      label: `Voice: ${filters.voice === 'with-voice' ? '🎵 With Voice' : '🔇 Without Voice'}`,
      value: filters.voice
    });
  }

  // Add visibility filter chip (for My Stories only)
  if (filters.visibility && filters.visibility !== 'all') {
    activeFilters.push({
      key: 'visibility' as const,
      label: `Visibility: ${filters.visibility === 'public' ? 'Public' : 'Private'}`,
      value: filters.visibility
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-400 font-medium">Active filters:</span>
      
      {activeFilters.map((filter) => (
        <div
          key={filter.key}
          className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/30 rounded-full px-3 py-1 text-sm text-amber-200"
        >
          <span>{filter.label}</span>
          <button
            onClick={() => onFilterRemove(filter.key)}
            className="ml-1 hover:bg-amber-400/20 rounded-full p-0.5"
            aria-label={`Remove ${filter.key} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {activeFilters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-gray-400 hover:text-gray-300 underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
};