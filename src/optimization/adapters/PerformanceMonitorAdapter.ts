/**
 * Tale Forge Unified Optimization Framework - Performance Monitor Adapter
 * 
 * This file implements a performance monitoring adapter that tracks Web Vitals
 * and other performance metrics.
 */

import { BaseOptimizer } from '../core/BaseOptimizer';
import { 
  OptimizerType, 
  OptimizationEventType
} from '../core/types';
import { EventEmitter } from '../utils/EventEmitter';
import { ConfigManager } from '../config/ConfigManager';
import { featureFlagManager } from '../utils/FeatureFlagManager';

/**
 * Web Vitals metric types
 */
export enum WebVitalType {
  FCP = 'first-contentful-paint',
  LCP = 'largest-contentful-paint',
  CLS = 'cumulative-layout-shift',
  FID = 'first-input-delay',
  TTI = 'time-to-interactive',
  INP = 'interaction-to-next-paint',
  TTFB = 'time-to-first-byte'
}

/**
 * Performance metric categories
 */
export enum MetricCategory {
  LOADING = 'loading',
  INTERACTIVITY = 'interactivity',
  VISUAL_STABILITY = 'visual-stability',
  RESOURCE_USAGE = 'resource-usage',
  CUSTOM = 'custom'
}

/**
 * Web Vitals metric data
 */
export interface WebVitalMetric {
  name: WebVitalType;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  entries?: PerformanceEntry[];
  navigationType?: string;
  id?: string;
}

/**
 * Historical metric data point
 */
interface HistoricalDataPoint {
  timestamp: number;
  value: number;
  context?: Record<string, unknown>;
}

/**
 * Historical metric data
 */
interface HistoricalMetricData {
  name: string;
  category: MetricCategory;
  unit: string;
  dataPoints: HistoricalDataPoint[];
  thresholds?: {
    good: number;
    poor: number;
  };
}

/**
 * Performance visualization component
 */
export interface PerformanceVisualization {
  id: string;
  type: 'chart' | 'gauge' | 'table' | 'heatmap';
  title: string;
  description: string;
  metrics: string[];
  options: Record<string, unknown>;
  render: () => HTMLElement;
}

/**
 * Performance Monitor Adapter
 * 
 * Tracks Web Vitals and other performance metrics
 */
export class PerformanceMonitorAdapter extends BaseOptimizer {
  private historicalData: Map<string, HistoricalMetricData> = new Map();
  private visualizations: Map<string, PerformanceVisualization> = new Map();
  private webVitalsEnabled: boolean = true;
  private historicalDataEnabled: boolean = true;
  private visualizationEnabled: boolean = true;
  private automaticOptimizationEnabled: boolean = true;
  private maxDataPoints: number = 1000;
  private dataRetentionPeriod: number = 30 * 24 * 60 * 60 * 1000; // 30 days
  private pollingInterval: number = 60 * 1000; // 1 minute
  private pollingIntervalId: number | null = null;
  private webVitalsThresholds: Record<WebVitalType, { good: number; poor: number }> = {
    [WebVitalType.FCP]: { good: 1800, poor: 3000 }, // ms
    [WebVitalType.LCP]: { good: 2500, poor: 4000 }, // ms
    [WebVitalType.CLS]: { good: 0.1, poor: 0.25 }, // score
    [WebVitalType.FID]: { good: 100, poor: 300 }, // ms
    [WebVitalType.TTI]: { good: 3500, poor: 7500 }, // ms
    [WebVitalType.INP]: { good: 200, poor: 500 }, // ms
    [WebVitalType.TTFB]: { good: 800, poor: 1800 } // ms
  };

  /**
   * Constructor
   * 
   * @param eventEmitter The event emitter instance
   * @param configManager The configuration manager instance
   */
  constructor(
    eventEmitter: EventEmitter = EventEmitter.getInstance(),
    configManager: ConfigManager = ConfigManager.getInstance()
  ) {
    super(OptimizerType.PERFORMANCE, eventEmitter, configManager);
    
    // Initialize historical data with Web Vitals metrics
    this.initializeHistoricalData();
  }

  /**
   * Initialize historical data with Web Vitals metrics
   */
  private initializeHistoricalData(): void {
    // Initialize Web Vitals metrics
    this.historicalData.set(WebVitalType.FCP, {
      name: WebVitalType.FCP,
      category: MetricCategory.LOADING,
      unit: 'ms',
      dataPoints: [],
      thresholds: this.webVitalsThresholds[WebVitalType.FCP]
    });

    this.historicalData.set(WebVitalType.LCP, {
      name: WebVitalType.LCP,
      category: MetricCategory.LOADING,
      unit: 'ms',
      dataPoints: [],
      thresholds: this.webVitalsThresholds[WebVitalType.LCP]
    });

    this.historicalData.set(WebVitalType.CLS, {
      name: WebVitalType.CLS,
      category: MetricCategory.VISUAL_STABILITY,
      unit: 'score',
      dataPoints: [],
      thresholds: this.webVitalsThresholds[WebVitalType.CLS]
    });

    this.historicalData.set(WebVitalType.FID, {
      name: WebVitalType.FID,
      category: MetricCategory.INTERACTIVITY,
      unit: 'ms',
      dataPoints: [],
      thresholds: this.webVitalsThresholds[WebVitalType.FID]
    });

    this.historicalData.set(WebVitalType.TTI, {
      name: WebVitalType.TTI,
      category: MetricCategory.INTERACTIVITY,
      unit: 'ms',
      dataPoints: [],
      thresholds: this.webVitalsThresholds[WebVitalType.TTI]
    });

    this.historicalData.set(WebVitalType.INP, {
      name: WebVitalType.INP,
      category: MetricCategory.INTERACTIVITY,
      unit: 'ms',
      dataPoints: [],
      thresholds: this.webVitalsThresholds[WebVitalType.INP]
    });

    this.historicalData.set(WebVitalType.TTFB, {
      name: WebVitalType.TTFB,
      category: MetricCategory.LOADING,
      unit: 'ms',
      dataPoints: [],
      thresholds: this.webVitalsThresholds[WebVitalType.TTFB]
    });

    // Initialize resource usage metrics
    this.historicalData.set('memory-usage', {
      name: 'memory-usage',
      category: MetricCategory.RESOURCE_USAGE,
      unit: 'MB',
      dataPoints: []
    });

    this.historicalData.set('js-execution-time', {
      name: 'js-execution-time',
      category: MetricCategory.RESOURCE_USAGE,
      unit: 'ms',
      dataPoints: []
    });

    this.historicalData.set('bundle-size', {
      name: 'bundle-size',
      category: MetricCategory.RESOURCE_USAGE,
      unit: 'KB',
      dataPoints: []
    });
  }

  /**
   * Initialize the adapter
   */
  protected async initializeImpl(): Promise<void> {
    // Check if performance monitoring is enabled
    if (!featureFlagManager.isEnabled('performance-monitoring')) {
      console.log('Performance monitoring is disabled');
      return;
    }

    // Load configuration
    this.loadConfiguration();

    // Initialize Web Vitals tracking if enabled
    if (this.webVitalsEnabled) {
      this.initializeWebVitalsTracking();
    }

    // Start polling for performance metrics
    this.startPolling();

    // Create default visualizations if enabled
    if (this.visualizationEnabled) {
      this.createDefaultVisualizations();
    }

    console.log('Performance monitor adapter initialized');
  }

  /**
   * Load configuration from config manager
   */
  private loadConfiguration(): void {
    // Load feature flags
    this.webVitalsEnabled = this.isFeatureEnabled('web-vitals-tracking');
    this.historicalDataEnabled = this.isFeatureEnabled('historical-data-storage');
    this.visualizationEnabled = this.isFeatureEnabled('visualization-components');
    this.automaticOptimizationEnabled = this.isFeatureEnabled('automatic-optimization');

    // Load options
    this.maxDataPoints = this.getOption('max-data-points', 1000);
    this.dataRetentionPeriod = this.getOption('data-retention-period', 30 * 24 * 60 * 60 * 1000);
    this.pollingInterval = this.getOption('polling-interval', 60 * 1000);

    // Load Web Vitals thresholds
    const customThresholds = this.getOption('web-vitals-thresholds', {});
    this.webVitalsThresholds = {
      ...this.webVitalsThresholds,
      ...customThresholds
    };
  }

  /**
   * Initialize Web Vitals tracking
   */
  private initializeWebVitalsTracking(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('Web Vitals tracking is only available in browser environments');
        return;
      }

      // Try to import web-vitals library dynamically (optional)
      try {
        // Use eval to prevent Vite from analyzing this import
        const importWebVitals = new Function('return import("web-vitals")');
        importWebVitals().then((webVitals: any) => {
          // Track FCP
          if (webVitals.onFCP) {
            webVitals.onFCP((metric: any) => {
              this.recordWebVitalMetric({
                name: WebVitalType.FCP,
                value: metric.value,
                rating: this.getRating(WebVitalType.FCP, metric.value),
                delta: metric.delta,
                entries: metric.entries,
                id: metric.id,
                navigationType: metric.navigationType
              });
            });
          }

          // Track LCP
          if (webVitals.onLCP) {
            webVitals.onLCP((metric: any) => {
              this.recordWebVitalMetric({
                name: WebVitalType.LCP,
                value: metric.value,
                rating: this.getRating(WebVitalType.LCP, metric.value),
                delta: metric.delta,
                entries: metric.entries,
                id: metric.id,
                navigationType: metric.navigationType
              });
            });
          }

          // Track CLS
          if (webVitals.onCLS) {
            webVitals.onCLS((metric: any) => {
              this.recordWebVitalMetric({
                name: WebVitalType.CLS,
                value: metric.value,
                rating: this.getRating(WebVitalType.CLS, metric.value),
                delta: metric.delta,
                entries: metric.entries,
                id: metric.id,
                navigationType: metric.navigationType
              });
            });
          }

          // Track FID
          if (webVitals.onFID) {
            webVitals.onFID((metric: any) => {
              this.recordWebVitalMetric({
                name: WebVitalType.FID,
                value: metric.value,
                rating: this.getRating(WebVitalType.FID, metric.value),
                delta: metric.delta,
                entries: metric.entries,
                id: metric.id,
                navigationType: metric.navigationType
              });
            });
          }

          // Track INP
          if (webVitals.onINP) {
            webVitals.onINP((metric: any) => {
              this.recordWebVitalMetric({
                name: WebVitalType.INP,
                value: metric.value,
                rating: this.getRating(WebVitalType.INP, metric.value),
                delta: metric.delta,
                entries: metric.entries,
                id: metric.id,
                navigationType: metric.navigationType
              });
            });
          }

          // Track TTFB
          if (webVitals.onTTFB) {
            webVitals.onTTFB((metric: any) => {
              this.recordWebVitalMetric({
                name: WebVitalType.TTFB,
                value: metric.value,
                rating: this.getRating(WebVitalType.TTFB, metric.value),
                delta: metric.delta,
                entries: metric.entries,
                id: metric.id,
                navigationType: metric.navigationType
              });
            });
          }

          console.log('Web Vitals tracking initialized');
        }).catch((error: unknown) => {
          console.warn('Web Vitals library not available, using fallback metrics:', error);
          this.initializeFallbackMetrics();
        });
      } catch (error: unknown) {
        console.warn('Web Vitals library not available, using fallback metrics:', error);
        this.initializeFallbackMetrics();
      }

      // Track TTI using Performance API
      this.trackTTI();

    } catch (error: unknown) {
      console.error('Failed to initialize Web Vitals tracking:', error);
    }
  }

  /**
   * Initialize fallback metrics when web-vitals is not available
   */
  private initializeFallbackMetrics(): void {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    // Use Performance Observer API as fallback
    try {
      // Track paint metrics
      if ('PerformanceObserver' in window) {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.recordWebVitalMetric({
                name: WebVitalType.FCP,
                value: entry.startTime,
                rating: this.getRating(WebVitalType.FCP, entry.startTime)
              });
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });

        // Track layout shift
        const layoutShiftObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            const layoutShiftEntry = entry as { hadRecentInput?: boolean; value?: number };
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value || 0;
            }
          }
          if (clsValue > 0) {
            this.recordWebVitalMetric({
              name: WebVitalType.CLS,
              value: clsValue,
              rating: this.getRating(WebVitalType.CLS, clsValue)
            });
          }
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      }
    } catch (error: unknown) {
      console.warn('Performance Observer not available:', error);
    }
  }

  /**
   * Track Time to Interactive (TTI) using Performance API
   */
  private trackTTI(): void {
    if (typeof window === 'undefined' || !window.performance || !window.performance.timing) {
      return;
    }

    // Wait for the page to be fully loaded
    window.addEventListener('load', () => {
      // Wait for the main thread to be idle
      if ('requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback?: (callback: () => void) => void }).requestIdleCallback?.(() => {
          const navigationStart = window.performance.timing.navigationStart;
          const firstConsistentlyInteractive = Date.now() - navigationStart;

          this.recordWebVitalMetric({
            name: WebVitalType.TTI,
            value: firstConsistentlyInteractive,
            rating: this.getRating(WebVitalType.TTI, firstConsistentlyInteractive)
          });
        });
      }
    });
  }

  /**
   * Start polling for performance metrics
   */
  private startPolling(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.pollingIntervalId = window.setInterval(() => {
      this.collectPerformanceMetrics();
    }, this.pollingInterval);
  }

  /**
   * Stop polling for performance metrics
   */
  private stopPolling(): void {
    if (this.pollingIntervalId !== null && typeof window !== 'undefined') {
      window.clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
  }

  /**
   * Collect performance metrics
   */
  private collectPerformanceMetrics(): void {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    try {
      // Collect memory usage if available
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        const usedHeapSize = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
        
        this.recordMetric('memory-usage', usedHeapSize, 'MB', {
          totalHeapSize: (memory.totalJSHeapSize / (1024 * 1024)).toFixed(2),
          heapSizeLimit: (memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(2)
        });
        
        this.addHistoricalDataPoint('memory-usage', usedHeapSize);
      }

      // Collect JavaScript execution time
      const performanceEntries = performance.getEntriesByType('measure');
      let totalJsExecutionTime = 0;
      
      for (const entry of performanceEntries) {
        if (entry.name.startsWith('js-')) {
          totalJsExecutionTime += entry.duration;
        }
      }
      
      if (totalJsExecutionTime > 0) {
        this.recordMetric('js-execution-time', totalJsExecutionTime, 'ms');
        this.addHistoricalDataPoint('js-execution-time', totalJsExecutionTime);
      }

      // Collect resource timing data
      const resourceEntries = performance.getEntriesByType('resource');
      let totalTransferSize = 0;
      
      for (const entry of resourceEntries) {
        if (entry.name.endsWith('.js') && 'transferSize' in entry) {
          totalTransferSize += (entry as any).transferSize;
        }
      }
      
      if (totalTransferSize > 0) {
        const bundleSize = totalTransferSize / 1024; // Convert to KB
        this.recordMetric('bundle-size', bundleSize, 'KB');
        this.addHistoricalDataPoint('bundle-size', bundleSize);
      }

      // Clear performance entries to avoid memory leaks
      performance.clearMeasures();
      performance.clearMarks();
      performance.clearResourceTimings();

    } catch (error) {
      console.error('Error collecting performance metrics:', error);
    }
  }

  /**
   * Create default visualizations
   */
  private createDefaultVisualizations(): void {
    // Web Vitals Dashboard
    this.createVisualization({
      id: 'web-vitals-dashboard',
      type: 'chart',
      title: 'Web Vitals Dashboard',
      description: 'Overview of Core Web Vitals metrics',
      metrics: [
        WebVitalType.FCP,
        WebVitalType.LCP,
        WebVitalType.CLS,
        WebVitalType.FID,
        WebVitalType.INP
      ],
      options: {
        chartType: 'line',
        timeRange: '24h'
      },
      render: () => document.createElement('div') // Placeholder implementation
    });

    // Resource Usage Dashboard
    this.createVisualization({
      id: 'resource-usage-dashboard',
      type: 'chart',
      title: 'Resource Usage Dashboard',
      description: 'Memory and JavaScript execution metrics',
      metrics: [
        'memory-usage',
        'js-execution-time',
        'bundle-size'
      ],
      options: {
        chartType: 'area',
        timeRange: '24h'
      },
      render: () => document.createElement('div') // Placeholder implementation
    });

    // Performance Score Gauge
    this.createVisualization({
      id: 'performance-score-gauge',
      type: 'gauge',
      title: 'Performance Score',
      description: 'Overall performance score based on Web Vitals',
      metrics: [
        WebVitalType.FCP,
        WebVitalType.LCP,
        WebVitalType.CLS,
        WebVitalType.FID
      ],
      options: {
        min: 0,
        max: 100,
        thresholds: [
          { value: 0, color: 'red' },
          { value: 50, color: 'orange' },
          { value: 90, color: 'green' }
        ]
      },
      render: () => document.createElement('div') // Placeholder implementation
    });
  }

  /**
   * Record a Web Vital metric
   * 
   * @param metric The Web Vital metric
   */
  private recordWebVitalMetric(metric: WebVitalMetric): void {
    // Record the metric using the base class method
    this.recordMetric(
      metric.name,
      metric.value,
      this.getUnitForWebVital(metric.name),
      {
        rating: metric.rating,
        navigationType: metric.navigationType || 'unknown'
      }
    );

    // Add to historical data
    this.addHistoricalDataPoint(metric.name, metric.value, {
      rating: metric.rating,
      navigationType: metric.navigationType
    });

    // Emit Web Vital recorded event
    this.emitEvent(OptimizationEventType.METRIC_RECORDED, {
      webVital: metric
    });

    // Check if automatic optimization is enabled
    if (this.automaticOptimizationEnabled) {
      this.applyAutomaticOptimizations(metric);
    }
  }

  /**
   * Add a data point to historical data
   * 
   * @param metricName The metric name
   * @param value The metric value
   * @param context Optional context information
   */
  private addHistoricalDataPoint(metricName: string, value: number, context?: Record<string, unknown>): void {
    if (!this.historicalDataEnabled) {
      return;
    }

    const metricData = this.historicalData.get(metricName);
    
    if (!metricData) {
      return;
    }

    // Add new data point
    metricData.dataPoints.push({
      timestamp: Date.now(),
      value,
      ...(context && { context })
    });

    // Trim data points if exceeding max count
    if (metricData.dataPoints.length > this.maxDataPoints) {
      metricData.dataPoints = metricData.dataPoints.slice(-this.maxDataPoints);
    }

    // Remove old data points based on retention period
    const cutoffTime = Date.now() - this.dataRetentionPeriod;
    metricData.dataPoints = metricData.dataPoints.filter(point => point.timestamp >= cutoffTime);
  }

  /**
   * Get the unit for a Web Vital metric
   * 
   * @param vitalType The Web Vital type
   * @returns The unit for the metric
   */
  private getUnitForWebVital(vitalType: WebVitalType): string {
    switch (vitalType) {
      case WebVitalType.CLS:
        return 'score';
      default:
        return 'ms';
    }
  }

  /**
   * Get the rating for a Web Vital metric
   * 
   * @param vitalType The Web Vital type
   * @param value The metric value
   * @returns The rating ('good', 'needs-improvement', or 'poor')
   */
  private getRating(vitalType: WebVitalType, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = this.webVitalsThresholds[vitalType];
    
    if (!thresholds) {
      return 'needs-improvement';
    }

    if (value <= thresholds.good) {
      return 'good';
    } else if (value <= thresholds.poor) {
      return 'needs-improvement';
    } else {
      return 'poor';
    }
  }

  /**
   * Apply automatic optimizations based on metrics
   * 
   * @param metric The Web Vital metric
   */
  private applyAutomaticOptimizations(metric: WebVitalMetric): void {
    if (metric.rating === 'good') {
      return;
    }

    // Implement optimization strategies based on the metric
    switch (metric.name) {
      case WebVitalType.LCP:
        if (metric.rating === 'poor') {
          this.optimizeLCP();
        }
        break;
      case WebVitalType.CLS:
        if (metric.rating === 'poor') {
          this.optimizeCLS();
        }
        break;
      case WebVitalType.FID:
      case WebVitalType.INP:
        if (metric.rating === 'poor') {
          this.optimizeInteractivity();
        }
        break;
    }
  }

  /**
   * Optimize Largest Contentful Paint
   */
  private optimizeLCP(): void {
    // Implement LCP optimization strategies
    // For example, preload critical resources, optimize images, etc.
    console.log('Applying LCP optimizations');

    // Emit optimization event
    this.emitEvent(OptimizationEventType.STARTED, {
      optimization: 'lcp',
      message: 'Applying LCP optimizations'
    });

    // Example: Preload critical images
    if (typeof document !== 'undefined') {
      const criticalImages = document.querySelectorAll('img[data-critical="true"]');
      
      criticalImages.forEach(img => {
        const src = img.getAttribute('src');
        
        if (src) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          document.head.appendChild(link);
        }
      });
    }
  }

  /**
   * Optimize Cumulative Layout Shift
   */
  private optimizeCLS(): void {
    // Implement CLS optimization strategies
    // For example, set image dimensions, avoid dynamic content insertion, etc.
    console.log('Applying CLS optimizations');

    // Emit optimization event
    this.emitEvent(OptimizationEventType.STARTED, {
      optimization: 'cls',
      message: 'Applying CLS optimizations'
    });

    // Example: Set dimensions for images without width/height
    if (typeof document !== 'undefined') {
      const images = document.querySelectorAll('img:not([width]):not([height])');
      
      images.forEach(img => {
        // Set default dimensions to prevent layout shifts
        img.setAttribute('width', '100%');
        img.setAttribute('height', 'auto');
        (img as HTMLImageElement).style.aspectRatio = '16/9';
      });
    }
  }

  /**
   * Optimize interactivity (FID/INP)
   */
  private optimizeInteractivity(): void {
    // Implement interactivity optimization strategies
    // For example, break up long tasks, optimize event handlers, etc.
    console.log('Applying interactivity optimizations');

    // Emit optimization event
    this.emitEvent(OptimizationEventType.STARTED, {
      optimization: 'interactivity',
      message: 'Applying interactivity optimizations'
    });

    // Example: Defer non-critical JavaScript
    if (typeof document !== 'undefined') {
      const scripts = document.querySelectorAll('script:not([async]):not([defer])');
      
      scripts.forEach(script => {
        if (!script.hasAttribute('critical')) {
          script.setAttribute('defer', '');
        }
      });
    }
  }

  /**
   * Create a visualization component
   * 
   * @param visualization The visualization component
   */
  public createVisualization(visualization: PerformanceVisualization): void {
    this.visualizations.set(visualization.id, visualization);
  }

  /**
   * Get a visualization component by ID
   * 
   * @param id The visualization ID
   * @returns The visualization component or undefined if not found
   */
  public getVisualization(id: string): PerformanceVisualization | undefined {
    return this.visualizations.get(id);
  }

  /**
   * Get all visualization components
   * 
   * @returns All visualization components
   */
  public getAllVisualizations(): PerformanceVisualization[] {
    return Array.from(this.visualizations.values());
  }

  /**
   * Get historical data for a metric
   * 
   * @param metricName The metric name
   * @param timeRange Optional time range in milliseconds
   * @returns The historical data points or undefined if not found
   */
  public getHistoricalData(metricName: string, timeRange?: number): HistoricalDataPoint[] | undefined {
    const metricData = this.historicalData.get(metricName);
    
    if (!metricData) {
      return undefined;
    }

    if (!timeRange) {
      return [...metricData.dataPoints];
    }

    const cutoffTime = Date.now() - timeRange;
    return metricData.dataPoints.filter(point => point.timestamp >= cutoffTime);
  }

  /**
   * Get the latest value for a metric
   * 
   * @param metricName The metric name
   * @returns The latest value or undefined if not found
   */
  public getLatestValue(metricName: string): number | undefined {
    const metricData = this.historicalData.get(metricName);
    
    if (!metricData || metricData.dataPoints.length === 0) {
      return undefined;
    }

    return metricData.dataPoints[metricData.dataPoints.length - 1].value;
  }

  /**
   * Calculate the performance score based on Web Vitals
   * 
   * @returns The performance score (0-100)
   */
  public calculatePerformanceScore(): number {
    // Get latest values for core Web Vitals
    const lcp = this.getLatestValue(WebVitalType.LCP);
    const cls = this.getLatestValue(WebVitalType.CLS);
    const fid = this.getLatestValue(WebVitalType.FID);
    const inp = this.getLatestValue(WebVitalType.INP);

    // Calculate scores for each metric (0-100)
    const lcpScore = lcp ? this.calculateMetricScore(WebVitalType.LCP, lcp) : 0;
    const clsScore = cls ? this.calculateMetricScore(WebVitalType.CLS, cls) : 0;
    const interactivityScore = inp ? this.calculateMetricScore(WebVitalType.INP, inp) : 
                              fid ? this.calculateMetricScore(WebVitalType.FID, fid) : 0;

    // Weighted average (LCP: 40%, CLS: 30%, FID/INP: 30%)
    const weightedScore = (lcpScore * 0.4) + (clsScore * 0.3) + (interactivityScore * 0.3);
    
    return Math.round(weightedScore);
  }

  /**
   * Calculate a score for a metric (0-100)
   * 
   * @param vitalType The Web Vital type
   * @param value The metric value
   * @returns The score (0-100)
   */
  private calculateMetricScore(vitalType: WebVitalType, value: number): number {
    const thresholds = this.webVitalsThresholds[vitalType];
    
    if (!thresholds) {
      return 50;
    }

    if (value <= thresholds.good) {
      // Good range: 75-100
      const goodRatio = vitalType === WebVitalType.CLS ?
        (value / thresholds.good) :
        (thresholds.good / value);
      
      return 75 + (goodRatio * 25);
    } else if (value <= thresholds.poor) {
      // Needs improvement range: 50-75
      const improvementRatio = (thresholds.poor - value) / (thresholds.poor - thresholds.good);
      return 50 + (improvementRatio * 25);
    } else {
      // Poor range: 0-50
      const poorRatio = Math.min(value / (thresholds.poor * 2), 1);
      return 50 * (1 - poorRatio);
    }
  }

  /**
   * Reset the adapter
   */
  protected resetImpl(): void {
    // Stop polling
    this.stopPolling();
    
    // Clear historical data
    this.historicalData.clear();
    this.initializeHistoricalData();
    
    // Clear visualizations
    this.visualizations.clear();
    
    console.log('Performance monitor adapter reset');
  }
}

// Export lazy singleton instance
let _performanceMonitorAdapter: PerformanceMonitorAdapter | null = null;

export const performanceMonitorAdapter = {
  get instance(): PerformanceMonitorAdapter {
    if (!_performanceMonitorAdapter) {
      _performanceMonitorAdapter = new PerformanceMonitorAdapter();
    }
    return _performanceMonitorAdapter;
  }
};