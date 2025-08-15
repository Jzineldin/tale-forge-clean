import React, { useCallback, useRef, useEffect, useState } from 'react';

/**
 * Performance optimization utilities for TaleForge
 * Addresses common performance bottlenecks and optimization opportunities
 */

// 1. MEMOIZATION UTILITIES
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

// 2. DEBOUNCE UTILITY (Enhanced)
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 3. THROTTLE UTILITY
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback((...args: Parameters<T>) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]) as T;
};

// 4. INTERSECTION OBSERVER FOR LAZY LOADING
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
        }
      });
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [callback, options]);

  return elementRef;
};

// 5. IMAGE OPTIMIZATION UTILITY
export const useImageOptimization = (src: string, fallbackSrc?: string) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      if (fallbackSrc) {
        setImageSrc(fallbackSrc);
        setIsLoading(false);
      } else {
        setHasError(true);
        setIsLoading(false);
      }
    };
    img.src = src;
  }, [src, fallbackSrc]);

  return { imageSrc, isLoading, hasError };
};

// 6. REACT QUERY OPTIMIZATION CONFIG
export const getOptimizedQueryConfig = () => ({
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  retry: 1,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: true,
});

// 7. EVENT LISTENER OPTIMIZATION
export const useEventListener = (
  eventName: string,
  handler: EventListener,
  element: EventTarget = window,
  options?: AddEventListenerOptions
) => {
  const savedHandler = useRef<EventListener>();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: Event) => savedHandler.current?.(event);
    element.addEventListener(eventName, eventListener, options);
    return () => element.removeEventListener(eventName, eventListener, options);
  }, [eventName, element, options]);
};

// 8. SCROLL OPTIMIZATION
export const useScrollOptimization = (callback: () => void) => {
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        callback();
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [callback]);

  useEventListener('scroll', handleScroll);
};

// 9. RESIZE OPTIMIZATION
export const useResizeOptimization = (callback: () => void, delay: number = 250) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleResize = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(callback, delay);
  }, [callback, delay]);

  useEventListener('resize', handleResize);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
};

// 10. BATCH STATE UPDATES
export const useBatchState = <T>(initialState: T) => {
  const [state, setState] = useState<T>(initialState);
  const batchRef = useRef<Partial<T>>({});
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchUpdate = useCallback((updates: Partial<T>) => {
    batchRef.current = { ...batchRef.current, ...updates };

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, ...batchRef.current }));
      batchRef.current = {};
    }, 16); // One frame
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchUpdate] as const;
};

// 11. MEMORY LEAK PREVENTION
export const useCleanup = (cleanupFn: () => void) => {
  useEffect(() => {
    return cleanupFn;
  }, [cleanupFn]);
};

// 12. CONDITIONAL RENDERING OPTIMIZATION
export const useConditionalRender = (condition: boolean, delay: number = 100) => {
  const [shouldRender, setShouldRender] = useState(condition);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (condition) {
      setShouldRender(true);
    } else {
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false);
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [condition, delay]);

  return shouldRender;
};

// 13. NETWORK STATUS OPTIMIZATION
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// 14. PERFORMANCE MONITORING
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${componentName}:`, {
        renderCount: renderCount.current,
        timeSinceLastRender: `${timeSinceLastRender.toFixed(2)}ms`
      });
    }
    
    lastRenderTime.current = currentTime;
  });

  return {
    renderCount: renderCount.current,
    timeSinceLastRender: performance.now() - lastRenderTime.current
  };
};

// 15. BUNDLE SIZE OPTIMIZATION HELPERS
export const lazyLoadComponent = (importFn: () => Promise<any>) => {
  return React.lazy(() => importFn().then(module => ({ default: module.default || module })));
};

// 16. ACCESSIBILITY OPTIMIZATION
export const useAccessibility = () => {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { isReducedMotion };
};

// 17. MOBILE PERFORMANCE OPTIMIZATION
export const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const isMobileDevice = window.innerWidth <= 768;
      const isLowEndDevice = navigator.hardwareConcurrency <= 4;
      
      setIsMobile(isMobileDevice);
      setIsLowEnd(isLowEndDevice);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isLowEnd };
}; 