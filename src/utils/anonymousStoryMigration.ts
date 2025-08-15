import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Migrates anonymous stories to the authenticated user's account
 * @param userId The authenticated user's ID
 * @returns Promise that resolves to an object containing success status and counts
 */
export const migrateAnonymousStories = async (userId: string): Promise<{
  success: boolean;
  migratedCount: number;
  failedCount: number;
  errors: Error[];
}> => {
  // Initialize result object
  const result = {
    success: false,
    migratedCount: 0,
    failedCount: 0,
    errors: [] as Error[],
  };

  try {
    // Get anonymous story IDs from localStorage
    const anonymousStoryIds = JSON.parse(localStorage.getItem('anonymous_story_ids') || '[]') as string[];
    
    // If no anonymous stories, return early
    if (!anonymousStoryIds.length) {
      result.success = true;
      return result;
    }

    console.log(`Migrating ${anonymousStoryIds.length} anonymous stories to user ${userId}`);
    
    // Update each story in the database
    const updatePromises = anonymousStoryIds.map(async (storyId) => {
      try {
        const { error } = await supabase
          .from('stories')
          .update({ user_id: userId })
          .eq('id', storyId)
          .is('user_id', null);
        
        if (error) {
          throw error;
        }
        
        result.migratedCount++;
        return { success: true, storyId };
      } catch (error) {
        result.failedCount++;
        result.errors.push(error as Error);
        console.error(`Failed to migrate story ${storyId}:`, error);
        return { success: false, storyId, error };
      }
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    // Clear anonymous story IDs from localStorage if all migrations were successful
    if (result.failedCount === 0) {
      localStorage.removeItem('anonymous_story_ids');
    } else {
      // Keep only the failed story IDs in localStorage
      const failedStoryIds = (await Promise.all(updatePromises))
        .filter(result => !result.success)
        .map(result => result.storyId);
      
      localStorage.setItem('anonymous_story_ids', JSON.stringify(failedStoryIds));
    }
    
    // Show success toast if any stories were migrated
    if (result.migratedCount > 0) {
      toast.success(
        `${result.migratedCount} ${result.migratedCount === 1 ? 'story' : 'stories'} saved to your account!`,
        { duration: 5000 }
      );
    }
    
    // Show warning toast if any migrations failed
    if (result.failedCount > 0) {
      toast.error(
        `Failed to save ${result.failedCount} ${result.failedCount === 1 ? 'story' : 'stories'} to your account. Please try again later.`,
        { duration: 5000 }
      );
    }
    
    result.success = result.migratedCount > 0 || result.failedCount === 0;
    return result;
  } catch (error) {
    console.error('Error migrating anonymous stories:', error);
    result.errors.push(error as Error);
    
    toast.error('Failed to save your anonymous stories. Please try again later.');
    return result;
  }
};

/**
 * Checks if there are any anonymous stories in localStorage
 * @returns boolean indicating if anonymous stories exist
 */
export const hasAnonymousStories = (): boolean => {
  try {
    const anonymousStoryIds = JSON.parse(localStorage.getItem('anonymous_story_ids') || '[]') as string[];
    return anonymousStoryIds.length > 0;
  } catch (e) {
    console.error("Failed to check anonymous stories", e);
    return false;
  }
};