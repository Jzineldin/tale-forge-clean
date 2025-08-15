import React, { createContext, useContext, useReducer, useEffect, useState } from "react";

// Define types for our settings
export type ThemeOption = "light" | "dark" | "system";
export type FontSizeOption = "small" | "medium" | "large";
export type NotificationPreference = "all" | "important" | "none";
export type ChapterTransitionEffect = "fade" | "slide" | "none";

export interface UserPreferences {
  theme: ThemeOption;
  fontSize: FontSizeOption;
  highContrastMode: boolean;
  notificationPreferences: NotificationPreference;
  soundEffects: boolean;
}

export interface AccountSettings {
  emailNotifications: boolean;
  marketingEmails: boolean;
  profileVisibility: "public" | "private";
  twoFactorAuth: boolean;
}

export interface ReadingPreferences {
  autoScroll: boolean;
  autoScrollSpeed: number; // 1-10
  chapterTransitionEffect: ChapterTransitionEffect;
  showImageCaptions: boolean;
  textToSpeech: boolean;
}

export interface Settings {
  userPreferences: UserPreferences;
  accountSettings: AccountSettings;
  readingPreferences: ReadingPreferences;
}

// Define the initial state
const initialSettings: Settings = {
  userPreferences: {
    theme: "system",
    fontSize: "medium",
    highContrastMode: false,
    notificationPreferences: "important",
    soundEffects: true,
  },
  accountSettings: {
    emailNotifications: true,
    marketingEmails: false,
    profileVisibility: "public",
    twoFactorAuth: false,
  },
  readingPreferences: {
    autoScroll: false,
    autoScrollSpeed: 5,
    chapterTransitionEffect: "fade",
    showImageCaptions: true,
    textToSpeech: false,
  },
};

// Define action types
type ActionType =
  | { type: "UPDATE_USER_PREFERENCES"; payload: Partial<UserPreferences> }
  | { type: "UPDATE_ACCOUNT_SETTINGS"; payload: Partial<AccountSettings> }
  | { type: "UPDATE_READING_PREFERENCES"; payload: Partial<ReadingPreferences> }
  | { type: "RESET_SETTINGS" }
  | { type: "LOAD_SETTINGS"; payload: Settings };

// Create the reducer
const settingsReducer = (state: Settings, action: ActionType): Settings => {
  switch (action.type) {
    case "UPDATE_USER_PREFERENCES":
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.payload,
        },
      };
    case "UPDATE_ACCOUNT_SETTINGS":
      return {
        ...state,
        accountSettings: {
          ...state.accountSettings,
          ...action.payload,
        },
      };
    case "UPDATE_READING_PREFERENCES":
      return {
        ...state,
        readingPreferences: {
          ...state.readingPreferences,
          ...action.payload,
        },
      };
    case "RESET_SETTINGS":
      return initialSettings;
    case "LOAD_SETTINGS":
      return action.payload;
    default:
      return state;
  }
};

// Create the context
interface SettingsContextType {
  settings: Settings;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  updateAccountSettings: (settings: Partial<AccountSettings>) => Promise<void>;
  updateReadingPreferences: (preferences: Partial<ReadingPreferences>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Create the provider
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load from localStorage
        const localSettings = localStorage.getItem("storyCanvasSettings");
        
        if (localSettings) {
          try {
            const parsedSettings = JSON.parse(localSettings);
            dispatch({ type: "LOAD_SETTINGS", payload: parsedSettings });
          } catch (error) {
            console.error("Error parsing settings from localStorage:", error);
            // If there's an error parsing, use initial settings
            localStorage.removeItem("storyCanvasSettings");
          }
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error);
      } finally {
        // Mark initial load as complete
        setIsInitialLoad(false);
      }
      
      // TODO: In the future, implement Supabase integration by creating a user_settings table
      // This would require adding a migration to create the table with the following structure:
      // - id: uuid (primary key)
      // - user_id: uuid (foreign key to auth.users)
      // - settings: jsonb (to store the settings object)
      // - created_at: timestamp
      // - updated_at: timestamp
    };

    loadSettings();
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        // Save to localStorage
        localStorage.setItem("storyCanvasSettings", JSON.stringify(settings));
        
        // TODO: In the future, implement Supabase integration to save settings to the database
      } catch (error) {
        console.error("Error saving settings to localStorage:", error);
      }
    };

    // Don't save on initial load
    if (!isInitialLoad) {
      saveSettings();
    }
  }, [settings, isInitialLoad]);

  // Apply settings to the application
  useEffect(() => {
    // Apply theme
    const applyTheme = () => {
      const { theme } = settings.userPreferences;
      const root = window.document.documentElement;
      
      // Remove existing theme classes
      root.classList.remove('light-theme', 'dark-theme');
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(`${systemTheme}-theme`);
      } else {
        root.classList.add(`${theme}-theme`);
      }
    };
    
    // Apply font size
    const applyFontSize = () => {
      const { fontSize } = settings.userPreferences;
      const root = window.document.documentElement;
      
      // Remove existing font size classes
      root.classList.remove('text-small', 'text-medium', 'text-large');
      root.classList.add(`text-${fontSize}`);
    };
    
    // Apply high contrast mode
    const applyHighContrast = () => {
      const { highContrastMode } = settings.userPreferences;
      const root = window.document.documentElement;
      
      if (highContrastMode) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }
    };
    
    // Apply all settings
    applyTheme();
    applyFontSize();
    applyHighContrast();
    
    // Listen for system theme changes if using system theme
    if (settings.userPreferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    return undefined;
  }, [settings.userPreferences]);

  // Create the context value
  const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
    dispatch({ type: "UPDATE_USER_PREFERENCES", payload: preferences });
  };

  const updateAccountSettings = async (accountSettings: Partial<AccountSettings>) => {
    dispatch({ type: "UPDATE_ACCOUNT_SETTINGS", payload: accountSettings });
  };

  const updateReadingPreferences = async (preferences: Partial<ReadingPreferences>) => {
    dispatch({ type: "UPDATE_READING_PREFERENCES", payload: preferences });
  };

  const resetSettings = async () => {
    dispatch({ type: "RESET_SETTINGS" });
  };

  const contextValue: SettingsContextType = {
    settings,
    updateUserPreferences,
    updateAccountSettings,
    updateReadingPreferences,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

// Create a hook to use the context
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};