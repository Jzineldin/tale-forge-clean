/**
 * Performance Monitoring System for TaleForge
 * Tracks key performance metrics and user interactions
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: 'timing' | 'memory' | 'interaction' | 'error' | 'custom';
  metadata: Record<string, any> | undefined;
}

export interface PerformanceEvent {
  event: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error: string | undefined;
  metadata: Record<string, any> | undefined;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private events: PerformanceEvent[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize performance monitoring
   */
  private initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Monitor Core Web Vitals
      this.observeWebVitals();
      
      // Monitor memory usage
      this.observeMemoryUsage();
      
      // Monitor long tasks
      this.observeLongTasks();
      
      // Monitor layout shifts
      this.observeLayoutShifts();
      
      this.isInitialized = true;
      console.log('📊 Performance monitoring initialized');
    } catch (error) {
      console.warn('Failed to initialize performance monitoring:', error);
    }
  }

  /**
   * Observe Core Web Vitals
   */
  private observeWebVitals(): void {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('lcp', lastEntry.startTime, 'ms', 'timing', {
            element: (lastEntry as any).element?.tagName,
            url: (lastEntry as any).url
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // FID (First Input Delay)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.recordMetric('fid', (entry as any).processingStart - entry.startTime, 'ms', 'timing', {
              name: entry.name,
              type: entry.entryType
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }

      // CLS (Cumulative Layout Shift)
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          this.recordMetric('cls', clsValue, 'score', 'timing');
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }
    }
  }

  /**
   * Observe memory usage
   */
  private observeMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setInterval(() => {
        this.recordMetric('memory_used', memory.usedJSHeapSize, 'bytes', 'memory');
        this.recordMetric('memory_total', memory.totalJSHeapSize, 'bytes', 'memory');
        this.recordMetric('memory_limit', memory.jsHeapSizeLimit, 'bytes', 'memory');
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Observe long tasks
   */
  private observeLongTasks(): void {
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.recordMetric('long_task', entry.duration, 'ms', 'timing', {
              name: entry.name,
              startTime: entry.startTime
            });
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (error) {
        console.warn('Long task observer not supported:', error);
      }
    }
  }

  /**
   * Observe layout shifts
   */
  private observeLayoutShifts(): void {
    if ('PerformanceObserver' in window) {
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.recordMetric('layout_shift', (entry as any).value, 'score', 'timing', {
              hadRecentInput: (entry as any).hadRecentInput
            });
          });
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('layout_shift', layoutShiftObserver);
      } catch (error) {
        console.warn('Layout shift observer not supported:', error);
      }
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string, 
    value: number, 
    unit: string, 
    category: PerformanceMetric['category'],
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      category,
      metadata
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log important metrics
    if (category === 'error' || value > 1000) {
      console.log(`📊 ${name}: ${value}${unit}`, metadata);
    }
  }

  /**
   * Record a performance event
   */
  recordEvent(
    event: string,
    duration: number,
    success: boolean = true,
    error?: string,
    metadata?: Record<string, any>
  ): void {
    const performanceEvent: PerformanceEvent = {
      event,
      duration,
      timestamp: Date.now(),
      success,
      error,
      metadata
    };

    this.events.push(performanceEvent);

    // Keep only last 500 events
    if (this.events.length > 500) {
      this.events = this.events.slice(-500);
    }

    // Log slow events
    if (duration > 1000) {
      console.warn(`🐌 Slow event: ${event} took ${duration}ms`, metadata);
    }
  }

  /**
   * Measure function execution time
   */
  async measureFunction<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.recordEvent(name, duration, true, undefined, metadata);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordEvent(name, duration, false, error instanceof Error ? error.message : String(error), metadata);
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  measureSyncFunction<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    const startTime = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - startTime;
      this.recordEvent(name, duration, true, undefined, metadata);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordEvent(name, duration, false, error instanceof Error ? error.message : String(error), metadata);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(category?: string, limit: number = 100): PerformanceMetric[] {
    let filtered = this.metrics;
    if (category) {
      filtered = filtered.filter(m => m.category === category);
    }
    return filtered.slice(-limit);
  }

  /**
   * Get performance events
   */
  getEvents(event?: string, limit: number = 100): PerformanceEvent[] {
    let filtered = this.events;
    if (event) {
      filtered = filtered.filter(e => e.event === event);
    }
    return filtered.slice(-limit);
  }

  /**
   * Get average metric value
   */
  getAverageMetric(name: string, timeWindow?: number): number {
    let filtered = this.metrics.filter(m => m.name === name);
    
    if (timeWindow) {
      const cutoff = Date.now() - timeWindow;
      filtered = filtered.filter(m => m.timestamp > cutoff);
    }

    if (filtered.length === 0) return 0;
    
    const sum = filtered.reduce((acc, m) => acc + m.value, 0);
    return sum / filtered.length;
  }

  /**
   * Get slowest events
   */
  getSlowestEvents(limit: number = 10): PerformanceEvent[] {
    return this.events
      .filter(e => !e.success)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get error events
   */
  getErrorEvents(limit: number = 50): PerformanceEvent[] {
    return this.events
      .filter(e => !e.success)
      .slice(-limit);
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    summary: Record<string, any>;
    metrics: PerformanceMetric[];
    events: PerformanceEvent[];
    recommendations: string[];
  } {
    const now = Date.now();
    const last5Minutes = now - 5 * 60 * 1000;
    const lastHour = now - 60 * 60 * 1000;

    // Recent metrics
    const recentMetrics = this.metrics.filter(m => m.timestamp > last5Minutes);
    const recentEvents = this.events.filter(e => e.timestamp > last5Minutes);

    // Calculate averages
    const avgLCP = this.getAverageMetric('lcp', lastHour);
    const avgFID = this.getAverageMetric('fid', lastHour);
    const avgCLS = this.getAverageMetric('cls', lastHour);

    // Error rate
    const errorRate = recentEvents.length > 0 
      ? (recentEvents.filter(e => !e.success).length / recentEvents.length) * 100 
      : 0;

    // Slow events
    const slowEvents = recentEvents.filter(e => e.duration > 1000).length;

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (avgLCP > 2500) {
      recommendations.push('LCP is too high - optimize image loading and critical resources');
    }
    
    if (avgFID > 100) {
      recommendations.push('FID is too high - reduce JavaScript execution time');
    }
    
    if (avgCLS > 0.1) {
      recommendations.push('CLS is too high - avoid layout shifts during page load');
    }
    
    if (errorRate > 5) {
      recommendations.push('High error rate detected - investigate recent errors');
    }
    
    if (slowEvents > 10) {
      recommendations.push('Many slow events detected - optimize performance bottlenecks');
    }

    return {
      summary: {
        totalMetrics: this.metrics.length,
        totalEvents: this.events.length,
        recentMetrics: recentMetrics.length,
        recentEvents: recentEvents.length,
        avgLCP,
        avgFID,
        avgCLS,
        errorRate: Math.round(errorRate * 100) / 100,
        slowEvents,
        memoryUsage: this.getAverageMetric('memory_used', last5Minutes)
      },
      metrics: this.metrics.slice(-100),
      events: this.events.slice(-100),
      recommendations
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.metrics = [];
    this.events = [];
  }

  /**
   * Disconnect all observers
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export convenience functions
export const measureFunction = performanceMonitor.measureFunction.bind(performanceMonitor);
export const measureSyncFunction = performanceMonitor.measureSyncFunction.bind(performanceMonitor);
export const recordMetric = performanceMonitor.recordMetric.bind(performanceMonitor);
export const recordEvent = performanceMonitor.recordEvent.bind(performanceMonitor); 