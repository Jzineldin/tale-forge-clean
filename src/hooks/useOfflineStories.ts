import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  // OfflineStory, 
  getAllStories,
  getStoriesByUserId, 
  updateStory, 
  deleteStory as deleteOfflineStory 
} from '@/lib/storage/indexedDB';
import { useAuth } from '@/context/AuthProvider';
import { useSyncService } from '@/lib/sync/syncService';
import { useNetworkMonitor } from '@/lib/network/networkMonitor';
import { toast } from 'sonner';

/**
 * Hook for fetching and managing offline stories from IndexedDB
 */
export const useOfflineStories = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const syncService = useSyncService();
  const networkMonitor = useNetworkMonitor();
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize sync service
  useEffect(() => {
    syncService.init();
    
    return () => {
      syncService.cleanup();
    };
  }, []);

  // Fetch offline stories from IndexedDB
  const { 
    data: offlineStories = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['offline-stories', user?.id || 'anonymous'],
    queryFn: async () => {
      try {
        // If user is logged in, get stories for that user
        if (user) {
          return await getStoriesByUserId(user.id);
        } 
        // Otherwise get all stories (for anonymous users)
        else {
          return await getAllStories();
        }
      } catch (error) {
        console.error('Error fetching offline stories:', error);
        return [];
      }
    },
    // Refresh every 30 seconds to catch any changes
    refetchInterval: 30000,
  });

  // Sync all offline stories with the server
  const syncOfflineStories = async () => {
    if (!networkMonitor.isOnline()) {
      toast.error('Cannot sync while offline');
      return { success: false };
    }

    if (isSyncing) {
      toast.info('Sync already in progress');
      return { success: false };
    }

    setIsSyncing(true);
    toast.info('Syncing stories...');

    try {
      const result = await syncService.syncAll();
      
      if (result.success) {
        toast.success(`Synced ${result.syncedStories} stories successfully`);
        // Refresh the stories list after sync
        refetch();
        // Also refresh online stories
        queryClient.invalidateQueries({ queryKey: ['stories'] });
      } else {
        toast.error(`Sync failed with ${result.errors.length} errors`);
      }
      
      return result;
    } catch (error) {
      console.error('Error syncing stories:', error);
      toast.error('Failed to sync stories');
      return { success: false };
    } finally {
      setIsSyncing(false);
    }
  };

  // Mark a story as synced in IndexedDB
  const markStorySynced = async (storyId: string, isSynced: boolean = true) => {
    try {
      const story = offlineStories.find(s => s.id === storyId);
      if (story) {
        await updateStory({
          ...story,
          is_synced: isSynced
        });
        refetch();
      }
    } catch (error) {
      console.error('Error marking story as synced:', error);
    }
  };

  // Delete an offline story
  const deleteStory = async (storyId: string) => {
    try {
      await deleteOfflineStory(storyId);
      toast.success('Story deleted from offline storage');
      refetch();
    } catch (error) {
      console.error('Error deleting offline story:', error);
      toast.error('Failed to delete story');
    }
  };

  return {
    offlineStories,
    isLoading,
    error,
    isSyncing,
    syncOfflineStories,
    markStorySynced,
    deleteStory,
    refetch
  };
};