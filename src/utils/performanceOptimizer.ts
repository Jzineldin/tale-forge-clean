/**
 * Performance Optimizer - Implements key performance optimizations
 * Part of the comprehensive optimization plan
 */

import { secureConsole as logger } from '@/utils/secureLogger';

interface PerformanceConfig {
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableQueryOptimization: boolean;
  maxConcurrentRequests: number;
  cacheTimeout: number;
}

const defaultConfig: PerformanceConfig = {
  enableLazyLoading: true,
  enableImageOptimization: true,
  enableQueryOptimization: true,
  maxConcurrentRequests: 3,
  cacheTimeout: 5 * 60 * 1000 // 5 minutes
};

let config: PerformanceConfig = { ...defaultConfig };

/**
 * Initialize performance optimizations
 */
export function initializePerformanceOptimizations(): void {
  try {
    // Set up lazy loading for images
    if (config.enableLazyLoading) {
      initializeLazyLoading();
    }

    // Set up request queue optimization
    if (config.enableQueryOptimization) {
      initializeRequestQueue();
    }

    // Set up memory monitoring
    initializeMemoryMonitoring();

    logger.info('Performance optimizations initialized');
  } catch (error) {
    logger.error('Failed to initialize performance optimizations:', error);
  }
}

/**
 * Initialize lazy loading for images
 */
function initializeLazyLoading(): void {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Request queue to limit concurrent API calls
 */
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private activeCount = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.activeCount++;
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeCount--;
          this.processQueue();
        }
      });

      this.processQueue();
    });
  }

  private processQueue(): void {
    if (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
      const nextRequest = this.queue.shift();
      if (nextRequest) {
        nextRequest();
      }
    }
  }
}

let requestQueue: RequestQueue | null = null;

/**
 * Initialize request queue optimization
 */
function initializeRequestQueue(): void {
  requestQueue = new RequestQueue(config.maxConcurrentRequests);
  logger.info(`Request queue initialized with ${config.maxConcurrentRequests} max concurrent requests`);
}

/**
 * Add request to optimization queue
 */
export function optimizeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  if (!requestQueue) {
    // Fallback to direct execution if queue not initialized
    return requestFn();
  }
  return requestQueue.add(requestFn);
}

/**
 * Memory monitoring and cleanup
 */
function initializeMemoryMonitoring(): void {
  // Monitor memory usage every 30 seconds
  setInterval(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      
      // Log warning if memory usage is high
      if (usedMB > 150) {
        logger.warn(`High memory usage detected: ${usedMB.toFixed(2)}MB`);
        
        // Trigger garbage collection hint
        if ('gc' in window) {
          (window as any).gc();
        }
      }
    }
  }, 30000);
}

/**
 * Optimize component unmounting
 */
export function optimizeComponentCleanup(cleanupFn: () => void): () => void {
  return () => {
    try {
      cleanupFn();
    } catch (error) {
      logger.error('Component cleanup error:', error);
    }
  };
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Optimize image loading with lazy loading and error handling
 */
export function optimizeImageLoad(
  src: string,
  onLoad?: () => void,
  onError?: () => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      onLoad?.();
      resolve(src);
    };
    
    img.onerror = () => {
      onError?.();
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
  });
}

/**
 * Update performance configuration
 */
export function updatePerformanceConfig(newConfig: Partial<PerformanceConfig>): void {
  config = { ...config, ...newConfig };
  logger.info('Performance configuration updated:', newConfig);
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics(): {
  memoryUsage?: number;
  timing: PerformanceTiming;
  navigation: PerformanceNavigation;
} {
  const metrics: any = {
    timing: performance.timing,
    navigation: performance.navigation
  };

  if ('memory' in performance) {
    const memory = (performance as any).memory;
    metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
  }

  return metrics;
}

export default {
  initializePerformanceOptimizations,
  optimizeRequest,
  optimizeComponentCleanup,
  debounce,
  throttle,
  optimizeImageLoad,
  updatePerformanceConfig,
  getPerformanceMetrics
};