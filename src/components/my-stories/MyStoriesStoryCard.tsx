import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Trash2, Check, X, Play, Cloud, CloudOff, RefreshCw, FileEdit } from 'lucide-react';
import { getStoryCoverImageSync } from '@/utils/storyCoverUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { useNetworkMonitor } from '@/lib/network/networkMonitor';
// import { OfflineStory } from '@/lib/storage/indexedDB';

interface MyStoriesStoryCardProps {
  story: any;
  onEdit: (storyId: string) => void;
  onDelete: (storyId: string) => void;
  onSaveTitle: (storyId: string) => void;
  onCancelEdit: () => void;
  onSyncStory?: (storyId: string) => Promise<void>;
  isEditing: boolean;
  editingStoryId: string | null;
  editTitle: string;
  setEditTitle: (title: string) => void;
}

const MyStoriesStoryCard: React.FC<MyStoriesStoryCardProps> = React.memo(({
  story,
  // onEdit,
  onDelete,
  onSaveTitle,
  onCancelEdit,
  onSyncStory,
  isEditing,
  editTitle,
  setEditTitle
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const networkMonitor = useNetworkMonitor();
  const isOnline = networkMonitor.isOnline();

  // Determine if the story is offline-only
  const isOfflineOnly = 'is_synced' in story && !story.is_synced;

  // Use pre-fetched cover image URL to prevent N+1 queries
  const imageUrl = story.cover_image_url || getStoryCoverImageSync(story);
  
  const hookError = null;

  // Debug logging removed for performance - use React DevTools for debugging

  const handleImageLoad = () => {
    console.log('✅ Image loaded for story:', story.id, 'imageUrl:', imageUrl);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.log('❌ Image error for story:', story.id, 'imageUrl:', imageUrl);
    setImageError(true);
    setImageLoaded(true);
  };

  const handleSaveTitle = () => {
    onSaveTitle(story.id);
  };

  const handleCancelEdit = () => {
    onCancelEdit();
  };

  // const _handleEdit = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   onEdit(story.id);
  // };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(story.id);
  };

  const handleView = () => {
    navigate(`/story/${story.id}`);
  };

  const handleEditStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/story-editor/${story.id}`);
  };

  const handleSyncStory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSyncStory || !isOnline) return;
    
    setIsSyncing(true);
    try {
      await onSyncStory(story.id);
    } catch (error) {
      console.error('Error syncing story:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper functions for genre display
  const getGenreEmoji = (storyMode: string) => {
    const genreEmojis: { [key: string]: string } = {
      'fantasy-magic': '🧙‍♂️',
      'adventure-exploration': '🗺️',
      'mystery-detective': '🔍',
      'values-lessons': '💎',
      'science-space': '🚀',
      'educational-stories': '📚',
      'bedtime-stories': '🌙',
      'silly-humor': '😄'
    };
    return genreEmojis[storyMode] || '📖';
  };

  const getGenreColor = (storyMode: string) => {
    const genreColors: { [key: string]: string } = {
      'fantasy-magic': 'from-purple-500/20 to-pink-500/20',
      'adventure-exploration': 'from-blue-500/20 to-cyan-500/20',
      'mystery-detective': 'from-green-500/20 to-emerald-500/20',
      'values-lessons': 'from-amber-500/20 to-orange-500/20',
      'science-space': 'from-indigo-500/20 to-purple-500/20',
      'educational-stories': 'from-teal-500/20 to-blue-500/20',
      'bedtime-stories': 'from-blue-500/20 to-indigo-500/20',
      'silly-humor': 'from-yellow-500/20 to-orange-500/20'
    };
    return genreColors[storyMode] || 'from-gray-500/20 to-gray-600/20';
  };

  const getGenreDisplayName = (storyMode: string) => {
    const genreNames: { [key: string]: string } = {
      'fantasy-magic': 'Fantasy & Magic',
      'adventure-exploration': 'Adventure & Exploration',
      'mystery-detective': 'Mystery & Detective',
      'values-lessons': 'Values & Life Lessons',
      'science-space': 'Science & Space',
      'educational-stories': 'Educational Stories',
      'bedtime-stories': 'Bedtime Stories',
      'silly-humor': 'Silly & Humorous'
    };
    return genreNames[storyMode] || 'Unknown Genre';
  };

  // If we're in editing mode, render the editing UI
  if (isEditing) {
    return (
      <div className="magical-story-card bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-amber-500/30 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 bg-slate-700/50 border border-amber-500/30 rounded px-2 py-1 text-amber-200 focus:outline-none focus:border-amber-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            autoFocus
          />
          <button
            onClick={handleSaveTitle}
            className="p-1 text-green-400 hover:text-green-300"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={handleCancelEdit}
            className="p-1 text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-gray-600/50 hover:border-amber-400/50 hover:scale-105 transition-all duration-300">
      {/* Story Image Header */}
      <div className="relative h-48 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${getGenreColor(story.story_mode)}`} />
        
        {/* Loading skeleton */}
        {(!imageLoaded && !imageError && !!imageUrl) && (
          <Skeleton className="w-full h-full absolute inset-0 z-0" />
        )}
        
        {/* Error state */}
        {(imageError || hookError || !imageUrl) ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 absolute inset-0">
            <div className="text-center text-white/60">
              <div className="text-4xl mb-2">{getGenreEmoji(story.story_mode)}</div>
              <p className="text-xs sm:text-sm">Image unavailable</p>
              <p className="text-xs text-red-400 mt-1">Debug: {imageUrl || 'No URL'}</p>
            </div>
          </div>
        ) : (
          <img 
            src={imageUrl}
            alt={`${getGenreDisplayName(story.story_mode)} story`}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
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
              {getGenreDisplayName(story.story_mode)}
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
            <div className="bg-green-500/80 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.794L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4.017-2.794a1 1 0 011.617.794z" clipRule="evenodd" />
              </svg>
              <span className="text-white text-sm font-medium">Voice</span>
            </div>
          </div>
        )}

        {/* Sync Status Indicator */}
        {isOfflineOnly && (
          <div className="absolute top-4 right-4">
            <div className="bg-amber-500/80 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-2">
              <CloudOff className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">Offline</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Title with edit functionality */}
        <div className="mb-3">
          <h3 className="font-cinzel font-bold text-lg text-yellow-300 line-clamp-2 group-hover:text-yellow-200 transition-colors">
            {story.title || 'Untitled Story'}
          </h3>
        </div>
        
        {/* Description */}
        <p className="font-sans text-sm text-slate-300 line-clamp-2 mb-4">
          {story.description || 'No description available'}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-4">
          {isOfflineOnly && isOnline && onSyncStory ? (
            <button 
              onClick={handleSyncStory}
              disabled={isSyncing}
              className="flex-grow font-bold font-sans text-slate-900 p-3 rounded-lg transition-all duration-200 bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Cloud className="h-4 w-4" />
                  Sync Now
                </>
              )}
            </button>
          ) : story.is_completed ? (
            <button
              onClick={handleView}
              className="flex-grow font-bold font-sans text-black p-3 rounded-lg bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-200"
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
          ) : (
            <button
              onClick={handleView}
              className="flex-grow font-bold font-sans text-black p-3 rounded-lg bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20 flex items-center justify-center gap-2 transition-all duration-200"
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
              <Play className="h-4 w-4" />
              Continue
            </button>
          )}
        </div>

        {/* Action Icons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {story.is_completed && (
              <button
                onClick={handleEditStory}
                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors"
                title="Edit Story Content"
              >
                <FileEdit className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
              title="Delete Story"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2">
            {/* Completion Badge */}
            {story.is_completed && (
              <div className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-300 text-xs font-bold font-sans px-2 py-1 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Complete</span>
              </div>
            )}
            
            {/* Sync Status Badge (small version) */}
            {isOfflineOnly && (
              <div className="flex items-center gap-1.5 bg-amber-400/10 text-amber-300 text-xs font-bold font-sans px-2 py-1 rounded-md">
                <CloudOff className="h-3.5 w-3.5" />
                <span>Offline</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    );
});

export default MyStoriesStoryCard;