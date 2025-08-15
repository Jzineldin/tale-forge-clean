
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProviderSettings {
  textProviders: {
    primary: string;
    fallback: string;
    wordCount: { min: number; max: number };
    geminiSettings: {
      model: string;
      temperature: number;
    };
    openaiSettings: {
      model: string;
      temperature: number;
    };
    ovhSettings: {
      model: string;
      temperature: number;
      max_tokens: number;
    };
  };
  imageProviders: {
    primary: string;
    fallback: string;
    huggingFaceSettings: {
      model: string;
      steps: number;
      guidance_scale: number;
      width: number;
      height: number;
    };
    stableDiffusionSettings: {
      steps: number;
      dimensions: string;
    };
    dalleSettings: {
      model: string;
      quality: string;
      size: string;
    };
    replicateSettings: {
      model: string;
      steps: number;
      aspect_ratio: string;
      output_format: string;
    };
    ovhSettings: {
      model: string;
      negative_prompt: string;
    };
  };
  ttsProviders: {
    primary: string;
    voice: string;
    speed: number;
  };
}

const defaultSettings: ProviderSettings = {
  textProviders: {
    primary: 'ovh',  // Changed default to OVH Qwen2.5
    fallback: 'openai',
    wordCount: { min: 120, max: 200 },
    geminiSettings: {
      model: 'gemini-1.5-flash-latest',
      temperature: 0.7,
    },
    openaiSettings: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
    },
    ovhSettings: {
      model: 'qwen2.5-coder-32b-instruct',
      temperature: 0.7,
      max_tokens: 1500,
    },
  },
  imageProviders: {
    primary: 'openai',
    fallback: 'replicate',
    huggingFaceSettings: {
      model: 'black-forest-labs/FLUX.1-schnell',
      steps: 4,
      guidance_scale: 0.0,
      width: 1024,
      height: 1024,
    },
    stableDiffusionSettings: {
      steps: 20,
      dimensions: '1024x1024',
    },
    dalleSettings: {
      model: 'dall-e-3',
      quality: 'standard',
      size: '1024x1024',
    },
    replicateSettings: {
      model: 'flux-schnell',
      steps: 4,
      aspect_ratio: '1:1',
      output_format: 'webp',
    },
    ovhSettings: {
      model: 'sdxl',
      negative_prompt: 'Ugly, blurry, low quality',
    },
  },
  ttsProviders: {
    primary: 'openai',
    voice: 'fable',
    speed: 1.0,
  },
};

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<ProviderSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['text_providers', 'image_providers', 'tts_providers']);

      if (data && data.length > 0) {
        const loadedSettings = { ...defaultSettings };
        data.forEach(setting => {
          if (setting.key === 'text_providers' && setting.value) {
            try {
              const parsedValue = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
              loadedSettings.textProviders = { ...loadedSettings.textProviders, ...parsedValue };
            } catch (e) {
              console.warn('Failed to parse text_providers setting:', e);
            }
          } else if (setting.key === 'image_providers' && setting.value) {
            try {
              const parsedValue = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
              loadedSettings.imageProviders = { ...loadedSettings.imageProviders, ...parsedValue };
            } catch (e) {
              console.warn('Failed to parse image_providers setting:', e);
            }
          } else if (setting.key === 'tts_providers' && setting.value) {
            try {
              const parsedValue = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
              loadedSettings.ttsProviders = { ...loadedSettings.ttsProviders, ...parsedValue };
            } catch (e) {
              console.warn('Failed to parse tts_providers setting:', e);
            }
          }
        });
        setSettings(loadedSettings);
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Error loading settings:', errorMessage);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return { settings, setSettings, loading };
};
