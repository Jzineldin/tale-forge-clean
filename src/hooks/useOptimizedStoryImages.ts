import { useState, useEffect, useMemo } from 'react';
import { Story } from '@/types/stories';
import { debug } from '@/utils/secureLogger';

interface StoryImageCache {
  [storyId: string]: {
    imageUrl: string;
    timestamp: number;
  };
}

/**
 * Optimized hook to batch fetch and cache story images
 * Solves the N+1 query problem by caching image URLs
 */
export const useOptimizedStoryImages = (stories: Story[]) => {
  const [imageCache, setImageCache] = useState<StoryImageCache>({});
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  
  // Generate fallback images for different story modes
  const getFallbackImage = (storyMode: string): string => {
    const fallbackImages: { [key: string]: string } = {
      'fantasy-magic': '/images/fantasy-and-magic.png',
      'adventure-exploration': '/images/adventure-and-exploration.png',
      'mystery-detective': '/images/mystery-and-detective.png',
      'values-lessons': '/images/values-and-life-lessons.png',
      'science-space': '/images/science-and-space.png',
      'educational-stories': '/images/educational-stories.png',
      'bedtime-stories': '/images/bedtime-stories.png',
      'silly-humor': '/images/silly-and-humorous.png'
    };
    return fallbackImages[storyMode] || '/images/fantasy-and-magic.png';
  };

  // Get image URL for a story with caching
  const getStoryImage = (story: Story): string => {
    const cache = imageCache[story.id];
    const now = Date.now();
    
    // Check cache first
    if (cache && (now - cache.timestamp) < CACHE_DURATION) {
      return cache.imageUrl;
    }
    
    // Return thumbnail if available
    if (story.thumbnail_url) {
      // Update cache
      setImageCache(prev => ({
        ...prev,
        [story.id]: {
          imageUrl: story.thumbnail_url!,
          timestamp: now
        }
      }));
      return story.thumbnail_url;
    }
    
    // Return fallback
    const fallbackUrl = getFallbackImage(story.story_mode || '');
    setImageCache(prev => ({
      ...prev,
      [story.id]: {
        imageUrl: fallbackUrl,
        timestamp: now
      }
    }));
    
    return fallbackUrl;
  };

  // Preload images for better performance
  useEffect(() => {
    const preloadImages = async () => {
      const storiesToPreload = stories.filter(story => {
        const cache = imageCache[story.id];
        const now = Date.now();
        return !cache || (now - cache.timestamp) > CACHE_DURATION;
      });

      if (storiesToPreload.length === 0) return;

      debug('Preloading story images', { count: storiesToPreload.length });
      
      const preloadPromises = storiesToPreload.map(async (story) => {
        if (loadingImages.has(story.id)) return;
        
        setLoadingImages(prev => new Set(prev).add(story.id));
        
        try {
          const imageUrl = story.thumbnail_url || getFallbackImage(story.story_mode || '');
          
          // Preload the image
          const img = new Image();
          img.src = imageUrl;
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          
          // Update cache
          setImageCache(prev => ({
            ...prev,
            [story.id]: {
              imageUrl,
              timestamp: Date.now()
            }
          }));
        } catch (error) {
          debug('Failed to preload image for story', { storyId: story.id, error });
          
          // Use fallback
          const fallbackUrl = getFallbackImage(story.story_mode || '');
          setImageCache(prev => ({
            ...prev,
            [story.id]: {
              imageUrl: fallbackUrl,
              timestamp: Date.now()
            }
          }));
        } finally {
          setLoadingImages(prev => {
            const newSet = new Set(prev);
            newSet.delete(story.id);
            return newSet;
          });
        }
      });

      await Promise.all(preloadPromises);
    };

    if (stories.length > 0) {
      preloadImages();
    }
  }, [stories, imageCache, loadingImages]);

  // Memoized result
  const storyImages = useMemo(() => {
    return stories.reduce((acc, story) => {
      acc[story.id] = {
        imageUrl: getStoryImage(story),
        isLoading: loadingImages.has(story.id),
        isCached: !!imageCache[story.id]
      };
      return acc;
    }, {} as Record<string, { imageUrl: string; isLoading: boolean; isCached: boolean }>);
  }, [stories, imageCache, loadingImages]);

  return {
    getStoryImage,
    storyImages,
    isLoadingAny: loadingImages.size > 0,
    cacheSize: Object.keys(imageCache).length
  };
};