// Performance optimization utilities for TaleForge AI Storytelling Platform

// Performance metrics tracking
interface PerformanceMetrics {
  storyGenerationTime: number;
  imageGenerationTime: number;
  audioGenerationTime: number;
  uiRenderTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  errorCount: number;
  duration?: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(operation: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(operation, 'duration', duration);
    };
  }

  recordMetric(operation: string, metric: keyof PerformanceMetrics, value: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, {
        storyGenerationTime: 0,
        imageGenerationTime: 0,
        audioGenerationTime: 0,
        uiRenderTime: 0,
        apiResponseTime: 0,
        memoryUsage: 0,
        errorCount: 0
      });
    }
    
    const current = this.metrics.get(operation)!;
    (current as any)[metric] = value;
  }

  getMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  logPerformanceReport(): void {
    // Safely use console methods
    if (typeof console !== 'undefined' && console.group) {
      console.group('🎯 TaleForge Performance Report');
      this.metrics.forEach((metrics, operation) => {
        if (console.log) {
          console.log(`${operation}:`, metrics);
        }
      });
      if (console.groupEnd) {
        console.groupEnd();
      }
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Image optimization utilities
export const optimizeImageUrl = (url: string): string => {
  if (!url) return url;
  
  // If it's already a data URL or relative path, return as is
  if (url.startsWith('data:') || url.startsWith('/')) {
    return url;
  }
  
  // For external URLs, you could add image optimization service here
  // For now, return the original URL
  return url;
};

// Lazy loading utility for images with performance tracking
export const createLazyImageObserver = (callback: (entry: IntersectionObserverEntry) => void) => {
  const stopTimer = performanceMonitor.startTimer('image-lazy-load');
  
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          stopTimer();
          callback(entry);
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.1,
    }
  );
};

// Debounce utility for performance with tracking
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const stopTimer = performanceMonitor.startTimer('debounced-function');
      func(...args);
      stopTimer();
    }, wait);
  };
};

// Throttle utility for performance with tracking
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      const stopTimer = performanceMonitor.startTimer('throttled-function');
      func(...args);
      stopTimer();
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// AI Generation Performance Tracking
export const trackAIGeneration = (provider: string, operation: string) => {
  const stopTimer = performanceMonitor.startTimer(`${provider}-${operation}`);
  return {
    success: () => {
      stopTimer();
      performanceMonitor.recordMetric(`${provider}-${operation}`, 'errorCount', 0);
    },
    error: () => {
      stopTimer();
      performanceMonitor.recordMetric(`${provider}-${operation}`, 'errorCount', 1);
    }
  };
};

// Memory usage monitoring
export const getMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
  }
  return 0;
};

// Preload critical resources with performance tracking
export const preloadCriticalResources = () => {
  const stopTimer = performanceMonitor.startTimer('resource-preload');
  
  // Preload critical fonts
  const fontLinks = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&display=swap'
  ];
  
  fontLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });

  // Preload critical AI assets
  const aiAssets = [
    '/api/health-check', // Pre-warm API endpoints
  ];

  aiAssets.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });

  stopTimer();
};

// Resource hints for better performance
export const addResourceHints = () => {
  const stopTimer = performanceMonitor.startTimer('resource-hints');
  
  // DNS prefetch for external domains
  const domains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'api.supabase.co',
    'api.openai.com',
    'oai.endpoints.kepler.ai.cloud.ovh.net'
  ];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });

  stopTimer();
};

// Bundle size monitoring
export const monitorBundleSize = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    const stopTimer = performanceMonitor.startTimer('bundle-analysis');
    
    // Monitor initial load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      performanceMonitor.recordMetric('initial-load', 'uiRenderTime', loadTime);
      stopTimer();
    });
  }
};

// Export performance utilities for use throughout the app
export const performanceUtils = {
  monitor: performanceMonitor,
  trackAI: trackAIGeneration,
  getMemory: getMemoryUsage,
  logReport: () => performanceMonitor.logPerformanceReport()
};