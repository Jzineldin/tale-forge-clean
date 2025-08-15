import { supabase } from '@/integrations/supabase/client';

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
 * Enhanced autosave utility for comprehensive data persistence
 * Handles story progress, form data, and session state
 */
export const autosaveStoryProgress = async (data: AutosaveData): Promise<'success' | 'error'> => {
  try {
    console.log('💾 Autosaving story progress:', data);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Authenticated user - ensure story is saved to database
      await autosaveForAuthenticatedUser(data, user.id);
    } else {
      // Anonymous user - save to localStorage
      await autosaveForAnonymousUser(data);
    }
    
    // Always save to session storage for immediate recovery
    await autosaveToSessionStorage(data);
    
    console.log('✅ Autosave completed successfully');
    return 'success';
  } catch (error) {
    console.error('❌ Autosave failed:', error);
    // Don't show error toast to user - autosave should be silent
    return 'error';
  }
};

/**
 * Autosave form data to localStorage
 */
export const autosaveFormData = (formData: FormAutosaveData): void => {
  try {
    const key = 'taleforge_form_autosave';
    const timestamp = new Date().toISOString();
    
    const dataToSave = {
      ...formData,
      timestamp,
      lastSaved: timestamp
    };
    
    localStorage.setItem(key, JSON.stringify(dataToSave));
    console.log('💾 Form data autosaved:', formData);
  } catch (error) {
    console.error('❌ Form autosave failed:', error);
  }
};

/**
 * Restore form data from localStorage
 */
export const restoreFormData = (): FormAutosaveData | null => {
  try {
    const key = 'taleforge_form_autosave';
    const saved = localStorage.getItem(key);
    
    if (saved) {
      const data = JSON.parse(saved);
      const lastSaved = new Date(data.lastSaved);
      const now = new Date();
      const hoursSinceLastSave = (now.getTime() - lastSaved.getTime()) / (1000 * 60 * 60);
      
      // Only restore if saved within last 24 hours
      if (hoursSinceLastSave < 24) {
        console.log('💾 Form data restored:', data);
        return data;
      } else {
        // Clear old data
        localStorage.removeItem(key);
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Form restore failed:', error);
    return null;
  }
};

/**
 * Autosave session state
 */
export const autosaveSessionState = (sessionData: SessionAutosaveData): void => {
  try {
    const key = 'taleforge_session_state';
    const timestamp = new Date().toISOString();
    
    const dataToSave = {
      ...sessionData,
      timestamp,
      lastSaved: timestamp
    };
    
    sessionStorage.setItem(key, JSON.stringify(dataToSave));
    console.log('💾 Session state autosaved');
  } catch (error) {
    console.error('❌ Session autosave failed:', error);
  }
};

/**
 * Restore session state
 */
export const restoreSessionState = (): SessionAutosaveData | null => {
  try {
    const key = 'taleforge_session_state';
    const saved = sessionStorage.getItem(key);
    
    if (saved) {
      const data = JSON.parse(saved);
      console.log('💾 Session state restored');
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Session restore failed:', error);
    return null;
  }
};

/**
 * Clear all autosaved data
 */
export const clearAutosavedData = (): void => {
  try {
    localStorage.removeItem('taleforge_form_autosave');
    sessionStorage.removeItem('taleforge_session_state');
    console.log('💾 Autosaved data cleared');
  } catch (error) {
    console.error('❌ Clear autosave failed:', error);
  }
};

/**
 * Autosave for authenticated users - ensure story is in database
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

/**
 * Autosave for anonymous users - track story ID in localStorage
 */
const autosaveForAnonymousUser = async (data: AutosaveData): Promise<void> => {
  try {
    // Get existing anonymous story IDs
    const existingIds = JSON.parse(localStorage.getItem('anonymous_story_ids') || '[]');
    
    // Add story ID if not already present
    if (!existingIds.includes(data.storyId)) {
      existingIds.push(data.storyId);
      localStorage.setItem('anonymous_story_ids', JSON.stringify(existingIds));
      
      // Also save story metadata for better UX
      const storyMetadata = JSON.parse(localStorage.getItem('anonymous_story_metadata') || '{}');
      storyMetadata[data.storyId] = {
        title: data.storyTitle || 'Untitled Story',
        segmentCount: data.segmentCount,
        isCompleted: data.isEnd || false,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('anonymous_story_metadata', JSON.stringify(storyMetadata));
    } else {
      // Update existing story metadata
      const storyMetadata = JSON.parse(localStorage.getItem('anonymous_story_metadata') || '{}');
      if (storyMetadata[data.storyId]) {
        storyMetadata[data.storyId] = {
          ...storyMetadata[data.storyId],
          segmentCount: data.segmentCount,
          isCompleted: data.isEnd || false,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('anonymous_story_metadata', JSON.stringify(storyMetadata));
      }
    }
  } catch (error) {
    console.error('Error autosaving for anonymous user:', error);
    throw error;
  }
};

/**
 * Autosave to session storage for immediate recovery
 */
const autosaveToSessionStorage = async (data: AutosaveData): Promise<void> => {
  try {
    const key = `taleforge_story_${data.storyId}`;
    const timestamp = new Date().toISOString();
    
    const sessionData = {
      ...data,
      timestamp,
      lastSaved: timestamp
    };
    
    sessionStorage.setItem(key, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Error autosaving to session storage:', error);
  }
};

/**
 * Enhanced hook for using autosave functionality
 */
export const useAutosave = () => {
  const autosave = async (data: AutosaveData): Promise<'success' | 'error'> => {
    return await autosaveStoryProgress(data);
  };
  
  const saveFormData = (formData: FormAutosaveData) => {
    autosaveFormData(formData);
  };
  
  const saveSessionState = (sessionData: SessionAutosaveData) => {
    autosaveSessionState(sessionData);
  };
  
  const restoreForm = () => {
    return restoreFormData();
  };
  
  const restoreSession = () => {
    return restoreSessionState();
  };
  
  const clearData = () => {
    clearAutosavedData();
  };
  
  return { 
    autosave, 
    saveFormData, 
    saveSessionState, 
    restoreForm, 
    restoreSession, 
    clearData 
  };
}; 