import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Cache implementation for story cover images
interface CacheEntry {
  url: string;
  timestamp: number;
}

// Cache configuration
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 500;

// In-memory cache for story cover images
const imageCache = new Map<string, CacheEntry>();

/**
 * Get a cached image URL if it exists and is not expired
 */
const getCachedImage = (cacheKey: string): string | null => {
  const entry = imageCache.get(cacheKey);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > CACHE_DURATION_MS) {
    // Cache entry has expired, remove it
    imageCache.delete(cacheKey);
    return null;
  }
  
  // Using cached image
  return entry.url;
};

/**
 * Add an image URL to the cache
 */
const cacheImage = (cacheKey: string, url: string): void => {
  imageCache.set(cacheKey, {
    url,
    timestamp: Date.now()
  });
  // Image cached
};

/**
 * Clear the cache for a specific story or the entire cache if no key is provided
 */
export const clearImageCache = (cacheKey?: string): void => {
  if (cacheKey) {
    imageCache.delete(cacheKey);
    // Cache cleared for specific key
  } else {
    imageCache.clear();
    // Entire cache cleared
  }
};

/**
 * Retry a function with exponential backoff
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRY_ATTEMPTS,
  initialDelay: number = INITIAL_RETRY_DELAY_MS,
  signal?: AbortSignal
): Promise<T> => {
  let retries = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      // Don't retry if the request was aborted
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      
      retries++;
      if (retries >= maxRetries) {
        console.error(`Failed after ${maxRetries} retries:`, error);
        throw error;
      }
      
      // Check if aborted before waiting
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      
      // Retrying after delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Check if aborted after waiting
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      
      // Exponential backoff with jitter
      delay = delay * 2 * (0.9 + Math.random() * 0.2);
    }
  }
};

/**
 * Gets the last generated image from a story's segments
 * This function fetches the most recent segment with a valid image_url
 */
export const getLastStoryImage = async (storyId: string, signal?: AbortSignal): Promise<string | null> => {
  try {
    // Getting last story image
    
    // Check if the request has been aborted
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    
    // Set up an abort handler that will throw if the signal is aborted during the query
    let abortHandler: (() => void) | undefined;
    if (signal) {
      const abortPromise = new Promise<never>((_, reject) => {
        abortHandler = () => reject(new DOMException('Aborted', 'AbortError'));
        signal.addEventListener('abort', abortHandler, { once: true });
      });
      
      // Race between the query and the abort signal
      const queryPromise = (async () => {
        // Get the last segment with a valid image_url
        const { data: lastSegment, error: segmentError } = await supabase
          .from('story_segments')
          .select('image_url, image_generation_status, created_at')
          .eq('story_id', storyId)
          .not('image_url', 'is', null)
          .neq('image_url', '/placeholder.svg')
          .eq('image_generation_status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (segmentError) {
          if (segmentError.code === 'PGRST116') {
            // No rows returned - no valid images found
            // No valid images found
            return null;
          }
          console.error('Error fetching last segment image:', segmentError);
          return null;
        }

        if (!lastSegment?.image_url) {
          // No valid image in last segment
          return null;
        }

        // Found last story image
        return lastSegment.image_url;
      })();
      
      try {
        return await Promise.race([queryPromise, abortPromise]);
      } finally {
        // Clean up the abort handler
        if (abortHandler) {
          signal.removeEventListener('abort', abortHandler);
        }
      }
    } else {
      // No signal provided, just run the query normally
      const { data: lastSegment, error: segmentError } = await supabase
        .from('story_segments')
        .select('image_url, image_generation_status, created_at')
        .eq('story_id', storyId)
        .not('image_url', 'is', null)
        .neq('image_url', '/placeholder.svg')
        .eq('image_generation_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (segmentError) {
        if (segmentError.code === 'PGRST116') {
          // No rows returned - no valid images found
          // No valid images found
          return null;
        }
        console.error('Error fetching last segment image:', segmentError);
        return null;
      }

      if (!lastSegment?.image_url) {
        // No valid image in last segment
        return null;
      }

      // Found last story image
      return lastSegment.image_url;
    }
  } catch (error) {
    // Rethrow AbortError to be handled by the caller
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    console.error('Failed to get last story image:', error);
    return null;
  }
};

/**
 * Updates story thumbnail_url from the first segment's image_url
 * This utility fixes stories that don't have thumbnails set
 */
export const updateStoryThumbnailFromSegment = async (storyId: string): Promise<string | null> => {
  try {
    // Get the first segment with a valid image_url
    const { data: firstSegment, error: segmentError } = await supabase
      .from('story_segments')
      .select('image_url')
      .eq('story_id', storyId)
      .not('image_url', 'is', null)
      .neq('image_url', '/placeholder.svg')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (segmentError || !firstSegment?.image_url) {
      // No valid image found
      return null;
    }

    // Update the story's thumbnail_url
    const { error: updateError } = await supabase
      .from('stories')
      .update({ thumbnail_url: firstSegment.image_url })
      .eq('id', storyId);

    if (updateError) {
      console.error('Error updating story thumbnail:', updateError);
      return null;
    }

    // Updated story thumbnail
    return firstSegment.image_url;
  } catch (error) {
    console.error('Failed to update story thumbnail:', error);
    return null;
  }
};

/**
 * Batch update thumbnails for stories that don't have them set
 */
export const batchUpdateStoryThumbnails = async (): Promise<void> => {
  try {
    // Starting batch thumbnail update
    
    // Get stories without thumbnails
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id')
      .or('thumbnail_url.is.null,thumbnail_url.eq./placeholder.svg');

    if (storiesError) {
      throw storiesError;
    }

    if (!stories || stories.length === 0) {
      // No stories need thumbnail updates
      toast.info('All stories already have thumbnails');
      return;
    }

    // Found stories to update
    
    let updatedCount = 0;
    for (const story of stories) {
      const thumbnail = await updateStoryThumbnailFromSegment(story.id);
      if (thumbnail) {
        updatedCount++;
      }
    }

    // Updated story thumbnails
    toast.success(`Updated thumbnails for ${updatedCount} stories`);
    
  } catch (error) {
    console.error('Batch thumbnail update failed:', error);
    toast.error('Failed to update story thumbnails');
  }
};

/**
 * Get story cover image URL with fallback logic
 * Updated to prioritize last generated image over thumbnail_url
 * Added support for AbortSignal to cancel requests
 */
/**
 * Get story cover image URL with parallel loading strategy
 * Tries all potential image sources in parallel and uses the first successful result
 */
export const getStoryCoverImage = async (
  story: {
    id?: string;
    thumbnail_url?: string | null;
    story_mode?: string
  },
  signal?: AbortSignal
): Promise<string> => {
  // Getting story cover image
  
  // Generate a cache key based on story properties
  const cacheKey = story.id
    ? `story-${story.id}`
    : `mode-${story.story_mode}-thumb-${story.thumbnail_url}`;
  
  // Check cache first
  const cachedUrl = getCachedImage(cacheKey);
  if (cachedUrl) {
    // Using cached image
    return cachedUrl;
  }
  
  // Check if the request has been aborted
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }
  
  // Get the fallback image early so we can use it as a last resort
  const defaultFallbackImage = getStoryCoverImageSync(story);
  
  // Array to hold all potential image sources with their priorities
  const imageSources: Array<{promise: Promise<string | null>, priority: number}> = [];
  
  // 1. Try to get the last generated image from segments (highest priority)
  if (story.id) {
    const lastImagePromise = retryWithBackoff(
      () => getLastStoryImage(story.id!, signal),
      MAX_RETRY_ATTEMPTS,
      INITIAL_RETRY_DELAY_MS,
      signal
    ).catch(error => {
      // Don't log AbortError as it's expected during component unmounting
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Error fetching last story image:', error);
      }
      return null;
    });
    
    imageSources.push({
      promise: lastImagePromise,
      priority: 1
    });
  }
  
  // 2. Use actual story thumbnail if available (medium priority)
  if (story.thumbnail_url &&
      story.thumbnail_url !== '/placeholder.svg' &&
      story.thumbnail_url !== '/images/default-story-cover.png' &&
      !story.thumbnail_url.includes('placeholder') &&
      !story.thumbnail_url.includes('default')) {
    // Wrap in a promise that resolves immediately
    imageSources.push({
      promise: Promise.resolve(story.thumbnail_url),
      priority: 2
    });
  }
  
  // 3. Always include fallback as a guaranteed source (lowest priority)
  imageSources.push({
    promise: Promise.resolve(defaultFallbackImage),
    priority: 3
  });
  
  try {
    // Create a promise that rejects when the signal is aborted
    let abortPromise: Promise<never> | undefined;
    let abortHandler: (() => void) | undefined;
    
    if (signal) {
      abortPromise = new Promise<never>((_, reject) => {
        abortHandler = () => reject(new DOMException('Aborted', 'AbortError'));
        signal.addEventListener('abort', abortHandler, { once: true });
      });
    }
    
    // Create a promise that resolves with the first successful result
    const racePromise = new Promise<string>((resolve) => {
      // Convert to array of just promises for easier handling
      const promises = imageSources.map(source => source.promise);
      
      // Track which promises have completed
      const completed = new Array(promises.length).fill(false);
      let resolvedCount = 0;
      
      // Process each promise
      promises.forEach((promise, index) => {
        promise.then(result => {
          completed[index] = true;
          resolvedCount++;
          
          // If we have a valid result, use it
          if (result) {
            // Find the source with the highest priority (lowest number) that succeeded
            const highestPrioritySuccessful = imageSources
              .filter((_, i) => completed[i] && promises[i] === promise)
              .sort((a, b) => a.priority - b.priority)[0];
            
            if (highestPrioritySuccessful) {
              resolve(result);
            }
          }
          
          // If all promises have completed and none have resolved with a value, use the fallback
          if (resolvedCount === promises.length) {
            resolve(defaultFallbackImage);
          }
        }).catch(() => {
          completed[index] = true;
          resolvedCount++;
          
          // Check if all promises have completed
          if (resolvedCount === promises.length) {
            resolve(defaultFallbackImage);
          }
        });
      });
    });
    
    // Race between the image loading and abort signal
    const result = await (abortPromise
      ? Promise.race([racePromise, abortPromise])
      : racePromise);
    
    // Clean up the abort handler
    if (signal && abortHandler) {
      signal.removeEventListener('abort', abortHandler);
    }
    
    // Cache the successful result
    // Parallel loading strategy found image
    cacheImage(cacheKey, result);
    return result;
  } catch (error) {
    // Handle AbortError
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    
    // Handle any other errors
    console.error('Error in parallel image loading:', error);
    
    // Return the fallback image as a last resort
    // Using fallback image after error
    return defaultFallbackImage;
  }
};

/**
 * Synchronous version of getStoryCoverImage for components that need immediate fallback
 * This version doesn't fetch from database but uses available data
 */
export const getStoryCoverImageSync = (story: {
  thumbnail_url?: string | null;
  story_mode?: string
}): string => {
  // Generate a cache key based on story properties
  const cacheKey = `mode-${story.story_mode}-thumb-${story.thumbnail_url}`;
  
  // Check cache first
  const cachedUrl = getCachedImage(cacheKey);
  if (cachedUrl) {
    // Using cached image (sync)
    return cachedUrl;
  }
  
  // First priority: Use actual story thumbnail if available (but skip generic/placeholder images)
  if (story.thumbnail_url &&
      story.thumbnail_url !== '/placeholder.svg' &&
      story.thumbnail_url !== '/images/default-story-cover.png' &&
      !story.thumbnail_url.includes('placeholder') &&
      !story.thumbnail_url.includes('default')) {
    // Cache the thumbnail URL
    cacheImage(cacheKey, story.thumbnail_url);
    return story.thumbnail_url;
  }
  
  // Fallback: Use story mode generic images
  const imageMap: { [key: string]: string } = {
    'Epic Fantasy': '/images/fantasy-and-magic.png',
    'Sci-Fi Thriller': '/images/science-fiction-and-space.png',
    'Mystery Detective': '/images/mystery-and-detective.png',
    'Horror Story': '/images/mystery-and-detective.png',
    'Adventure Quest': '/images/adventure-and-exploration.png',
    'Romantic Drama': '/images/values-and-life-lessons.png',
    'Comedy Adventure': '/images/silly-and-humorous.png',
    'Historical Journey': '/images/adventure-and-exploration.png',
    'Child-Adapted Story': '/images/bedtime-stories.png',
    'Educational Adventure': '/images/educational-stories.png',
    // Add mappings for the new genre names used in the app
    'fantasy-magic': '/images/fantasy-and-magic.png',
    'adventure-exploration': '/images/adventure-and-exploration.png',
    'mystery-detective': '/images/mystery-and-detective.png',
    'values-lessons': '/images/values-and-life-lessons.png',
    'science-space': '/images/science-fiction-and-space.png',
    'educational-stories': '/images/educational-stories.png',
    'bedtime-stories': '/images/bedtime-stories.png',
    'silly-humor': '/images/silly-and-humorous.png',
    'fantasy-and-magic': '/images/fantasy-and-magic.png',
    'adventure-and-exploration': '/images/adventure-and-exploration.png',
    'mystery-and-detective': '/images/mystery-and-detective.png',
    'values-and-life-lessons': '/images/values-and-life-lessons.png',
    'science-fiction-and-space': '/images/science-fiction-and-space.png',
    'silly-and-humorous': '/images/silly-and-humorous.png',
    // Additional mappings for variations
    'fantasy magic': '/images/fantasy-and-magic.png',
    'child adapted': '/images/bedtime-stories.png',
    'child-adapted': '/images/bedtime-stories.png'
  };
  
  const fallbackImage = imageMap[story.story_mode || 'Epic Fantasy'] || '/images/fantasy-and-magic.png';
  return fallbackImage;
};