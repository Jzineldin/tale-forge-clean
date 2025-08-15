/**
 * Enhanced story migration service
 * 
 * This module provides utilities for migrating stories from anonymous
 * to authenticated users, with support for IndexedDB and offline scenarios.
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  OfflineStory, 
  // OfflineStorySegment,
  getUnsyncedStories,
  getStorySegmentsByStoryId,
  updateStory,
  updateStorySegment,
  getAllStories
} from '@/lib/storage/indexedDB';
import { SyncService } from '@/lib/sync/syncService';

// Migration result interface
export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  failedCount: number;
  errors: Error[];
  partialMigration: boolean;
}

// Migration progress interface
export interface MigrationProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: boolean;
}

// Migration progress callback
export type MigrationProgressCallback = (progress: MigrationProgress) => void;

// Class for managing story migration
export class StoryMigrationService {
  private static instance: StoryMigrationService;
  private syncService = SyncService.getInstance();
  private migrationInProgress: boolean = false;
  private migrationProgress: MigrationProgress = {
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: false
  };
  private progressCallbacks: MigrationProgressCallback[] = [];

  private constructor() {}

  /**
   * Get the singleton instance of StoryMigrationService
   */
  public static getInstance(): StoryMigrationService {
    if (!StoryMigrationService.instance) {
      StoryMigrationService.instance = new StoryMigrationService();
    }
    return StoryMigrationService.instance;
  }

  /**
   * Register a progress callback
   */
  public registerProgressCallback(callback: MigrationProgressCallback): void {
    this.progressCallbacks.push(callback);
  }

  /**
   * Unregister a progress callback
   */
  public unregisterProgressCallback(callback: MigrationProgressCallback): void {
    this.progressCallbacks = this.progressCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Update migration progress
   */
  private updateProgress(progress: Partial<MigrationProgress>): void {
    this.migrationProgress = {
      ...this.migrationProgress,
      ...progress
    };

    // Notify all callbacks
    this.progressCallbacks.forEach(callback => {
      try {
        callback(this.migrationProgress);
      } catch (error) {
        console.error('Error in migration progress callback:', error);
      }
    });
  }

  /**
   * Check if there are any stories to migrate
   */
  public async hasStoriesToMigrate(): Promise<boolean> {
    try {
      // Get all stories from IndexedDB
      const stories = await getAllStories();
      
      // Filter for stories without a user_id
      const anonymousStories = stories.filter(story => !story.user_id);
      
      return anonymousStories.length > 0;
    } catch (error) {
      console.error('Error checking for stories to migrate:', error);
      return false;
    }
  }

  /**
   * Get the count of stories to migrate
   */
  public async getStoriesToMigrateCount(): Promise<number> {
    try {
      // Get all stories from IndexedDB
      const stories = await getAllStories();
      
      // Filter for stories without a user_id
      const anonymousStories = stories.filter(story => !story.user_id);
      
      return anonymousStories.length;
    } catch (error) {
      console.error('Error counting stories to migrate:', error);
      return 0;
    }
  }

  /**
   * Migrate anonymous stories to the authenticated user's account
   */
  public async migrateAnonymousStories(userId: string): Promise<MigrationResult> {
    if (this.migrationInProgress) {
      return {
        success: false,
        migratedCount: 0,
        failedCount: 0,
        errors: [new Error('Migration already in progress')],
        partialMigration: false
      };
    }

    this.migrationInProgress = true;
    this.updateProgress({
      inProgress: true,
      completed: 0,
      failed: 0
    });

    // Initialize result object
    const result: MigrationResult = {
      success: false,
      migratedCount: 0,
      failedCount: 0,
      errors: [],
      partialMigration: false
    };

    try {
      // Get all stories from IndexedDB
      const stories = await getAllStories();
      
      // Filter for stories without a user_id
      const anonymousStories = stories.filter(story => !story.user_id);
      
      if (anonymousStories.length === 0) {
        this.migrationInProgress = false;
        this.updateProgress({ inProgress: false });
        result.success = true;
        return result;
      }

      console.log(`Migrating ${anonymousStories.length} anonymous stories to user ${userId}`);
      this.updateProgress({ total: anonymousStories.length });

      // Migrate each story
      for (let i = 0; i < anonymousStories.length; i++) {
        const story = anonymousStories[i];
        
        try {
          await this.migrateStory(story, userId);
          result.migratedCount++;
          this.updateProgress({ completed: result.migratedCount });
        } catch (error) {
          console.error(`Failed to migrate story ${story.id}:`, error);
          result.failedCount++;
          result.errors.push(error as Error);
          this.updateProgress({ failed: result.failedCount });
        }
      }

      // Determine if this was a partial migration
      result.partialMigration = result.failedCount > 0 && result.migratedCount > 0;
      
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
    } catch (error) {
      console.error('Error migrating anonymous stories:', error);
      result.errors.push(error as Error);
      
      toast.error('Failed to save your anonymous stories. Please try again later.');
    } finally {
      this.migrationInProgress = false;
      this.updateProgress({ inProgress: false });
    }

    return result;
  }

  /**
   * Migrate a single story
   */
  private async migrateStory(story: OfflineStory, userId: string): Promise<void> {
    // Update the story with the user ID
    const updatedStory: OfflineStory = {
      ...story,
      user_id: userId
    };

    // Get all segments for this story
    const segments = await getStorySegmentsByStoryId(story.id);

    // First, update the story in Supabase
    const { error } = await supabase
      .from('stories')
      .upsert(updatedStory)
      .eq('id', story.id);

    if (error) {
      throw error;
    }

    // Then, update all segments in Supabase
    for (const segment of segments) {
      const { error: segmentError } = await supabase
        .from('story_segments')
        .upsert(segment)
        .eq('id', segment.id);

      if (segmentError) {
        console.error(`Error updating segment ${segment.id}:`, segmentError);
        // Continue with other segments even if one fails
      }
    }

    // Finally, update the story in IndexedDB
    await updateStory({
      ...updatedStory,
      is_synced: true
    });

    // Mark all segments as synced
    for (const segment of segments) {
      await updateStorySegment({
        ...segment,
        is_synced: true
      });
    }
  }

  /**
   * Resume a failed migration
   */
  public async resumeMigration(userId: string): Promise<MigrationResult> {
    // Get unsynced stories
    const unsyncedStories = await getUnsyncedStories();
    
    // Filter for stories without a user_id
    const anonymousStories = unsyncedStories.filter(story => !story.user_id);
    
    if (anonymousStories.length === 0) {
      // No stories to migrate, try syncing instead
      await this.syncService.syncAll();
      
      return {
        success: true,
        migratedCount: 0,
        failedCount: 0,
        errors: [],
        partialMigration: false
      };
    }
    
    // Migrate the remaining stories
    return await this.migrateAnonymousStories(userId);
  }

  /**
   * Get the current migration progress
   */
  public getMigrationProgress(): MigrationProgress {
    return { ...this.migrationProgress };
  }

  /**
   * Check if migration is in progress
   */
  public isMigrationInProgress(): boolean {
    return this.migrationInProgress;
  }
}

/**
 * Hook for using story migration in components
 */
export const useStoryMigration = () => {
  const migrationService = StoryMigrationService.getInstance();

  const hasStoriesToMigrate = async (): Promise<boolean> => {
    return await migrationService.hasStoriesToMigrate();
  };

  const getStoriesToMigrateCount = async (): Promise<number> => {
    return await migrationService.getStoriesToMigrateCount();
  };

  const migrateAnonymousStories = async (userId: string): Promise<MigrationResult> => {
    return await migrationService.migrateAnonymousStories(userId);
  };

  const resumeMigration = async (userId: string): Promise<MigrationResult> => {
    return await migrationService.resumeMigration(userId);
  };

  const registerProgressCallback = (callback: MigrationProgressCallback): void => {
    migrationService.registerProgressCallback(callback);
  };

  const unregisterProgressCallback = (callback: MigrationProgressCallback): void => {
    migrationService.unregisterProgressCallback(callback);
  };

  const getMigrationProgress = (): MigrationProgress => {
    return migrationService.getMigrationProgress();
  };

  const isMigrationInProgress = (): boolean => {
    return migrationService.isMigrationInProgress();
  };

  return {
    hasStoriesToMigrate,
    getStoriesToMigrateCount,
    migrateAnonymousStories,
    resumeMigration,
    registerProgressCallback,
    unregisterProgressCallback,
    getMigrationProgress,
    isMigrationInProgress
  };
};