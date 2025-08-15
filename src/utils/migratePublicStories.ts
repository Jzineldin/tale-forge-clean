import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Migration utility to ensure all public stories are properly set up for the discover page
 * This function will:
 * 1. Find all stories marked as public
 * 2. Ensure they have proper published_at dates
 * 3. Update any missing metadata
 */
export const migratePublicStories = async (): Promise<{
  success: boolean;
  migratedCount: number;
  errors: string[];
}> => {
  const errors: string[] = [];
  let migratedCount = 0;

  try {
    console.log('🔄 Starting public stories migration...');

    // Find all stories that are marked as public
    const { data: publicStories, error: fetchError } = await supabase
      .from('stories')
      .select('id, title, is_public, published_at, created_at, story_mode, segment_count')
      .eq('is_public', true);

    if (fetchError) {
      throw new Error(`Failed to fetch public stories: ${fetchError.message}`);
    }

    if (!publicStories || publicStories.length === 0) {
      console.log('ℹ️ No public stories found to migrate');
      return { success: true, migratedCount: 0, errors: [] };
    }

    console.log(`📚 Found ${publicStories.length} public stories to process`);

    // Process each public story
    for (const story of publicStories) {
      try {
        const updates: any = {};

        // Ensure published_at is set (use created_at if not set)
        if (!story.published_at) {
          updates.published_at = story.created_at;
          console.log(`📅 Setting published_at for story ${story.id}`);
        }

        // Ensure story_mode is set (use default if not set)
        if (!story.story_mode) {
          updates.story_mode = 'epic-fantasy';
          console.log(`🎭 Setting story_mode for story ${story.id}`);
        }

        // Update story if any changes are needed
        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('stories')
            .update(updates)
            .eq('id', story.id);

          if (updateError) {
            errors.push(`Failed to update story ${story.id}: ${updateError.message}`);
            continue;
          }

          migratedCount++;
          console.log(`✅ Migrated story: ${story.title || story.id}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Error processing story ${story.id}: ${errorMessage}`);
      }
    }

    console.log(`🎉 Migration completed: ${migratedCount} stories processed, ${errors.length} errors`);

    if (errors.length > 0) {
      console.warn('⚠️ Migration completed with errors:', errors);
    }

    return {
      success: errors.length === 0,
      migratedCount,
      errors
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Migration failed:', errorMessage);
    return {
      success: false,
      migratedCount: 0,
      errors: [errorMessage]
    };
  }
};

/**
 * Hook for using the migration function
 */
export const usePublicStoriesMigration = () => {
  const runMigration = async () => {
    try {
      const result = await migratePublicStories();
      
      if (result.success) {
        if (result.migratedCount > 0) {
          toast.success(`Successfully migrated ${result.migratedCount} public stories`);
        } else {
          toast.info('No public stories needed migration');
        }
      } else {
        toast.error(`Migration failed: ${result.errors.join(', ')}`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Migration error: ${errorMessage}`);
      throw error;
    }
  };

  return { runMigration };
}; 