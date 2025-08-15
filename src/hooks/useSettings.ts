import { useState, useEffect } from 'react';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  notifications: 'all' | 'important' | 'none';
  soundEffects: boolean;
  autoScroll: boolean;
  scrollSpeed: number;
  chapterTransition: 'fade' | 'slide' | 'none';
  showImageCaptions: boolean;
  textToSpeech: boolean;
}

const defaultSettings: Settings = {
  theme: 'system',
  fontSize: 'medium',
  highContrast: false,
  notifications: 'important',
  soundEffects: false,
  autoScroll: false,
  scrollSpeed: 5,
  chapterTransition: 'fade',
  showImageCaptions: false,
  textToSpeech: false,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('tale-forge-settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('tale-forge-settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    }
  }, [settings, isLoading]);

  // Update specific settings
  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // Reset to default settings
  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  // Apply theme to document
  useEffect(() => {
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      document.documentElement.classList.toggle('dark', mediaQuery.matches);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    }
  }, [settings.theme]);

  // Apply font size to document
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--font-size-multiplier', 
      settings.fontSize === 'small' ? '0.875' : 
      settings.fontSize === 'large' ? '1.125' : '1'
    );
  }, [settings.fontSize]);

  // Apply high contrast mode
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
  }, [settings.highContrast]);

  return {
    settings,
    updateSettings,
    resetToDefaults,
    isLoading,
  };
};
