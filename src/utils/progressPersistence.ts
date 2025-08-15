/**
 * Comprehensive Progress Persistence for TaleForge
 * Saves and restores story progress, current chapter, and user choices across page refreshes
 */

export interface StoryProgress {
  storyId: string;
  currentChapterIndex: number;
  storySegments: any[];
  userChoices: string[];
  lastUpdated: string;
  isCompleted: boolean;
  storyTitle: string;
  genre: string;
  prompt: string;
}

export interface GlobalProgressState {
  currentStoryId: string | null;
  currentChapterIndex: number;
  storyProgress: Record<string, StoryProgress>;
  lastActiveStory: string | null;
  apiUsageCount: number;
  userPreferences: {
    skipImage: boolean;
    skipAudio: boolean;
    autoSave: boolean;
  };
}

const STORAGE_KEYS = {
  GLOBAL_PROGRESS: 'taleforge-global-progress',
  STORY_PROGRESS: 'taleforge-story-progress',
  USER_PREFERENCES: 'taleforge-user-preferences',
  ANONYMOUS_STORIES: 'anonymous_story_ids',
  ANONYMOUS_METADATA: 'anonymous_story_metadata'
};

/**
 * Save story progress to localStorage
 */
export const saveStoryProgress = (progress: StoryProgress): void => {
  try {
    // Save individual story progress
    const storyProgress = getStoryProgress();
    storyProgress[progress.storyId] = {
      ...progress,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.STORY_PROGRESS, JSON.stringify(storyProgress));

    // Update global progress state
    const globalProgress = getGlobalProgress();
    globalProgress.currentStoryId = progress.storyId;
    globalProgress.currentChapterIndex = progress.currentChapterIndex;
    globalProgress.lastActiveStory = progress.storyId;
    globalProgress.storyProgress = storyProgress;
    localStorage.setItem(STORAGE_KEYS.GLOBAL_PROGRESS, JSON.stringify(globalProgress));

    console.log('💾 Progress saved for story:', progress.storyId);
  } catch (error) {
    console.error('❌ Failed to save story progress:', error);
  }
};

/**
 * Load story progress from localStorage
 */
export const loadStoryProgress = (storyId: string): StoryProgress | null => {
  try {
    const storyProgress = getStoryProgress();
    return storyProgress[storyId] || null;
  } catch (error) {
    console.error('❌ Failed to load story progress:', error);
    return null;
  }
};

/**
 * Get all story progress
 */
export const getStoryProgress = (): Record<string, StoryProgress> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STORY_PROGRESS);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('❌ Failed to get story progress:', error);
    return {};
  }
};

/**
 * Get global progress state
 */
export const getGlobalProgress = (): GlobalProgressState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GLOBAL_PROGRESS);
    return stored ? JSON.parse(stored) : {
      currentStoryId: null,
      currentChapterIndex: 0,
      storyProgress: {},
      lastActiveStory: null,
      apiUsageCount: 0,
      userPreferences: {
        skipImage: false,
        skipAudio: false,
        autoSave: true
      }
    };
  } catch (error) {
    console.error('❌ Failed to get global progress:', error);
    return {
      currentStoryId: null,
      currentChapterIndex: 0,
      storyProgress: {},
      lastActiveStory: null,
      apiUsageCount: 0,
      userPreferences: {
        skipImage: false,
        skipAudio: false,
        autoSave: true
      }
    };
  }
};

/**
 * Save global progress state
 */
export const saveGlobalProgress = (progress: Partial<GlobalProgressState>): void => {
  try {
    const current = getGlobalProgress();
    const updated = { ...current, ...progress };
    localStorage.setItem(STORAGE_KEYS.GLOBAL_PROGRESS, JSON.stringify(updated));
  } catch (error) {
    console.error('❌ Failed to save global progress:', error);
  }
};

/**
 * Update current chapter index
 */
export const updateCurrentChapter = (storyId: string, chapterIndex: number): void => {
  try {
    const storyProgress = getStoryProgress();
    if (storyProgress[storyId]) {
      storyProgress[storyId].currentChapterIndex = chapterIndex;
      storyProgress[storyId].lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.STORY_PROGRESS, JSON.stringify(storyProgress));
    }

    // Update global state
    const globalProgress = getGlobalProgress();
    globalProgress.currentStoryId = storyId;
    globalProgress.currentChapterIndex = chapterIndex;
    localStorage.setItem(STORAGE_KEYS.GLOBAL_PROGRESS, JSON.stringify(globalProgress));
  } catch (error) {
    console.error('❌ Failed to update current chapter:', error);
  }
};

/**
 * Add user choice to story progress
 */
export const addUserChoice = (storyId: string, choice: string): void => {
  try {
    const storyProgress = getStoryProgress();
    if (storyProgress[storyId]) {
      storyProgress[storyId].userChoices.push(choice);
      storyProgress[storyId].lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.STORY_PROGRESS, JSON.stringify(storyProgress));
    }
  } catch (error) {
    console.error('❌ Failed to add user choice:', error);
  }
};

/**
 * Add story segment to progress
 */
export const addStorySegment = (storyId: string, segment: any): void => {
  try {
    const storyProgress = getStoryProgress();
    if (storyProgress[storyId]) {
      storyProgress[storyId].storySegments.push(segment);
      storyProgress[storyId].lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.STORY_PROGRESS, JSON.stringify(storyProgress));
    }
  } catch (error) {
    console.error('❌ Failed to add story segment:', error);
  }
};

/**
 * Mark story as completed
 */
export const markStoryCompleted = (storyId: string): void => {
  try {
    const storyProgress = getStoryProgress();
    if (storyProgress[storyId]) {
      storyProgress[storyId].isCompleted = true;
      storyProgress[storyId].lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.STORY_PROGRESS, JSON.stringify(storyProgress));
    }
  } catch (error) {
    console.error('❌ Failed to mark story completed:', error);
  }
};

/**
 * Save user preferences
 */
export const saveUserPreferences = (preferences: Partial<GlobalProgressState['userPreferences']>): void => {
  try {
    const globalProgress = getGlobalProgress();
    globalProgress.userPreferences = { ...globalProgress.userPreferences, ...preferences };
    localStorage.setItem(STORAGE_KEYS.GLOBAL_PROGRESS, JSON.stringify(globalProgress));
  } catch (error) {
    console.error('❌ Failed to save user preferences:', error);
  }
};

/**
 * Get user preferences
 */
export const getUserPreferences = (): GlobalProgressState['userPreferences'] => {
  try {
    const globalProgress = getGlobalProgress();
    return globalProgress.userPreferences;
  } catch (error) {
    console.error('❌ Failed to get user preferences:', error);
    return {
      skipImage: false,
      skipAudio: false,
      autoSave: true
    };
  }
};

/**
 * Clear story progress
 */
export const clearStoryProgress = (storyId: string): void => {
  try {
    const storyProgress = getStoryProgress();
    delete storyProgress[storyId];
    localStorage.setItem(STORAGE_KEYS.STORY_PROGRESS, JSON.stringify(storyProgress));

    // Update global state if this was the current story
    const globalProgress = getGlobalProgress();
    if (globalProgress.currentStoryId === storyId) {
      globalProgress.currentStoryId = null;
      globalProgress.currentChapterIndex = 0;
      localStorage.setItem(STORAGE_KEYS.GLOBAL_PROGRESS, JSON.stringify(globalProgress));
    }
  } catch (error) {
    console.error('❌ Failed to clear story progress:', error);
  }
};

/**
 * Clear all progress (for logout or reset)
 */
export const clearAllProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.GLOBAL_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.STORY_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
    console.log('🧹 All progress cleared');
  } catch (error) {
    console.error('❌ Failed to clear all progress:', error);
  }
};

/**
 * Get last active story
 */
export const getLastActiveStory = (): string | null => {
  try {
    const globalProgress = getGlobalProgress();
    return globalProgress.lastActiveStory;
  } catch (error) {
    console.error('❌ Failed to get last active story:', error);
    return null;
  }
};

/**
 * Check if story progress exists
 */
export const hasStoryProgress = (storyId: string): boolean => {
  try {
    const storyProgress = getStoryProgress();
    return !!storyProgress[storyId];
  } catch (error) {
    console.error('❌ Failed to check story progress:', error);
    return false;
  }
};

/**
 * Get progress summary for all stories
 */
export const getProgressSummary = (): Array<{
  storyId: string;
  title: string;
  chapterCount: number;
  isCompleted: boolean;
  lastUpdated: string;
}> => {
  try {
    const storyProgress = getStoryProgress();
    return Object.entries(storyProgress).map(([storyId, progress]) => ({
      storyId,
      title: progress.storyTitle,
      chapterCount: progress.storySegments.length,
      isCompleted: progress.isCompleted,
      lastUpdated: progress.lastUpdated
    }));
  } catch (error) {
    console.error('❌ Failed to get progress summary:', error);
    return [];
  }
}; 