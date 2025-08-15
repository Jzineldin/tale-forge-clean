/**
 * Tale Forge Unified Optimization Framework - Image Optimizer Adapter
 * 
 * This file implements a backward compatibility adapter for the image optimizer
 * with enhanced capabilities including modern format support, content-aware loading,
 * adaptive quality based on network conditions, and progressive image loading.
 */

import { imageOptimizer, ImageOptimizationOptions } from '@/utils/image-optimizer';
import { BaseOptimizer } from '../core/BaseOptimizer';
import { OptimizerType, OptimizationEventType } from '../core/types';
import { EventEmitter } from '../utils/EventEmitter';
import { ConfigManager } from '../config/ConfigManager';
import { featureFlagManager } from '../utils/FeatureFlagManager';

/**
 * Image format with browser support information
 */
export interface ImageFormat {
  extension: string;
  mimeType: string;
  quality: number; // 1-10 scale, higher is better quality
  compressionRatio: number; // Higher means smaller file size
  browserSupport: string[]; // List of supported browsers
}

/**
 * Available image formats in order of preference
 */
const IMAGE_FORMATS: ImageFormat[] = [
  {
    extension: 'avif',
    mimeType: 'image/avif',
    quality: 9,
    compressionRatio: 10,
    browserSupport: ['chrome', 'firefox', 'opera']
  },
  {
    extension: 'webp',
    mimeType: 'image/webp',
    quality: 8,
    compressionRatio: 9,
    browserSupport: ['chrome', 'firefox', 'safari', 'edge', 'opera']
  },
  {
    extension: 'jpg',
    mimeType: 'image/jpeg',
    quality: 7,
    compressionRatio: 7,
    browserSupport: ['chrome', 'firefox', 'safari', 'edge', 'opera']
  },
  {
    extension: 'png',
    mimeType: 'image/png',
    quality: 10,
    compressionRatio: 5,
    browserSupport: ['chrome', 'firefox', 'safari', 'edge', 'opera']
  }
];

/**
 * Image loading priority
 */
export enum ImageLoadingPriority {
  CRITICAL = 0, // Must load immediately (e.g., hero images, above the fold)
  HIGH = 1,     // Should load soon (e.g., visible but not critical)
  MEDIUM = 2,   // Load when convenient (e.g., just below the fold)
  LOW = 3       // Load only when needed (e.g., far below the fold)
}

/**
 * Enhanced image optimization options
 */
export interface EnhancedImageOptimizationOptions extends ImageOptimizationOptions {
  priority?: ImageLoadingPriority;
  formats?: string[]; // Preferred formats in order
  progressive?: boolean; // Whether to use progressive loading
  placeholder?: 'blur' | 'color' | 'none'; // Type of placeholder to use
  contentType?: 'hero' | 'thumbnail' | 'background' | 'content'; // Type of content
  lazyMargin?: string; // Custom margin for lazy loading
  quality?: number; // 1-100 quality setting
}

/**
 * Network condition thresholds
 */
const NETWORK_THRESHOLDS = {
  SLOW: 1.0, // Mbps
  MEDIUM: 5.0, // Mbps
  FAST: 10.0 // Mbps
};

/**
 * Quality settings based on network conditions
 */
const QUALITY_SETTINGS = {
  SLOW: {
    quality: 60,
    preferredFormats: ['webp', 'jpg'],
    usePlaceholder: true,
    useProgressive: true
  },
  MEDIUM: {
    quality: 75,
    preferredFormats: ['webp', 'jpg'],
    usePlaceholder: true,
    useProgressive: true
  },
  FAST: {
    quality: 85,
    preferredFormats: ['avif', 'webp'],
    usePlaceholder: false,
    useProgressive: false
  }
};

/**
 * Type for original optimizer methods
 */
interface OriginalOptimizerMethods {
  initializeLazyLoading: () => void;
  observeImage: (img: HTMLImageElement) => void;
  generateResponsiveSources: (src: string, width: number, height: number) => {
    srcSet: string;
    sizes: string;
    src: string;
  };
  preloadImage: (src: string) => Promise<void>;
  getOptimizedDimensions: (originalWidth: number, originalHeight: number, maxWidth?: number) => {
    width: number;
    height: number;
  };
  destroy: () => void;
}

/**
 * Adapter for the legacy image optimizer
 * Provides backward compatibility with the existing image optimizer
 * while adding enhanced capabilities
 */
export class ImageOptimizerAdapter extends BaseOptimizer {
  private originalOptimizer: typeof imageOptimizer;
  private originalMethods!: OriginalOptimizerMethods;
  private supportedFormats: string[] = ['jpg', 'png']; // Default
  private networkCondition: 'SLOW' | 'MEDIUM' | 'FAST' = 'MEDIUM';
  private loadingQueue: Map<string, EnhancedImageOptimizationOptions> = new Map();
  private loadedImages: Set<string> = new Set();
  private imageStats: Map<string, { loadTime: number; size: number; format: string }> = new Map();

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
    super(OptimizerType.IMAGE, eventEmitter, configManager);
    this.originalOptimizer = imageOptimizer;
    
    // Store original methods for restoration if needed
    this.backupOriginalMethods();
    
    // Detect supported image formats
    this.detectSupportedFormats();
    
    // Monitor network conditions
    this.monitorNetworkConditions();
  }

  /**
   * Backup original methods for restoration
   */
  private backupOriginalMethods(): void {
    this.originalMethods = {
      initializeLazyLoading: this.originalOptimizer.initializeLazyLoading.bind(this.originalOptimizer),
      observeImage: this.originalOptimizer.observeImage.bind(this.originalOptimizer),
      generateResponsiveSources: this.originalOptimizer.generateResponsiveSources.bind(this.originalOptimizer),
      preloadImage: this.originalOptimizer.preloadImage.bind(this.originalOptimizer),
      getOptimizedDimensions: this.originalOptimizer.getOptimizedDimensions.bind(this.originalOptimizer),
      destroy: this.originalOptimizer.destroy.bind(this.originalOptimizer)
    };
  }

  /**
   * Initialize the adapter
   */
  protected async initializeImpl(): Promise<void> {
    // Check if optimization is enabled
    if (!featureFlagManager.isEnabled('image-optimization')) {
      console.log('Image optimization is disabled');
      return;
    }

    // Override original methods with enhanced versions
    this.overrideOriginalMethods();
    
    console.log('Image optimizer adapter initialized');
  }

  /**
   * Reset the adapter
   */
  protected resetImpl(): void {
    // Restore original methods
    this.restoreOriginalMethods();
    
    // Clear internal state
    this.loadingQueue.clear();
    this.loadedImages.clear();
    this.imageStats.clear();
    
    console.log('Image optimizer adapter reset');
  }

  /**
   * Detect supported image formats in the current browser
   */
  private detectSupportedFormats(): void {
    if (typeof window === 'undefined') return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.warn('Canvas context not available for format detection');
      return;
    }
    
    this.supportedFormats = [];
    
    // Test each format
    IMAGE_FORMATS.forEach(format => {
      if (format.extension === 'jpg') {
        // JPEG is always supported
        this.supportedFormats.push(format.extension);
      } else {
        try {
          const dataUrl = canvas.toDataURL(format.mimeType);
          if (dataUrl.indexOf(format.mimeType) > -1) {
            this.supportedFormats.push(format.extension);
          }
        } catch (e) {
          // Format not supported
        }
      }
    });
    
    if (this.supportedFormats.length === 0) {
      // Fallback to jpg if no formats are detected
      this.supportedFormats = ['jpg', 'png'];
    }
    
    console.log('Detected supported image formats:', this.supportedFormats);
  }

  /**
   * Monitor network conditions to adapt loading strategy
   */
  private monitorNetworkConditions(): void {
    if (typeof window === 'undefined' || !('connection' in navigator)) return;
    
    const connection = (navigator as any).connection;
    
    const updateNetworkCondition = () => {
      const downlink = connection.downlink || 5.0;
      
      if (downlink >= NETWORK_THRESHOLDS.FAST) {
        this.networkCondition = 'FAST';
      } else if (downlink >= NETWORK_THRESHOLDS.MEDIUM) {
        this.networkCondition = 'MEDIUM';
      } else {
        this.networkCondition = 'SLOW';
      }
      
      this.recordMetric('network-speed', downlink, 'Mbps');
      console.log('Network condition updated:', this.networkCondition);
    };
    
    // Initial check
    updateNetworkCondition();
    
    // Listen for changes
    if (connection.addEventListener) {
      connection.addEventListener('change', updateNetworkCondition);
    }
  }

  /**
   * Get the best image format based on browser support and network conditions
   */
  private getBestImageFormat(preferredFormats?: string[]): string {
    // Start with preferred formats if provided
    let candidates = preferredFormats && preferredFormats.length > 0
      ? IMAGE_FORMATS.filter(format => 
          preferredFormats.includes(format.extension) && 
          this.supportedFormats.includes(format.extension)
        )
      : IMAGE_FORMATS.filter(format => 
          this.supportedFormats.includes(format.extension)
        );
    
    if (candidates.length === 0) return 'jpg'; // Fallback
    
    // Get network-based preferred formats
    const networkPreferredFormats = QUALITY_SETTINGS[this.networkCondition].preferredFormats;
    
    // Filter by network preference if possible
    const networkCandidates = candidates.filter(format => 
      networkPreferredFormats.includes(format.extension)
    );
    
    if (networkCandidates.length > 0) {
      candidates = networkCandidates;
    }
    
    // Sort by criteria based on network condition
    if (this.networkCondition === 'FAST') {
      // Prefer quality on fast connections
      candidates.sort((a, b) => b.quality - a.quality);
    } else if (this.networkCondition === 'SLOW') {
      // Prefer compression on slow connections
      candidates.sort((a, b) => b.compressionRatio - a.compressionRatio);
    } else {
      // Balance quality and compression on medium connections
      candidates.sort((a, b) => 
        (b.quality * 0.5 + b.compressionRatio * 0.5) - 
        (a.quality * 0.5 + a.compressionRatio * 0.5)
      );
    }
    
    return candidates[0].extension;
  }

  /**
   * Get quality setting based on network conditions and content type
   */
  private getQualitySetting(options: EnhancedImageOptimizationOptions): number {
    // Start with network-based quality
    let quality = QUALITY_SETTINGS[this.networkCondition].quality;
    
    // Adjust based on content type
    if (options.contentType === 'hero') {
      // Hero images get higher quality
      quality = Math.min(quality + 10, 100);
    } else if (options.contentType === 'thumbnail') {
      // Thumbnails can use lower quality
      quality = Math.max(quality - 10, 30);
    }
    
    // Use explicit quality if provided
    if (options.quality !== undefined) {
      quality = options.quality;
    }
    
    return quality;
  }

  /**
   * Generate a color placeholder from an image
   */
  private async generateColorPlaceholder(src: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          resolve('#eeeeee'); // Fallback color
          return;
        }
        
        canvas.width = 1;
        canvas.height = 1;
        
        context.drawImage(img, 0, 0, 1, 1);
        const data = context.getImageData(0, 0, 1, 1).data;
        
        const color = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
        resolve(color);
      };
      
      img.onerror = () => {
        resolve('#eeeeee'); // Fallback color
      };
      
      img.src = src;
    });
  }

  /**
   * Generate a blur placeholder from an image
   */
  private async generateBlurPlaceholder(src: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          resolve(''); // Fallback to no placeholder
          return;
        }
        
        // Create a tiny version for the blur
        canvas.width = 10;
        canvas.height = 10 * (img.height / img.width);
        
        // Draw the image at a small size
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get the data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.1);
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        resolve(''); // Fallback to no placeholder
      };
      
      img.src = src;
    });
  }

  /**
   * Override original methods with enhanced versions
   */
  private overrideOriginalMethods(): void {
    // Override initializeLazyLoading method
    this.originalOptimizer.initializeLazyLoading = () => {
      const startTime = performance.now();
      
      try {
        // Emit event
        this.emitEvent(OptimizationEventType.STARTED, {
          method: 'initializeLazyLoading'
        });
        
        // Call original method
        this.originalMethods.initializeLazyLoading();
        
        // Calculate duration
        const duration = performance.now() - startTime;
        
        // Record metrics
        this.recordMetric('image-init-time', duration, 'ms');
        
        // Emit event
        this.emitEvent(OptimizationEventType.COMPLETED, {
          method: 'initializeLazyLoading',
          duration
        });
      } catch (error) {
        // Calculate duration
        const duration = performance.now() - startTime;
        
        // Record error metric
        this.recordMetric('image-init-error', 1, 'count', {
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Emit event
        this.emitEvent(OptimizationEventType.FAILED, {
          method: 'initializeLazyLoading',
          duration,
          error: error instanceof Error ? error.message : String(error)
        });
        
        throw error;
      }
    };
    
    // Override observeImage method
    this.originalOptimizer.observeImage = (img: HTMLImageElement) => {
      const startTime = performance.now();
      const src = img.dataset.src || '';
      
      try {
        // Emit event
        this.emitEvent(OptimizationEventType.STARTED, {
          method: 'observeImage',
          src
        });
        
        // Get options from queue or use defaults
        const options = this.loadingQueue.get(src) || {
          src,
          alt: img.alt,
          loading: 'lazy'
        };
        
        // Apply enhanced attributes
        if (options.priority !== undefined) {
          // Set loading attribute based on priority
          if (options.priority === ImageLoadingPriority.CRITICAL) {
            img.loading = 'eager';
          } else {
            img.loading = 'lazy';
          }
          
          // Set fetchpriority attribute if supported
          if ('fetchpriority' in img) {
            if (options.priority === ImageLoadingPriority.CRITICAL) {
              (img as any).fetchpriority = 'high';
            } else if (options.priority === ImageLoadingPriority.HIGH) {
              (img as any).fetchpriority = 'high';
            } else if (options.priority === ImageLoadingPriority.LOW) {
              (img as any).fetchpriority = 'low';
            }
          }
        }
        
        // Set custom lazy margin if provided
        if (options.lazyMargin) {
          img.dataset.lazyMargin = options.lazyMargin;
        }
        
        // Apply progressive loading if enabled
        if (options.progressive) {
          img.classList.add('progressive');
          
          // Generate placeholder based on type
          if (options.placeholder === 'blur') {
            this.generateBlurPlaceholder(src).then(placeholder => {
              if (placeholder) {
                img.style.backgroundImage = `url(${placeholder})`;
                img.style.backgroundSize = 'cover';
                img.style.backgroundPosition = 'center';
                img.style.filter = 'blur(10px)';
              }
            });
          } else if (options.placeholder === 'color') {
            this.generateColorPlaceholder(src).then(color => {
              img.style.backgroundColor = color;
            });
          }
          
          // Add transition for smooth loading
          img.style.transition = 'filter 0.3s ease-out';
          
          // Add load event listener to remove blur
          const originalOnload = img.onload;
          img.onload = (event) => {
            img.style.filter = 'none';
            if (originalOnload) {
              originalOnload.call(img, event);
            }
          };
        }
        
        // Call original method
        this.originalMethods.observeImage(img);
        
        // Calculate duration
        const duration = performance.now() - startTime;
        
        // Record metrics
        this.recordMetric('image-observe-time', duration, 'ms', {
          src,
          priority: options.priority?.toString() || 'undefined'
        });
        
        // Emit event
        this.emitEvent(OptimizationEventType.COMPLETED, {
          method: 'observeImage',
          src,
          duration
        });
      } catch (error) {
        // Calculate duration
        const duration = performance.now() - startTime;
        
        // Record error metric
        this.recordMetric('image-observe-error', 1, 'count', {
          src,
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Emit event
        this.emitEvent(OptimizationEventType.FAILED, {
          method: 'observeImage',
          src,
          duration,
          error: error instanceof Error ? error.message : String(error)
        });
        
        throw error;
      }
    };
    
    // Override generateResponsiveSources method
    this.originalOptimizer.generateResponsiveSources = (src: string) => {
      const startTime = performance.now();
      
      try {
        // Emit event
        this.emitEvent(OptimizationEventType.STARTED, {
          method: 'generateResponsiveSources',
          src
        });
        
        // Get options from queue or use defaults
        const options = this.loadingQueue.get(src) || {
          src,
          alt: ''
        };
        
        // Determine best format
        const format = this.getBestImageFormat(options.formats);
        
        // Determine quality
        const quality = this.getQualitySetting(options);
        
        // Generate base URL without extension
        const baseUrl = src.replace(/\.[^/.]+$/, '');
        
        // Generate responsive sources with modern formats
        const result = {
          srcSet: `
            ${baseUrl}-320w.${format} 320w,
            ${baseUrl}-640w.${format} 640w,
            ${baseUrl}-1024w.${format} 1024w,
            ${baseUrl}-1280w.${format} 1280w
          `,
          sizes: options.sizes || '(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 1024px) 1024px, 1280px',
          src: `${baseUrl}-640w.${format}?q=${quality}`
        };
        
        // Calculate duration
        const duration = performance.now() - startTime;
        
        // Record metrics
        this.recordMetric('image-sources-time', duration, 'ms', {
          src,
          format,
          quality: quality.toString()
        });
        
        // Emit event
        this.emitEvent(OptimizationEventType.COMPLETED, {
          method: 'generateResponsiveSources',
          src,
          format,
          quality,
          duration
        });
        
        return result;
      } catch (error) {
        // Calculate duration
        const duration = performance.now() - startTime;
        
        // Record error metric
        this.recordMetric('image-sources-error', 1, 'count', {
          src,
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Emit event
        this.emitEvent(OptimizationEventType.FAILED, {
          method: 'generateResponsiveSources',
          src,
          duration,
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Fall back to original method
        return this.originalMethods.generateResponsiveSources(src, 0, 0);
      }
    };
    
    // Override preloadImage method
    this.originalOptimizer.preloadImage = async (src: string) => {
      const startTime = performance.now();
      
      try {
        // Emit event
        this.emitEvent(OptimizationEventType.STARTED, {
          method: 'preloadImage',
          src
        });
        
        // Get options from queue or use defaults
        const options = this.loadingQueue.get(src) || {
          src,
          alt: '',
          loading: 'eager'
        };
        
        // Determine best format
        const format = this.getBestImageFormat(options.formats);
        
        // Determine quality
        const quality = this.getQualitySetting(options);
        
        // Generate optimized URL
        const baseUrl = src.replace(/\.[^/.]+$/, '');
        const optimizedSrc = `${baseUrl}.${format}?q=${quality}`;
        
        // Call original method with optimized URL
        await this.originalMethods.preloadImage(optimizedSrc);
        
        // Add to loaded images
        this.loadedImages.add(src);
        
        // Calculate duration
        const duration = performance.now() - startTime;
        
        // Record metrics
        this.recordMetric('image-preload-time', duration, 'ms', {
          src,
          format,
          quality: quality.toString()
        });
        
        // Store image stats
        this.imageStats.set(src, {
          loadTime: duration,
          size: 0, // We don't know the size yet
          format
        });
        
        // Emit event
        this.emitEvent(OptimizationEventType.COMPLETED, {
          method: 'preloadImage',
          src,
          format,
          quality,
          duration
        });
      } catch (error) {
        // Calculate duration
        const duration = performance.now() - startTime;
        
        // Record error metric
        this.recordMetric('image-preload-error', 1, 'count', {
          src,
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Emit event
        this.emitEvent(OptimizationEventType.FAILED, {
          method: 'preloadImage',
          src,
          duration,
          error: error instanceof Error ? error.message : String(error)
        });
        
        throw error;
      }
    };
    
    // Override getOptimizedDimensions method
    this.originalOptimizer.getOptimizedDimensions = (originalWidth: number, originalHeight: number, maxWidth: number = 1280) => {
      try {
        // Call original method
        return this.originalMethods.getOptimizedDimensions(originalWidth, originalHeight, maxWidth);
      } catch (error) {
        // Record error metric
        this.recordMetric('image-dimensions-error', 1, 'count', {
          error: error instanceof Error ? error.message : String(error)
        });
        
        throw error;
      }
    };
    
    // Override destroy method
    this.originalOptimizer.destroy = () => {
      try {
        // Emit event
        this.emitEvent(OptimizationEventType.STARTED, {
          method: 'destroy'
        });
        
        // Call original method
        this.originalMethods.destroy();
        
        // Clear internal state
        this.loadingQueue.clear();
        this.loadedImages.clear();
        this.imageStats.clear();
        
        // Emit event
        this.emitEvent(OptimizationEventType.COMPLETED, {
          method: 'destroy'
        });
      } catch (error) {
        // Record error metric
        this.recordMetric('image-destroy-error', 1, 'count', {
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Emit event
        this.emitEvent(OptimizationEventType.FAILED, {
          method: 'destroy',
          error: error instanceof Error ? error.message : String(error)
        });
        
        throw error;
      }
    };
  }

  /**
   * Restore original methods
   */
  private restoreOriginalMethods(): void {
    // Restore all original methods
    for (const [methodName, method] of Object.entries(this.originalMethods)) {
      (this.originalOptimizer as any)[methodName] = method;
    }
  }

  /**
   * Get the original optimizer instance
   * 
   * @returns The original optimizer instance
   */
  public getOriginalOptimizer(): typeof imageOptimizer {
    return this.originalOptimizer;
  }

  /**
   * Queue an image for loading with enhanced options
   * 
   * @param options Enhanced image optimization options
   */
  public queueImage(options: EnhancedImageOptimizationOptions): void {
    this.loadingQueue.set(options.src, options);
  }

  /**
   * Preload critical images with enhanced options
   * 
   * @param images Array of enhanced image options
   */
  public async preloadCriticalImages(images: EnhancedImageOptimizationOptions[]): Promise<void> {
    // Sort by priority
    const sortedImages = [...images].sort((a, b) => {
      const priorityA = a.priority !== undefined ? a.priority : ImageLoadingPriority.MEDIUM;
      const priorityB = b.priority !== undefined ? b.priority : ImageLoadingPriority.MEDIUM;
      return priorityA - priorityB;
    });
    
    // Queue all images
    for (const image of sortedImages) {
      this.queueImage(image);
    }
    
    // Preload critical and high priority images
    const criticalImages = sortedImages.filter(img => 
      img.priority === ImageLoadingPriority.CRITICAL || 
      img.priority === ImageLoadingPriority.HIGH
    );
    
    // Preload in sequence to ensure critical images load first
    for (const image of criticalImages) {
      await this.originalOptimizer.preloadImage(image.src);
    }
  }

  /**
   * Get image loading statistics
   * 
   * @returns Image loading statistics
   */
  public getImageStats(): {
    loadedCount: number;
    queuedCount: number;
    averageLoadTime: number;
    formatDistribution: Record<string, number>;
  } {
    let totalLoadTime = 0;
    let loadTimeCount = 0;
    const formatDistribution: Record<string, number> = {};
    
    for (const stats of this.imageStats.values()) {
      totalLoadTime += stats.loadTime;
      loadTimeCount++;
      
      const format = stats.format;
      formatDistribution[format] = (formatDistribution[format] || 0) + 1;
    }
    
    return {
      loadedCount: this.loadedImages.size,
      queuedCount: this.loadingQueue.size,
      averageLoadTime: loadTimeCount > 0 ? totalLoadTime / loadTimeCount : 0,
      formatDistribution
    };
  }

  /**
   * Set the priority for an image
   * 
   * @param src The image source
   * @param priority The priority level
   */
  public setImagePriority(src: string, priority: ImageLoadingPriority): void {
    const options = this.loadingQueue.get(src);
    
    if (options) {
      options.priority = priority;
      this.loadingQueue.set(src, options);
    } else {
      this.queueImage({
        src,
        alt: '',
        priority
      });
    }
  }
}

// Export singleton instance
export const imageOptimizerAdapter = new ImageOptimizerAdapter();