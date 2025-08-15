/**
 * Memory Management Utilities
 * Provides tools for preventing memory leaks and optimizing memory usage
 */

import React from 'react';
import { secureConsole as logger } from '@/utils/secureLogger';

interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

class MemoryManager {
  private cleanupTasks: Set<() => void> = new Set();
  private intervalIds: Set<NodeJS.Timeout> = new Set();
  private timeoutIds: Set<NodeJS.Timeout> = new Set();
  private eventListeners: Map<EventTarget, Map<string, EventListener>> = new Map();
  private observers: Set<IntersectionObserver | MutationObserver | ResizeObserver> = new Set();
  private abortControllers: Set<AbortController> = new Set();

  /**
   * Register a cleanup task to be executed when component unmounts
   */
  registerCleanup(cleanup: () => void): void {
    this.cleanupTasks.add(cleanup);
  }

  /**
   * Create a managed interval that will be automatically cleaned up
   */
  createInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const intervalId = setInterval(callback, delay);
    this.intervalIds.add(intervalId);
    return intervalId;
  }

  /**
   * Create a managed timeout that will be automatically cleaned up
   */
  createTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timeoutId = setTimeout(() => {
      callback();
      this.timeoutIds.delete(timeoutId);
    }, delay);
    this.timeoutIds.add(timeoutId);
    return timeoutId;
  }

  /**
   * Add a managed event listener that will be automatically cleaned up
   */
  addEventListener<K extends keyof WindowEventMap>(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    target.addEventListener(type, listener, options);
    
    if (!this.eventListeners.has(target)) {
      this.eventListeners.set(target, new Map());
    }
    this.eventListeners.get(target)!.set(type, listener);
  }

  /**
   * Register an observer for automatic cleanup
   */
  registerObserver(observer: IntersectionObserver | MutationObserver | ResizeObserver): void {
    this.observers.add(observer);
  }

  /**
   * Create a managed AbortController
   */
  createAbortController(): AbortController {
    const controller = new AbortController();
    this.abortControllers.add(controller);
    return controller;
  }

  /**
   * Clean up all registered resources
   */
  cleanup(): void {
    // Execute cleanup tasks
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        logger.error('Cleanup task failed:', error);
      }
    });
    this.cleanupTasks.clear();

    // Clear intervals
    this.intervalIds.forEach(id => clearInterval(id));
    this.intervalIds.clear();

    // Clear timeouts
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds.clear();

    // Remove event listeners
    this.eventListeners.forEach((listeners, target) => {
      listeners.forEach((listener, type) => {
        try {
          target.removeEventListener(type, listener);
        } catch (error) {
          logger.error('Failed to remove event listener:', error);
        }
      });
    });
    this.eventListeners.clear();

    // Disconnect observers
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        logger.error('Failed to disconnect observer:', error);
      }
    });
    this.observers.clear();

    // Abort controllers
    this.abortControllers.forEach(controller => {
      try {
        controller.abort();
      } catch (error) {
        logger.error('Failed to abort controller:', error);
      }
    });
    this.abortControllers.clear();
  }

  /**
   * Get current memory usage statistics
   */
  getMemoryStats(): MemoryStats | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  /**
   * Check if memory usage is high
   */
  isMemoryUsageHigh(): boolean {
    const stats = this.getMemoryStats();
    if (!stats) return false;

    const usedMB = stats.usedJSHeapSize / 1024 / 1024;
    const limitMB = stats.jsHeapSizeLimit / 1024 / 1024;
    
    // Consider high if using more than 70% of available memory or more than 150MB
    return usedMB > 150 || (usedMB / limitMB) > 0.7;
  }

  /**
   * Force garbage collection if available
   */
  forceGarbageCollection(): void {
    if ('gc' in window) {
      try {
        (window as any).gc();
        logger.info('Forced garbage collection');
      } catch (error) {
        logger.error('Failed to force garbage collection:', error);
      }
    }
  }

  /**
   * Monitor memory usage and log warnings
   */
  startMemoryMonitoring(interval: number = 30000): NodeJS.Timeout {
    return this.createInterval(() => {
      const stats = this.getMemoryStats();
      if (stats) {
        const usedMB = stats.usedJSHeapSize / 1024 / 1024;
        
        if (this.isMemoryUsageHigh()) {
          logger.warn(`High memory usage detected: ${usedMB.toFixed(2)}MB`);
          this.forceGarbageCollection();
        } else {
          logger.debug(`Memory usage: ${usedMB.toFixed(2)}MB`);
        }
      }
    }, interval);
  }
}

// Create a global memory manager instance
const memoryManager = new MemoryManager();

/**
 * React hook for automatic memory management
 */
export function useMemoryManager() {
  const manager = new MemoryManager();

  // Return cleanup function for useEffect
  return () => {
    manager.cleanup();
  };
}

/**
 * Higher-order component for automatic memory management
 */
export function withMemoryManagement<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function MemoryManagedComponent(props: P) {
    const cleanup = useMemoryManager();
    
    React.useEffect(() => {
      return cleanup;
    }, [cleanup]);

    return React.createElement(Component, props);
  };
}

/**
 * Utility function to create a debounced function with automatic cleanup
 */
export function createDebouncedFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  manager?: MemoryManager
): T {
  let timeoutId: NodeJS.Timeout;
  const activeManager = manager || memoryManager;

  const debouncedFn = ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = activeManager.createTimeout(() => func(...args), delay);
  }) as T;

  return debouncedFn;
}

/**
 * Utility function to create a throttled function with automatic cleanup
 */
export function createThrottledFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  manager?: MemoryManager
): T {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout;
  const activeManager = manager || memoryManager;

  const throttledFn = ((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      clearTimeout(timeoutId);
      timeoutId = activeManager.createTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - (now - lastCall));
    }
  }) as T;

  return throttledFn;
}

/**
 * Clean up resources when page is about to unload
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    memoryManager.cleanup();
  });

  // Start memory monitoring in development
  if (import.meta.env.DEV) {
    memoryManager.startMemoryMonitoring(60000); // Check every minute in dev
  }
}

export default memoryManager;
export { MemoryManager };