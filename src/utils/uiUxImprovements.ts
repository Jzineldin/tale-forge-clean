import { useState, useEffect, useCallback } from 'react';
import { cookieUtils } from '@/utils/cookieManager';

/**
 * UI/UX Improvements for TaleForge
 * Addresses mobile responsiveness, accessibility, and user experience issues
 */

// 1. MOBILE RESPONSIVENESS UTILITIES
export const useResponsiveBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};

export const useTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouchDevice();
  }, []);

  return isTouchDevice;
};

// 2. ACCESSIBILITY UTILITIES
export const useAccessibility = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);
  const [fontScale] = useState(1);

  useEffect(() => {
    // Reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);

    // Dark mode preference
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDarkMode(darkQuery.matches);

    const handleDarkChange = (e: MediaQueryListEvent) => {
      setPrefersDarkMode(e.matches);
    };

    darkQuery.addEventListener('change', handleDarkChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      darkQuery.removeEventListener('change', handleDarkChange);
    };
  }, []);

  return {
    prefersReducedMotion,
    prefersDarkMode,
    fontScale
  };
};

// 3. SCROLL OPTIMIZATION
export const useSmoothScroll = (targetId: string) => {
  const scrollToElement = useCallback(() => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  }, [targetId]);

  return scrollToElement;
};

export const useScrollToTop = () => {
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  return scrollToTop;
};

// 4. LOADING STATES
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingMessage, setLoadingMessage] = useState('');

  const startLoading = useCallback((message = 'Loading...') => {
    setIsLoading(true);
    setLoadingMessage(message);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('');
  }, []);

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading
  };
};

// 5. TOAST NOTIFICATION ENHANCEMENTS
export const useEnhancedToast = () => {
  const showSuccess = useCallback((message: string, options = {}) => {
    // Enhanced success toast with better styling
    return {
      message,
      type: 'success',
      duration: 4000,
      ...options
    };
  }, []);

  const showError = useCallback((message: string, options = {}) => {
    // Enhanced error toast with retry option
    return {
      message,
      type: 'error',
      duration: 6000,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      },
      ...options
    };
  }, []);

  const showInfo = useCallback((message: string, options = {}) => {
    return {
      message,
      type: 'info',
      duration: 3000,
      ...options
    };
  }, []);

  return {
    showSuccess,
    showError,
    showInfo
  };
};

// 6. FORM VALIDATION ENHANCEMENTS
export const useFormValidation = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback((validationRules: Record<keyof T, (value: any) => string | null>) => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    
    Object.keys(validationRules).forEach((field) => {
      const fieldKey = field as keyof T;
      const error = validationRules[fieldKey](values[fieldKey]);
      if (error) {
        newErrors[fieldKey] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset
  };
};

// 7. ANIMATION UTILITIES
export const useAnimation = (duration = 300) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const animate = useCallback((callback: () => void) => {
    setIsAnimating(true);
    callback();
    
    setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  }, [duration]);

  return {
    isAnimating,
    animate
  };
};

// 8. FOCUS MANAGEMENT
export const useFocusManagement = () => {
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const trapFocus = useCallback((element: HTMLElement) => {
    const focusableContent = element.querySelectorAll(focusableElements);
    const firstFocusableElement = focusableContent[0] as HTMLElement;
    const lastFocusableElement = focusableContent[focusableContent.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstFocusableElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return { trapFocus };
};

// 9. MOBILE GESTURE SUPPORT
export const useMobileGestures = () => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);

  const handleSwipe = useCallback((element: HTMLElement, onSwipe: (direction: string) => void) => {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const diffX = startX - endX;
      const diffY = startY - endY;
      const minSwipeDistance = 50;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > minSwipeDistance) {
          const direction = diffX > 0 ? 'left' : 'right';
          setSwipeDirection(direction);
          onSwipe(direction);
        }
      } else {
        if (Math.abs(diffY) > minSwipeDistance) {
          const direction = diffY > 0 ? 'up' : 'down';
          setSwipeDirection(direction);
          onSwipe(direction);
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return { swipeDirection, handleSwipe };
};

// 10. PERFORMANCE MONITORING FOR UI
export const useUIPerformance = (componentName: string) => {
  const [renderTime, setRenderTime] = useState(0);
  const [interactionTime, setInteractionTime] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setRenderTime(duration);
      
      if (duration > 16) { // Longer than one frame
        console.warn(`[UI Performance] ${componentName} took ${duration.toFixed(2)}ms to render`);
      }
    };
  });

  const measureInteraction = useCallback((interactionName: string, fn: () => void) => {
    const startTime = performance.now();
    fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    setInteractionTime(duration);
    
    if (duration > 100) { // Longer than 100ms
      console.warn(`[UI Performance] ${componentName} ${interactionName} took ${duration.toFixed(2)}ms`);
    }
  }, [componentName]);

  return {
    renderTime,
    interactionTime,
    measureInteraction
  };
};

// 11. THEME MANAGEMENT
export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  useEffect(() => {
    // Try to get theme from cookie first (respects user privacy preferences)
    const cookieTheme = cookieUtils.getTheme();
    if (cookieTheme) {
      setTheme(cookieTheme);
      document.documentElement.setAttribute('data-theme', cookieTheme);
      return;
    }
    
    // Fallback to localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const changeTheme = useCallback((newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    
    // Save to cookie if functional cookies are enabled
    cookieUtils.setTheme(newTheme);
    
    // Always save to localStorage as fallback
    localStorage.setItem('theme', newTheme);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);

  return {
    theme,
    changeTheme
  };
};

// 12. KEYBOARD SHORTCUTS
export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey;
      const shift = e.shiftKey;
      const alt = e.altKey;
      
      const shortcutKey = [
        ctrl && 'ctrl',
        shift && 'shift',
        alt && 'alt',
        key
      ].filter(Boolean).join('+');
      
      if (shortcuts[shortcutKey]) {
        e.preventDefault();
        shortcuts[shortcutKey]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// 13. PROGRESSIVE ENHANCEMENT
export const useProgressiveEnhancement = () => {
  const [supportsWebP, setSupportsWebP] = useState(false);
  const [supportsWebGL, setSupportsWebGL] = useState(false);
  const [supportsServiceWorker, setSupportsServiceWorker] = useState(false);

  useEffect(() => {
    // Check WebP support
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      setSupportsWebP(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

    // Check WebGL support
    const canvas = document.createElement('canvas');
    setSupportsWebGL(!!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));

    // Check Service Worker support
    setSupportsServiceWorker('serviceWorker' in navigator);
  }, []);

  return {
    supportsWebP,
    supportsWebGL,
    supportsServiceWorker
  };
}; 