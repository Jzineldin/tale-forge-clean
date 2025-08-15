/**
 * Secure autosave utilities using secureStorage instead of localStorage
 */

import { supabase } from '@/integrations/supabase/client';
import { secureStorage } from '@/services/secureStorage';

export interface AutosaveData {
  storyId: string;
  segmentId: string;
  storyTitle?: string;
  segmentCount: number;
  isEnd?: boolean;
}

export interface FormAutosaveData {
  prompt?: string;
  genre?: string;
  characterName?: string;
  storyMode?: string;
  skipImage?: boolean;
  skipAudio?: boolean;
  selectedVoice?: string;
}

export interface SessionAutosaveData {
  currentStoryId?: string;
  currentSegmentId?: string;
  storyHistory?: any[];
  gameState?: 'not_started' | 'playing' | 'completed';
  apiUsageCount?: number;
  lastActivity?: string;
}

/**
 * Enhanced autosave utility using secure storage
 */
export const secureAutosaveStoryProgress = async (data: AutosaveData): Promise<'success' | 'error'> => {
  try {
    console.log('💾 Secure autosaving story progress:', data);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Authenticated user - ensure story is saved to database
      await autosaveForAuthenticatedUser(data, user.id);
    } else {
      // Anonymous user - save to secure storage
      await secureAutosaveForAnonymousUser(data);
    }
    
    // Always save to session storage for immediate recovery
    await secureAutosaveToSessionStorage(data);
    
    console.log('✅ Secure autosave completed successfully');
    return 'success';
  } catch (error) {
    console.error('❌ Secure autosave failed:', error);
    return 'error';
  }
};

/**
 * Secure form data autosave
 */
export const secureAutosaveFormData = async (formData: FormAutosaveData): Promise<void> => {
  try {
    const key = 'taleforge_form_autosave';
    const timestamp = new Date().toISOString();
    
    const dataToSave = {
      ...formData,
      timestamp,
      lastSaved: timestamp
    };
    
    await secureStorage.setItem(key, dataToSave, { encrypt: true });
    console.log('💾 Form data securely autosaved:', formData);
  } catch (error) {
    console.error('❌ Secure form autosave failed:', error);
  }
};

/**
 * Restore form data from secure storage
 */
export const secureRestoreFormData = async (): Promise<FormAutosaveData | null> => {
  try {
    const key = 'taleforge_form_autosave';
    const saved = await secureStorage.getItem(key);
    
    if (saved) {
      const lastSaved = new Date(saved.lastSaved);
      const now = new Date();
      const hoursSinceLastSave = (now.getTime() - lastSaved.getTime()) / (1000 * 60 * 60);
      
      // Only restore if saved within last 24 hours
      if (hoursSinceLastSave < 24) {
        console.log('💾 Form data securely restored:', saved);
        return saved;
      } else {
        // Clear old data
        await secureStorage.removeItem(key);
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Secure form restore failed:', error);
    return null;
  }
};

/**
 * Secure session state autosave
 */
export const secureAutosaveSessionState = async (sessionData: SessionAutosaveData): Promise<void> => {
  try {
    const key = 'taleforge_session_state';
    const timestamp = new Date().toISOString();
    
    const dataToSave = {
      ...sessionData,
      timestamp,
      lastSaved: timestamp
    };
    
    await secureStorage.setItem(key, dataToSave, { encrypt: false, ttl: 24 * 60 * 60 * 1000 }); // 24 hours TTL
    console.log('💾 Session state securely autosaved');
  } catch (error) {
    console.error('❌ Secure session autosave failed:', error);
  }
};

/**
 * Restore session state from secure storage
 */
export const secureRestoreSessionState = async (): Promise<SessionAutosaveData | null> => {
  try {
    const key = 'taleforge_session_state';
    const saved = await secureStorage.getItem(key);
    
    if (saved) {
      console.log('💾 Session state securely restored');
      return saved;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Secure session restore failed:', error);
    return null;
  }
};

/**
 * Clear all securely autosaved data
 */
export const clearSecureAutosavedData = async (): Promise<void> => {
  try {
    await secureStorage.removeItem('taleforge_form_autosave');
    await secureStorage.removeItem('taleforge_session_state');
    console.log('💾 Secure autosaved data cleared');
  } catch (error) {
    console.error('❌ Clear secure autosave failed:', error);
  }
};

/**
 * Private helper functions
 */

const autosaveForAuthenticatedUser = async (data: AutosaveData, userId: string): Promise<void> => {
  try {
    // Check if story exists in database
    const { data: existingStory, error: checkError } = await supabase
      .from('stories')
      .select('id, user_id, is_completed')
      .eq('id', data.storyId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingStory) {
      // Story exists - update if needed
      const updates: any = {};
      
      // Update user ownership if not set
      if (!existingStory.user_id) {
        updates.user_id = userId;
      }
      
      // Update completion status if story ended
      if (data.isEnd && !existingStory.is_completed) {
        updates.is_completed = true;
      }
      
      // Update segment count
      updates.segment_count = data.segmentCount;
      
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('stories')
          .update(updates)
          .eq('id', data.storyId);
        
        if (updateError) throw updateError;
      }
    } else {
      // Story doesn't exist - create it
      const { error: createError } = await supabase
        .from('stories')
        .insert({
          id: data.storyId,
          title: data.storyTitle || 'Untitled Story',
          user_id: userId,
          is_completed: data.isEnd || false,
          segment_count: data.segmentCount,
          story_mode: 'fantasy' // Default, can be updated later
        });
      
      if (createError) throw createError;
    }
  } catch (error) {
    console.error('Error autosaving for authenticated user:', error);
    throw error;
  }
};

const secureAutosaveForAnonymousUser = async (data: AutosaveData): Promise<void> => {
  try {
    // Get existing anonymous story IDs from secure storage
    const existingIds = await secureStorage.getItem('anonymous_story_ids') || [];
    
    // Add story ID if not already present
    if (!existingIds.includes(data.storyId)) {
      existingIds.push(data.storyId);
      await secureStorage.setItem('anonymous_story_ids', existingIds, { encrypt: true });
      
      // Also save story metadata for better UX
      const storyMetadata = await secureStorage.getItem('anonymous_story_metadata') || {};
      storyMetadata[data.storyId] = {
        title: data.storyTitle || 'Untitled Story',
        segmentCount: data.segmentCount,
        isCompleted: data.isEnd || false,
        lastUpdated: new Date().toISOString()
      };
      await secureStorage.setItem('anonymous_story_metadata', storyMetadata, { encrypt: true });
    } else {
      // Update existing story metadata
      const storyMetadata = await secureStorage.getItem('anonymous_story_metadata') || {};
      if (storyMetadata[data.storyId]) {
        storyMetadata[data.storyId] = {
          ...storyMetadata[data.storyId],
          segmentCount: data.segmentCount,
          isCompleted: data.isEnd || false,
          lastUpdated: new Date().toISOString()
        };
        await secureStorage.setItem('anonymous_story_metadata', storyMetadata, { encrypt: true });
      }
    }
  } catch (error) {
    console.error('Error secure autosaving for anonymous user:', error);
    throw error;
  }
};

const secureAutosaveToSessionStorage = async (data: AutosaveData): Promise<void> => {
  try {
    const key = `taleforge_story_${data.storyId}`;
    const timestamp = new Date().toISOString();
    
    const sessionData = {
      ...data,
      timestamp,
      lastSaved: timestamp
    };
    
    await secureStorage.setItem(key, sessionData, { ttl: 8 * 60 * 60 * 1000 }); // 8 hours TTL
  } catch (error) {
    console.error('Error secure autosaving to session storage:', error);
  }
};