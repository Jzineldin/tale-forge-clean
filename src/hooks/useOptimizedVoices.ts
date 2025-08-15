/**
 * Optimized Voice Loading Hook
 * Provides progressive voice loading with caching
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Voice, 
  ESSENTIAL_VOICES, 
  loadFullVoiceList, 
  isFullVoiceListLoaded 
} from '@/lib/voices-optimized';
import { secureConsole as logger } from '@/utils/secureLogger';

interface UseOptimizedVoicesReturn {
  voices: Voice[];
  isLoading: boolean;
  isFullyLoaded: boolean;
  loadFullVoices: () => Promise<void>;
  findVoiceById: (id: string) => Voice | undefined;
  error: string | null;
}

/**
 * Hook for optimized voice loading with progressive enhancement
 */
export function useOptimizedVoices(): UseOptimizedVoicesReturn {
  const [voices, setVoices] = useState<Voice[]>(ESSENTIAL_VOICES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFullVoices = useCallback(async () => {
    if (isFullVoiceListLoaded() || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fullVoices = await loadFullVoiceList();
      setVoices(fullVoices);
      logger.info(`Loaded ${fullVoices.length} voices`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load voices';
      setError(errorMessage);
      logger.error('Voice loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const findVoiceById = useCallback((id: string): Voice | undefined => {
    return voices.find(voice => voice.id === id);
  }, [voices]);

  // Auto-load full voices after component mounts (non-blocking)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadFullVoices();
    }, 1000); // Delay to not block initial render

    return () => clearTimeout(timer);
  }, [loadFullVoices]);

  return {
    voices,
    isLoading,
    isFullyLoaded: isFullVoiceListLoaded(),
    loadFullVoices,
    findVoiceById,
    error
  };
}

/**
 * Hook for voice selection with optimized loading
 */
export function useVoiceSelection(initialVoiceId?: string) {
  const { voices, loadFullVoices, findVoiceById, isFullyLoaded } = useOptimizedVoices();
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(
    initialVoiceId || ESSENTIAL_VOICES[0]?.id || null
  );

  const selectedVoice = selectedVoiceId ? findVoiceById(selectedVoiceId) : null;

  const selectVoice = useCallback((voiceId: string) => {
    setSelectedVoiceId(voiceId);
    
    // If voice not found in current list, try loading full list
    if (!findVoiceById(voiceId) && !isFullyLoaded) {
      loadFullVoices();
    }
  }, [findVoiceById, isFullyLoaded, loadFullVoices]);

  return {
    voices,
    selectedVoice,
    selectedVoiceId,
    selectVoice,
    loadFullVoices
  };
}

export default useOptimizedVoices;