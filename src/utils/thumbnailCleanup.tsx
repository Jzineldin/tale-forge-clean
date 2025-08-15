import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Admin utility to clear generic/placeholder thumbnail URLs from stories
 * This allows existing stories to use the new genre-based fallback images
 */
export const clearGenericThumbnails = async (): Promise<void> => {
  try {
    console.log('Clearing generic thumbnail URLs...');
    
    // Clear thumbnail URLs that are generic/placeholder images
    const { error } = await supabase
      .from('stories')
      .update({ thumbnail_url: null })
      .in('thumbnail_url', [
        '/placeholder.svg',
        '/images/default-story-cover.png',
        '/images/epic-fantasy.png'
      ]);

    if (error) {
      console.error('Error clearing generic thumbnails:', error);
      throw error;
    }

    console.log('Cleared generic thumbnails');
    toast.success('Updated story covers to use new images');
    
    // Force a page reload to refresh all story images
    window.location.reload();
  } catch (error) {
    console.error('Failed to clear generic thumbnails:', error);
    toast.error('Failed to update story covers');
  }
};

/**
 * Component to trigger the thumbnail cleanup
 */
export const ThumbnailCleanupButton = () => {
  const handleCleanup = async () => {
    if (confirm('This will update all story covers to use the new genre-based images. Continue?')) {
      await clearGenericThumbnails();
    }
  };

  return (
    <button
      onClick={handleCleanup}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Update Story Cover Images
    </button>
  );
};