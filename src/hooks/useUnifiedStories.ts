import { useAuth } from '@/context/AuthProvider';
import { useMyStories } from './useMyStories';
import { useAnonymousStories } from './useAnonymousStories';
import { useOfflineStories } from './useOfflineStories';
import { Story } from '@/types/stories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNetworkMonitor } from '@/lib/network/networkMonitor';

export const useUnifiedStories = () => {
  const { user, loading: authLoading } = useAuth();
  const networkMonitor = useNetworkMonitor();
  
  // Get user stories if authenticated
  const {
    stories: userStories = [],
    isLoading: userStoriesLoading,
    error: userStoriesError,
    handleRefresh: refreshUserStories,
    isRealtimeConnected
  } = useMyStories();

  // Get anonymous stories if not authenticated
  const {
    stories: anonymousStories = [],
    isLoading: anonymousStoriesLoading,
    error: anonymousStoriesError,
    handleRefresh: refreshAnonymousStories,
    removeAnonymousStory
  } = useAnonymousStories(authLoading, user);

  // Get offline stories from IndexedDB
  const {
    offlineStories = [],
    isLoading: offlineStoriesLoading,
    error: offlineStoriesError,
    isSyncing,
    syncOfflineStories,
    markStorySynced,
    deleteStory: deleteOfflineStory,
    refetch: refreshOfflineStories
  } = useOfflineStories();

  // Combine stories and loading states
  const isLoading = authLoading || 
    (user ? userStoriesLoading : anonymousStoriesLoading) || 
    offlineStoriesLoading;
  
  const error = user ? userStoriesError : (anonymousStoriesError || offlineStoriesError);

  // Merge stories from different sources, prioritizing online versions
  const stories: Story[] = (() => {
    // Start with the appropriate base stories
    const baseStories = user ? userStories : anonymousStories;
    
    // If there are no offline stories, just return the base stories
    if (!offlineStories.length) {
      return baseStories;
    }

    // Create a map of story IDs from base stories for quick lookup
    const baseStoryIds = new Set(baseStories.map(story => story.id));
    
    // Filter offline stories to only include those not in base stories
    const uniqueOfflineStories = offlineStories.filter(story => !baseStoryIds.has(story.id));
    
    // Combine base stories with unique offline stories
    return [...baseStories, ...uniqueOfflineStories];
  })();

  const handleRefresh = () => {
    if (user) {
      refreshUserStories();
    } else {
      refreshAnonymousStories();
    }
    refreshOfflineStories();
  };

  const syncStories = async () => {
    if (!networkMonitor.isOnline()) {
      toast.error('Cannot sync while offline');
      return { success: false };
    }
    
    return await syncOfflineStories();
  };

  const deleteStory = async (storyId: string) => {
    try {
      if (user) {
        // Check if story exists in offline storage
        const offlineStory = offlineStories.find(s => s.id === storyId);
        if (offlineStory) {
          await deleteOfflineStory(storyId);
        }

        // Delete from database for authenticated users
        const { error } = await supabase
          .from('stories')
          .delete()
          .eq('id', storyId);

        if (error) throw error;
        
        toast.success('Story deleted successfully');
        refreshUserStories();
        refreshOfflineStories();
      } else {
        // Remove from local storage for anonymous users
        removeAnonymousStory(storyId);
        
        // Also check if it exists in offline storage
        const offlineStory = offlineStories.find(s => s.id === storyId);
        if (offlineStory) {
          await deleteOfflineStory(storyId);
        }
        
        toast.success('Story removed from your local collection');
        refreshOfflineStories();
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Failed to delete story');
    }
  };

  return {
    stories,
    isLoading,
    error,
    authLoading,
    isRealtimeConnected: user ? isRealtimeConnected : true,
    isSyncing,
    handleRefresh,
    syncStories,
    deleteStory,
    markStorySynced,
    user,
    isOnline: networkMonitor.isOnline()
  };
};