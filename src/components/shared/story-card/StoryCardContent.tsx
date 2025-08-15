import React from 'react';
import { StoryCardContentProps } from './types';
import { Calendar, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

/**
 * StoryCardContent - Contains title, description, and metadata
 * 
 * This component handles the main content section of the story card,
 * including the title, description, and metadata information.
 */
const StoryCardContent: React.FC<StoryCardContentProps> = ({
  story,
  showDescription = true,
  showMetadata = true,
  titleLines = 2,
  descriptionLines = 3,
  className = '',
}) => {
  // Format the date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  // Get the appropriate date (published_at or created_at)
  const displayDate = story.published_at || story.created_at;
  
  return (
    <div className={cn(
      "p-4",
      // Keep the original class name for backward compatibility during transition
      "story-card-content",
      className
    )}>
      {/* Title */}
      <h3
        className={cn(
          "text-lg font-semibold text-white mb-2 line-clamp-2",
          // Keep the original class name for backward compatibility during transition
          "story-card-title"
        )}
        style={{
          textShadow: '0 2px 4px rgba(0,0,0,0.6)',
          WebkitLineClamp: titleLines,
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {story.title || 'Untitled Story'}
      </h3>
      
      {/* Description (if available and enabled) */}
      {showDescription && story.description && (
        <p
          className={cn(
            "text-sm text-white/90 mb-3 line-clamp-3",
            // Keep the original class name for backward compatibility during transition
            "story-card-description"
          )}
          style={{
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            WebkitLineClamp: descriptionLines,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {story.description}
        </p>
      )}
      
      {/* Metadata */}
      {showMetadata && (
        <div className={cn(
          "flex justify-between items-center text-xs text-white/70 mt-auto",
          // Keep the original class name for backward compatibility during transition
          "story-card-metadata"
        )}
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
          {/* Date */}
          <div className={cn(
            "flex items-center gap-1",
            // Keep the original class name for backward compatibility during transition
            "story-card-metadata-item"
          )}>
            <Calendar className="h-3 w-3" />
            <span>{formatDate(displayDate)}</span>
          </div>
          
          {/* Segment count */}
          <div className={cn(
            "flex items-center gap-1",
            // Keep the original class name for backward compatibility during transition
            "story-card-metadata-item"
          )}>
            <BookOpen className="h-3 w-3" />
            <span>{story.segment_count || 0} {story.segment_count === 1 ? 'segment' : 'segments'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryCardContent;