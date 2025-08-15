import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UsePromptSeedsReturn {
  mutateSeeds: (age: string, genre: string, userSeed?: string) => Promise<string[]>;
  isGenerating: boolean;
  error: string | null;
}

export const usePromptSeeds = (): UsePromptSeedsReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutateSeeds = async (age: string, genre: string, userSeed?: string): Promise<string[]> => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('[GS:LOG] RegenSeeds:age/genre/userSeed → seedKeys[]', { age, genre, userSeed });

      const { data, error: functionError } = await supabase.functions.invoke('regenerate-seeds', {
        body: { age, genre, userSeed }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data || !data.seeds || !Array.isArray(data.seeds)) {
        throw new Error('Invalid response from seed generation service');
      }

      return data.seeds;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate new seeds';
      setError(errorMessage);
      console.error('Error generating seeds:', err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    mutateSeeds,
    isGenerating,
    error
  };
}; 