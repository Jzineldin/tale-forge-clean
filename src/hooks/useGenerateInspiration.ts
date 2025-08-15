import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseGenerateInspirationReturn {
  generateNewPrompts: (genre: string, age?: string) => Promise<string[]>;
  isGenerating: boolean;
  error: string | null;
}

export const useGenerateInspiration = (): UseGenerateInspirationReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateNewPrompts = async (genre: string, age?: string): Promise<string[]> => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-inspiration-prompts', {
        body: { genre, age }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data || !data.prompts || !Array.isArray(data.prompts)) {
        throw new Error('Invalid response from AI service');
      }

      return data.prompts;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate new prompts';
      setError(errorMessage);
      console.error('Error generating inspiration prompts:', err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateNewPrompts,
    isGenerating,
    error
  };
}; 