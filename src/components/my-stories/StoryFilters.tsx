
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export type SortOption = 'latest' | 'oldest' | 'title' | 'length' | 'status';
export type SortOrder = 'asc' | 'desc';

interface StoryFiltersProps {
  sortBy: SortOption;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortOption) => void;
  onOrderToggle: () => void;
}

export const StoryFilters: React.FC<StoryFiltersProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
  onOrderToggle,
}) => {

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <Select value={sortBy} onValueChange={(value: SortOption) => onSortChange(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">Latest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          <SelectItem value="title">Title</SelectItem>
          <SelectItem value="length">Story Length</SelectItem>
          <SelectItem value="status">Status</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="orange-base"
        size="sm"
        onClick={onOrderToggle}
        className="px-2"
      >
        <ArrowUpDown className="h-4 w-4" />
        <span className="ml-1 text-xs">
          {sortOrder === 'desc' ? 'Desc' : 'Asc'}
        </span>
      </Button>
      {sortBy === 'length' && (
        <span className="text-xs text-muted-foreground ml-2">
          (by number of segments)
        </span>
      )}
    </div>
  );
};
