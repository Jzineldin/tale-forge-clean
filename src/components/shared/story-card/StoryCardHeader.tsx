import React, { useState, useEffect } from 'react';
import { StoryCardHeaderProps } from './types';
import { CheckCircle, Hourglass, Star } from 'lucide-react';
import { StoryCardBadgeType } from './types';
import { useStoryCoverImage } from '@/hooks/useStoryCoverImage';
import { clearImageCache } from '@/utils/storyCoverUtils';
import { cn } from '@/lib/utils';

/**
 * StoryCardHeader - Contains thumbnail and badges
 *
 * This component handles the top section of the story card, including
 * the thumbnail image and status badges.
 */
const StoryCardHeader: React.FC<StoryCardHeaderProps> = ({
  story,
  showBadges = true,
  badgePosition = 'top-right',
  className = '',
}) => {
  // State for image loading status
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // StoryCardHeader rendering for story
  
  // Use the hook with the story object
  const { imageUrl, isLoading, refetch } = useStoryCoverImage({
    story: story as unknown as {
      id?: string;
      thumbnail_url?: string | null;
      story_mode?: string
    }
  });
  
  // useStoryCoverImage hook returned data

  // Reset image states when the image URL changes
  useEffect(() => {
    // imageUrl changed, resetting states
    setImageLoaded(false);
    setImageError(false);
  }, [imageUrl, story.id]);

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Handle image load error
  const handleImageError = () => {
    // Failed to load image
    setImageError(true);
    setImageLoaded(true); // Consider it loaded even if there's an error
    
    // Only attempt to refetch if we have a non-empty URL and a story ID
    if (story.id && imageUrl && imageUrl.length > 0) {
      const cacheKey = `story-${story.id}`;
      clearImageCache(cacheKey);
      refetch();
    }
  };

  // Determine badge type based on story properties
  const getBadgeType = (): StoryCardBadgeType => {
    if (story.is_completed) return 'completed';
    return 'in-progress';
  };

  // Render appropriate badge icon based on type
  const renderBadgeIcon = (type: StoryCardBadgeType) => {
    switch (type) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'in-progress':
        return <Hourglass className="h-4 w-4 text-amber-400" />;
      case 'featured':
        return <Star className="h-4 w-4 text-yellow-400" />;
      case 'new':
        return <span className="text-xs font-bold text-blue-400">NEW</span>;
      default:
        return null;
    }
  };

  // Badge position classes
  const badgePositionClasses = {
    'top-right': 'top-3 right-3',
    'top-left': 'top-3 left-3'
  };

  return (
    <div className={cn(
      "relative w-full aspect-[4/3] overflow-hidden rounded-t-lg",
      // Keep the original class name for backward compatibility during transition
      "story-card-header",
      className
    )}>
      {/* Thumbnail image */}
      {isLoading && !imageLoaded ? (
        <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center animate-pulse">
          <div className="text-center text-text-secondary/60">
            <Hourglass className="h-8 w-8 mx-auto mb-2 animate-spin" />
            <p className="text-sm">Loading image...</p>
          </div>
        </div>
      ) : !imageError ? (
        <img
          src={imageUrl}
          alt={story.title || 'Story thumbnail'}
          className={cn(
            "absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-normal",
            imageLoaded ? "opacity-100" : "opacity-0",
            // Keep the original class name for backward compatibility during transition
            "story-card-thumbnail",
            imageLoaded ? "loaded" : ""
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center text-text-secondary/60">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Image unavailable</p>
          </div>
        </div>
      )}

      {/* Status badge */}
      {showBadges && (
        <div className={cn(
          "absolute w-8 h-8 rounded-full backdrop-blur-md border border-border-primary bg-bg-overlay/50 flex items-center justify-center z-10",
          badgePositionClasses[badgePosition],
          // Keep the original class name for backward compatibility during transition
          "story-card-badge",
          badgePosition
        )}>
          {renderBadgeIcon(getBadgeType())}
        </div>
      )}
    </div>
  );
};

export default StoryCardHeader;