import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { Heart, BookOpen, User } from 'lucide-react';


import { Skeleton } from '@/components/ui/skeleton';
import '@/styles/magical-story-card.css';

export interface PublicStory {
  id: string;
  title: string;
  description: string;
  story_mode: string;
  created_at: string;
  published_at: string;
  segment_count: number;
  like_count: number;
  comment_count: number;
  author_name: string;
  thumbnail_url?: string;
  is_completed: boolean;
  audio_generation_status?: string;
  full_story_audio_url?: string;
  user_id?: string;
  cover_image_url?: string; // Pre-fetched cover image to avoid N+1 queries
}

interface DiscoverStoryCardProps {
  story: PublicStory;
  variant?: 'grid' | 'list';
  onBookmark?: (storyId: string, event: React.MouseEvent) => void;
  getGenreEmoji: (genre: string) => string;
  getGenreLabel: (genre: string) => string;
}

const DiscoverStoryCard: React.FC<DiscoverStoryCardProps> = ({
  story,
  onBookmark,
  getGenreEmoji,
  getGenreLabel
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  // Use pre-fetched cover image to eliminate N+1 query problem
  const getFallbackImage = (storyMode: string): string => {
    const fallbackImages: { [key: string]: string } = {
      'fantasy-and-magic': '/images/fantasy-and-magic.png',
      'adventure-and-exploration': '/images/adventure-and-exploration.png',
      'mystery-and-detective': '/images/mystery-and-detective.png',
      'values-and-life-lessons': '/images/values-and-life-lessons.png',
      'science-and-space': '/images/science-and-space.png',
      'educational-stories': '/images/educational-stories.png',
      'bedtime-stories': '/images/bedtime-stories.png',
      'silly-and-humorous': '/images/silly-and-humorous.png'
    };
    return fallbackImages[storyMode] || '/images/fantasy-and-magic.png';
  };

  // Determine the best image URL to use
  const imageUrl = story.cover_image_url || story.thumbnail_url || getFallbackImage(story.story_mode);
  const isImageLoading = false; // No loading state needed since image is pre-fetched
  const hookError = false; // No async errors since we're using pre-fetched data
  
  // Handle viewing a story
  const handleView = () => {
    navigate(`/story/${story.id}`);
  };
  
  // Handle bookmarking a story
  const handleBookmark = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onBookmark) {
      onBookmark(story.id, event);
    }
  };

  const handleImageLoad = () => {
    // Image loaded successfully
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getGenreColor = (storyMode: string) => {
    const genreColors: { [key: string]: string } = {
      'fantasy-and-magic': 'from-purple-500/20 to-pink-500/20',
      'adventure-and-exploration': 'from-blue-500/20 to-cyan-500/20',
      'mystery-and-detective': 'from-green-500/20 to-emerald-500/20',
      'values-and-life-lessons': 'from-amber-500/20 to-orange-500/20',
      'science-fiction-and-space': 'from-indigo-500/20 to-purple-500/20',
      'educational-stories': 'from-teal-500/20 to-blue-500/20',
      'bedtime-stories': 'from-blue-500/20 to-indigo-500/20',
      'silly-and-humorous': 'from-yellow-500/20 to-orange-500/20'
    };
    return genreColors[storyMode] || 'from-gray-500/20 to-gray-600/20';
  };
  
  return (
    <div className="magical-story-card story-card-container group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-gray-600/50 hover:border-amber-400/50 cursor-pointer"
         onClick={handleView}>
      {/* Story Image Header */}
      <div className="relative h-48 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${getGenreColor(story.story_mode)}`} />
        
        {/* Loading skeleton */}
        {(isImageLoading && !imageUrl) && (
          <Skeleton className="w-full h-full absolute inset-0 z-0" />
        )}
        
        {/* Error state */}
        {(imageError || hookError) ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 absolute inset-0">
            <div className="text-center text-white/60">
              <div className="text-4xl mb-2">{getGenreEmoji(story.story_mode)}</div>
              <p className="text-xs sm:text-sm">Image unavailable</p>
            </div>
          </div>
        ) : (
          <img 
            src={imageUrl}
            alt={`${getGenreLabel(story.story_mode)} story`}
            className="w-full h-full object-cover opacity-100"
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}
        
        {/* Genre Badge */}
        <div className="absolute top-4 left-4">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-2">
            <span className="text-lg">{getGenreEmoji(story.story_mode)}</span>
            <span className="text-white text-sm font-medium">
              {getGenreLabel(story.story_mode)}
            </span>
          </div>
        </div>

        {/* Chapter Count */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-amber-400" />
            <span className="text-white text-sm font-medium">
              {story.segment_count || 0} {story.segment_count === 1 ? 'chapter' : 'chapters'}
            </span>
          </div>
        </div>

        {/* Voice Status Indicator */}
        {story.audio_generation_status === 'completed' && story.full_story_audio_url && (
          <div className="absolute bottom-4 left-4">
            <div className="bg-purple-500/80 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.794L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4.017-2.794a1 1 0 011.617.794z" clipRule="evenodd" />
              </svg>
              <span className="text-white text-sm font-medium">Audio</span>
            </div>
          </div>
        )}

        {/* Bookmark Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={handleBookmark}
            className="bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white hover:bg-black/70"
            title="Bookmark Story"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Title */}
        <div className="mb-3">
          <h3 className="font-cinzel font-bold text-lg text-yellow-300 line-clamp-2 group-hover:text-yellow-200">
            {story.title || 'Untitled Story'}
          </h3>
        </div>
        
        {/* Description */}
        <p className="font-sans text-sm text-slate-300 line-clamp-2 mb-4">
          {story.description || 'No description available'}
        </p>

        {/* Metadata Row */}
        <div className="flex justify-between items-center mb-4">
          {/* Author Info */}
          <div className="flex items-center text-sm text-slate-400 font-sans">
            <User className="h-4 w-4 mr-2" />
            {story.author_name}
          </div>

          {/* Completion Badge */}
          {story.is_completed && (
            <div className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-300 text-xs font-bold font-sans px-2 py-1 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Complete</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleView}
            className="flex-grow font-bold font-sans text-black py-4 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-200"
            style={{
              backgroundColor: '#ff8c00',
              color: '#000000',
              opacity: 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ff7700';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ff8c00';
            }}
          >
            Read Story
          </button>
        </div>

        {/* Engagement Stats */}
        {(story.like_count > 0 || story.comment_count > 0) && (
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-600/30">
            {story.like_count > 0 && (
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <Heart className="h-4 w-4" />
                <span>{story.like_count}</span>
              </div>
            )}
            {story.comment_count > 0 && (
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span>{story.comment_count}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverStoryCard;