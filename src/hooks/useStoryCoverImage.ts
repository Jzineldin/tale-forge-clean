import { useState, useEffect, useRef, useCallback } from 'react';
import { getStoryCoverImage, getStoryCoverImageSync } from '@/utils/storyCoverUtils';

interface UseStoryCoverImageProps {
  story: {
    id?: string;
    thumbnail_url?: string | null;
    story_mode?: string;
  };
  useAsync?: boolean;
}

export const useStoryCoverImage = ({ story, useAsync = true }: UseStoryCoverImageProps) => {
  // Initialize with synchronous fallback to prevent empty state
  const [imageUrl, setImageUrl] = useState<string>(() => {
    // Provide immediate fallback to prevent empty state
    return getStoryCoverImageSync(story);
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to track component mount state and for request cancellation
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Create a memoized loadImage function that can be called from refetch
  const loadImage = useCallback(async () => {
    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      if (!isMounted.current) return;
      setIsLoading(true);
      setError(null);

      let url: string;

      if (useAsync && story.id) {
        // Use async version to get the last generated image
        // Fetching async image for story
        url = await getStoryCoverImage(story, signal);
      } else {
        // Use sync version for immediate fallback
        // Using sync image for story mode
        url = getStoryCoverImageSync(story);
      }

      // Check if component is still mounted before updating state
      if (!isMounted.current) return;
      
      // useStoryCoverImage result obtained
      
      // Don't update state with empty URL, keep the previous one
      if (!url) {
        // Empty URL returned from getStoryCoverImage
        return;
      }
      
      setImageUrl(url);
    } catch (err) {
      // Don't handle aborted requests as errors
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Image fetch aborted for story
        return;
      }
      
      // Check if component is still mounted before updating state
      if (!isMounted.current) return;
      
      // Error loading story cover image
      setError(err instanceof Error ? err.message : 'Failed to load image');
      
      // Fallback to sync version on error
      const fallbackUrl = getStoryCoverImageSync(story);
      // Fallback to sync version
      
      // Don't update state with empty fallback URL
      if (!fallbackUrl) {
        // Empty fallback URL from getStoryCoverImageSync
        return;
      }
      
      setImageUrl(fallbackUrl);
    } finally {
      // Check if component is still mounted before updating state
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [story.id, story.thumbnail_url, story.story_mode, useAsync]);

  useEffect(() => {
    // Load the image when dependencies change
    loadImage();
    
    // Cleanup function to prevent memory leaks and race conditions
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadImage]);

  // Reset the mounted ref when the component mounts
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    imageUrl,
    isLoading,
    error,
    refetch: loadImage // Now refetch actually calls loadImage
  };
};