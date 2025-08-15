/**
 * Image Optimization and Lazy Loading System
 */

export interface ImageOptimizationOptions {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export class ImageOptimizer {
  private static instance: ImageOptimizer;
  private observer: IntersectionObserver | null = null;
  private loadedImages = new Set<string>();

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  /**
   * Initialize lazy loading with Intersection Observer
   */
  initializeLazyLoading(): void {
    if (typeof window === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.observer?.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );
  }

  /**
   * Load image with optimization
   */
  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (!src || this.loadedImages.has(src)) return;

    img.src = src;
    img.classList.add('loading');
    
    img.onload = () => {
      img.classList.remove('loading');
      img.classList.add('loaded');
      this.loadedImages.add(src);
    };

    img.onerror = () => {
      img.classList.remove('loading');
      img.classList.add('error');
      console.error(`Failed to load image: ${src}`);
    };
  }

  /**
   * Observe image for lazy loading
   */
  observeImage(img: HTMLImageElement): void {
    if (!this.observer) {
      this.initializeLazyLoading();
    }
    
    if (img.dataset.src && !this.loadedImages.has(img.dataset.src)) {
      this.observer?.observe(img);
    }
  }

  /**
   * Generate responsive image sources
   */
  generateResponsiveSources(src: string) {
    const baseUrl = src.replace(/\.[^/.]+$/, '');
    const extension = src.split('.').pop();
    
    return {
      srcSet: `
        ${baseUrl}-320w.${extension} 320w,
        ${baseUrl}-640w.${extension} 640w,
        ${baseUrl}-1024w.${extension} 1024w,
        ${baseUrl}-1280w.${extension} 1280w
      `,
      sizes: '(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 1024px) 1024px, 1280px',
      src: `${baseUrl}-640w.${extension}`
    };
  }

  /**
   * Preload critical images
   */
  preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
      img.src = src;
    });
  }

  /**
   * Get image dimensions for optimization
   */
  getOptimizedDimensions(originalWidth: number, originalHeight: number, maxWidth: number = 1280) {
    const aspectRatio = originalWidth / originalHeight;
    
    if (originalWidth > maxWidth) {
      return {
        width: maxWidth,
        height: Math.round(maxWidth / aspectRatio)
      };
    }
    
    return { width: originalWidth, height: originalHeight };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.loadedImages.clear();
  }
}

// Export singleton instance
export const imageOptimizer = ImageOptimizer.getInstance();