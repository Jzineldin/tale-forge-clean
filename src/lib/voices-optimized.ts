// Optimized Voice Loading System
// This replaces the large static import with dynamic loading

export interface Voice {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female';
  accent?: string;
  category: string;
  preview_url?: string;
}

// Essential voices for immediate loading (small subset)
export const ESSENTIAL_VOICES: Voice[] = [
  {
    id: 'A9evEp8yGjv4c3WsIKuY',
    name: 'Kevin - Founder',
    description: 'Warm, friendly voice perfect for storytelling',
    gender: 'male',
    category: 'storyteller'
  },
  {
    id: 'fCxG8OHm4STbIsWe4aT9',
    name: 'Rachel',
    description: 'Clear, expressive voice ideal for children\'s stories',
    gender: 'female',
    category: 'storyteller'
  },
  {
    id: 'pFQStpMdprGFILRDrWR2',
    name: 'Domi',
    description: 'Confident, engaging voice for adventure stories',
    gender: 'female',
    category: 'storyteller'
  },
  {
    id: '8quEMRkSpwEaWBzHvTLv',
    name: 'Bella',
    description: 'Gentle, soothing voice perfect for bedtime stories',
    gender: 'female',
    category: 'storyteller'
  },
  {
    id: 'XXphLKNRxvJ1Qa95KBhX',
    name: 'Antoni',
    description: 'Warm, deep voice perfect for dramatic storytelling',
    gender: 'male',
    category: 'storyteller'
  },
  {
    id: 'IsEXLHzSvLH9UMB6SLHj',
    name: 'Arnold',
    description: 'Strong, confident voice ideal for action stories',
    gender: 'male',
    category: 'storyteller'
  },
  {
    id: 'FWipwLM0YqCuwisLprpU',
    name: 'Adam',
    description: 'Clear, versatile voice suitable for any story type',
    gender: 'male',
    category: 'storyteller'
  },
  {
    id: 'LfjSv1XCdZ96k4B1jNJl',
    name: 'Sam',
    description: 'Friendly, engaging voice perfect for children\'s content',
    gender: 'male',
    category: 'storyteller'
  }
];

// Voice loading state management
let fullVoicesCache: Voice[] | null = null;
let loadingPromise: Promise<Voice[]> | null = null;

/**
 * Load the full voice list dynamically
 * This reduces initial bundle size by loading voices on demand
 */
export async function loadFullVoiceList(): Promise<Voice[]> {
  // Return cached voices if available
  if (fullVoicesCache) {
    return fullVoicesCache;
  }

  // Return existing promise if already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start loading voices
  loadingPromise = (async () => {
    try {
      console.log('🎵 Loading full voice list...');
      
      // Try to load from external JSON file first (if it exists)
      try {
        const response = await fetch('/voices-data.json');
        if (response.ok) {
          const voices = await response.json();
          fullVoicesCache = voices;
          console.log(`✅ Loaded ${voices.length} voices from external file`);
          return voices;
        }
      } catch (error) {
        console.log('External voices file not found, falling back to dynamic import');
      }

      // Fallback to dynamic import (code splitting)
      const { STORYTELLER_VOICES } = await import('./voices');
      // Add category field and normalize gender to match Voice interface
      fullVoicesCache = STORYTELLER_VOICES.map(voice => ({
        ...voice,
        gender: voice.gender.toLowerCase() as 'male' | 'female',
        category: 'storyteller' // Default category
      }));
      console.log(`✅ Loaded ${fullVoicesCache.length} voices via dynamic import`);
      return fullVoicesCache;
      
    } catch (error) {
      console.error('❌ Failed to load full voice list:', error);
      // Fallback to essential voices
      fullVoicesCache = ESSENTIAL_VOICES;
      return ESSENTIAL_VOICES;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

/**
 * Get voices with progressive loading
 * Returns essential voices immediately, then loads full list
 */
export function getVoices(): Voice[] {
  return fullVoicesCache || ESSENTIAL_VOICES;
}

/**
 * Check if full voice list is loaded
 */
export function isFullVoiceListLoaded(): boolean {
  return fullVoicesCache !== null && fullVoicesCache.length > ESSENTIAL_VOICES.length;
}

/**
 * Find a voice by ID (searches both essential and full lists)
 */
export function findVoiceById(id: string): Voice | undefined {
  const voices = getVoices();
  return voices.find(voice => voice.id === id);
}

/**
 * Play voice test audio
 */
export async function playVoiceTest(voiceId: string, text?: string): Promise<void> {
  // This function can be implemented to test voice playback
  console.log(`🎵 Testing voice ${voiceId} with text: ${text}`);
}

// Export for backwards compatibility
export const STORYTELLER_VOICES = ESSENTIAL_VOICES;

// Default export for easy importing
export default {
  loadFullVoiceList,
  getVoices,
  isFullVoiceListLoaded,
  findVoiceById,
  playVoiceTest,
  ESSENTIAL_VOICES,
  STORYTELLER_VOICES: ESSENTIAL_VOICES
};