import { useState, useEffect } from 'react';
import { RecoveryData } from '@/components/story-creation/RecoveryDialog';
import { getAllStories, getStory, deleteStory } from '@/lib/storage/indexedDB';
import { useExitDetection } from '@/lib/browser/exitDetection';
import { useSyncService } from '@/lib/sync/syncService';
import { useAuth } from '@/context/AuthProvider';

/**
 * Hook for managing story recovery
 * 
 * This hook checks for unsaved stories when the application loads
 * and provides methods to recover or discard them.
 */
export const useStoryRecovery = () => {
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState<boolean>(false);
  const [recoveryChecked, setRecoveryChecked] = useState<boolean>(false);
  const { user } = useAuth();
  const syncService = useSyncService();
  const exitDetection = useExitDetection();

  // Check for unsaved stories on mount
  useEffect(() => {
    const checkForUnsavedStories = async () => {
      if (recoveryChecked) return;

      try {
        // Get all stories from IndexedDB
        const stories = await getAllStories();
        
        // Find the most recently updated story that's not synced
        const unsyncedStories = stories.filter(story => !story.is_synced);
        
        if (unsyncedStories.length > 0) {
          // Sort by updated_at in descending order
          unsyncedStories.sort((a, b) => {
            const dateA = new Date(a.updated_at).getTime();
            const dateB = new Date(b.updated_at).getTime();
            return dateB - dateA;
          });
          
          // Get the most recent story
          const mostRecentStory = unsyncedStories[0];
          
          // Create recovery data
          const recoveryData: RecoveryData = {
            storyId: mostRecentStory.id,
            title: mostRecentStory.title || 'Untitled Story',
            lastSaved: mostRecentStory.updated_at,
            segmentCount: mostRecentStory.segment_count,
            isCompleted: mostRecentStory.is_completed
          };
          
          setRecoveryData(recoveryData);
          setShowRecoveryDialog(true);
        }
      } catch (error) {
        console.error('Error checking for unsaved stories:', error);
      } finally {
        setRecoveryChecked(true);
      }
    };

    checkForUnsavedStories();
  }, [recoveryChecked]);

  // Handle recovery
  const handleRecover = async (): Promise<boolean> => {
    if (!recoveryData) return false;

    try {
      // Get the story from IndexedDB
      const story = await getStory(recoveryData.storyId);
      
      if (!story) {
        console.error('Story not found in IndexedDB');
        return false;
      }

      // If user is authenticated, sync the story
      if (user) {
        // Update the user_id if not set
        if (!story.user_id) {
          story.user_id = user.id;
        }
        
        // Sync the story
        await syncService.syncAll();
      }

      return true;
    } catch (error) {
      console.error('Error recovering story:', error);
      return false;
    }
  };

  // Handle discard
  const handleDiscard = async (): Promise<boolean> => {
    if (!recoveryData) return false;

    try {
      // Delete the story from IndexedDB
      await deleteStory(recoveryData.storyId);
      
      setRecoveryData(null);
      return true;
    } catch (error) {
      console.error('Error discarding story:', error);
      return false;
    }
  };

  // Register exit detection handler
  useEffect(() => {
    // Initialize exit detection
    exitDetection.init();
    
    return () => {
      exitDetection.cleanup();
    };
  }, []);

  return {
    recoveryData,
    showRecoveryDialog,
    setShowRecoveryDialog,
    handleRecover,
    handleDiscard
  };
};