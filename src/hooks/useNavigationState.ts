import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationState {
  previousPath?: string;
  returnPath?: string;
  formData?: Record<string, any>;
  scrollPosition?: number;
  timestamp?: number;
}

const NAVIGATION_STATE_KEY = 'tale-forge-navigation-state';
const STATE_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes

/**
 * Navigation State Preservation Hook
 * Preserves user context during navigation flows (especially auth)
 * WCAG 2.1 AA Compliance: Success Criterion 3.2.3 (Consistent Navigation)
 */
export const useNavigationState = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [navigationState, setNavigationState] = useState<NavigationState | null>(null);

  // Load navigation state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(NAVIGATION_STATE_KEY);
    if (savedState) {
      try {
        const parsed: NavigationState = JSON.parse(savedState);
        
        // Check if state is expired
        if (parsed.timestamp && Date.now() - parsed.timestamp > STATE_EXPIRY_TIME) {
          localStorage.removeItem(NAVIGATION_STATE_KEY);
          return;
        }
        
        setNavigationState(parsed);
      } catch (error) {
        console.error('Failed to parse navigation state:', error);
        localStorage.removeItem(NAVIGATION_STATE_KEY);
      }
    }
  }, []);

  // Save current state before navigation
  const saveNavigationState = useCallback((
    returnPath?: string,
    formData?: Record<string, any>
  ) => {
    const state: NavigationState = {
      previousPath: location.pathname + location.search,
      returnPath: returnPath || location.pathname + location.search,
      scrollPosition: window.scrollY,
      timestamp: Date.now()
    };

    if (formData) {
      state.formData = formData;
    }

    localStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(state));
    setNavigationState(state);
  }, [location]);

  // Restore navigation state
  const restoreNavigationState = useCallback(() => {
    if (navigationState?.returnPath) {
      const { returnPath, scrollPosition } = navigationState;
      
      // Clear the saved state
      localStorage.removeItem(NAVIGATION_STATE_KEY);
      setNavigationState(null);
      
      // Navigate back to the saved path
      navigate(returnPath, { replace: true });
      
      // Restore scroll position after navigation
      if (scrollPosition !== undefined) {
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 100);
      }
      
      return true;
    }
    return false;
  }, [navigationState, navigate]);

  // Clear navigation state
  const clearNavigationState = useCallback(() => {
    localStorage.removeItem(NAVIGATION_STATE_KEY);
    setNavigationState(null);
  }, []);

  // Get saved form data
  const getSavedFormData = useCallback(() => {
    return navigationState?.formData || {};
  }, [navigationState]);

  // Navigate to auth with state preservation
  const navigateToAuth = useCallback((
    authPath: string = '/auth/signin',
    formData?: Record<string, any>
  ) => {
    saveNavigationState(location.pathname + location.search, formData);
    navigate(authPath);
  }, [location, navigate, saveNavigationState]);

  // Navigate back with fallback
  const navigateBack = useCallback((fallbackPath: string = '/') => {
    if (!restoreNavigationState()) {
      navigate(fallbackPath);
    }
  }, [navigate, restoreNavigationState]);

  return {
    navigationState,
    saveNavigationState,
    restoreNavigationState,
    clearNavigationState,
    getSavedFormData,
    navigateToAuth,
    navigateBack,
    hasReturnPath: !!navigationState?.returnPath
  };
};

/**
 * Story Creation State Hook
 * Preserves story creation progress across sessions
 */
export const useStoryCreationState = () => {
  const STORY_STATE_KEY = 'tale-forge-story-creation-state';
  
  const [storyState, setStoryState] = useState<{
    age?: string;
    genre?: string;
    prompt?: string;
    characters?: any[];
    step?: number;
  }>({});

  // Load story creation state
  useEffect(() => {
    const savedState = localStorage.getItem(STORY_STATE_KEY);
    if (savedState) {
      try {
        setStoryState(JSON.parse(savedState));
      } catch (error) {
        console.error('Failed to parse story creation state:', error);
        localStorage.removeItem(STORY_STATE_KEY);
      }
    }
  }, []);

  // Save story creation state
  const saveStoryState = useCallback((updates: Partial<typeof storyState>) => {
    const newState = { ...storyState, ...updates };
    setStoryState(newState);
    localStorage.setItem(STORY_STATE_KEY, JSON.stringify(newState));
  }, [storyState]);

  // Clear story creation state
  const clearStoryState = useCallback(() => {
    setStoryState({});
    localStorage.removeItem(STORY_STATE_KEY);
  }, []);

  // Get story creation progress
  const getProgress = useCallback(() => {
    let step = 0;
    if (storyState.age) step = 1;
    if (storyState.genre) step = 2;
    if (storyState.prompt) step = 3;
    
    return {
      step,
      totalSteps: 3,
      percentage: Math.round((step / 3) * 100)
    };
  }, [storyState]);

  return {
    storyState,
    saveStoryState,
    clearStoryState,
    getProgress,
    hasProgress: Object.keys(storyState).length > 0
  };
};

/**
 * Scroll Position Hook
 * Preserves scroll position during navigation
 */
export const useScrollPreservation = () => {
  const location = useLocation();
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});

  // Save scroll position when leaving a page
  const saveScrollPosition = useCallback(() => {
    const key = location.pathname + location.search;
    setScrollPositions(prev => ({
      ...prev,
      [key]: window.scrollY
    }));
  }, [location]);

  // Restore scroll position when returning to a page
  const restoreScrollPosition = useCallback(() => {
    const key = location.pathname + location.search;
    const savedPosition = scrollPositions[key];
    
    if (savedPosition !== undefined) {
      setTimeout(() => {
        window.scrollTo(0, savedPosition);
      }, 100);
    }
  }, [location, scrollPositions]);

  // Auto-save scroll position on route changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveScrollPosition();
    };
  }, [saveScrollPosition]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    scrollPositions
  };
};

export default useNavigationState;