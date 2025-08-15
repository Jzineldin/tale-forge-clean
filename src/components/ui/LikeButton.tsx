import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStoryLikes } from '@/hooks/useStoryLikes';

interface LikeButtonProps {
  storyId: string;
  className?: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  storyId,
  className = '',
  showCount = true,
  size = 'md'
}) => {
  const { likesCount, userHasLiked, toggleLike, isToggling } = useStoryLikes(storyId);

  const sizeClasses = {
    sm: 'h-7 px-2 text-xs',
    md: 'h-9 px-3 text-sm',
    lg: 'h-11 px-4 text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <Button
      variant={userHasLiked ? 'default' : 'outline'}
      size="sm"
      onClick={() => toggleLike()}
      disabled={isToggling}
      className={cn(
        'transition-all duration-200 hover:scale-105',
        sizeClasses[size],
        userHasLiked && 'bg-red-500 hover:bg-red-600 text-white',
        className
      )}
    >
      <Heart
        size={iconSizes[size]}
        className={cn(
          'transition-all duration-200',
          userHasLiked ? 'fill-current text-white' : 'text-gray-600'
        )}
      />
      {showCount && (
        <span className="ml-1">
          {likesCount}
        </span>
      )}
    </Button>
  );
}; 