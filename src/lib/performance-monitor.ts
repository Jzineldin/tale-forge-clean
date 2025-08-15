/**
 * Performance Monitoring and Analytics System
 * Tracks performance metrics and provides optimization insights
 */

export interface PerformanceMetrics {
  loadTime: number;
  bundleSize: number;
  cacheHitRate: number;
  queryTime: number;
  memoryUsage: number;
  errorRate: number;
}

export interface PerformanceReport {
  timestamp: number;
  metrics: PerformanceMetrics;
  recommendations: string[];
  warnings: string[];
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    bundleSize: 0,
    cacheHitRate: 0,
    queryTime: 0,
    memoryUsage: 0,
    errorRate: 0
  };
  private startTime = Date.now();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Track page load time
   */
  trackLoadTime(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.metrics.loadTime = Date.now() - this.startTime;
        console.log(`Page load time: ${this.metrics.loadTime}ms`);
      });
    }
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage(): void {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }, 5000);
    }
  }

  /**
   * Track query performance
   */
  trackQueryTime(queryName: string, duration: number): void {
    this.metrics.queryTime = Math.max(this.metrics.queryTime, duration);
    console.log(`Query ${queryName} took ${duration}ms`);
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    return {
      timestamp: Date.now(),
      metrics: { ...this.metrics },
      recommendations: this.getRecommendations(),
      warnings: this.getWarnings()
    };
  }

  /**
   * Get performance recommendations
   */
  private getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.metrics.loadTime > 3000) {
      recommendations.push('Consider implementing code splitting to reduce initial bundle size');
    }
    
    if (this.metrics.queryTime > 500) {
      recommendations.push('Optimize database queries with proper indexes and caching');
    }
    
    if (this.metrics.memoryUsage > 100) {
      recommendations.push('Implement memory cleanup and garbage collection strategies');
    }
    
    return recommendations;
  }

  /**
   * Get performance warnings
   */
  private getWarnings(): string[] {
    const warnings: string[] = [];
    
    if (this.metrics.loadTime > 5000) {
      warnings.push('Page load time is critically high');
    }
    
    if (this.metrics.memoryUsage > 200) {
      warnings.push('High memory usage detected');
    }
    
    return warnings;
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      loadTime: 0,
      bundleSize: 0,
      cacheHitRate: 0,
      queryTime: 0,
      memoryUsage: 0,
      errorRate: 0
    };
    this.startTime = Date.now();
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();