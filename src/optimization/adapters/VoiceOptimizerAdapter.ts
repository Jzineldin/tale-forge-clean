/**
 * Tale Forge Unified Optimization Framework - Voice Optimizer Adapter
 * 
 * This file implements a backward compatibility adapter for the voice optimizer
 * with enhanced capabilities including shared AudioContext pool, streaming support,
 * adaptive format selection, priority-based loading, and memory-aware caching.
 */

import { voiceOptimizer, VoiceAsset, VoiceLoadProgress } from '@/lib/voice-optimizer';
import { BaseOptimizer } from '../core/BaseOptimizer';
import { OptimizerType, OptimizationEventType } from '../core/types';
import { EventEmitter } from '../utils/EventEmitter';
import { ConfigManager } from '../config/ConfigManager';
import { featureFlagManager } from '../utils/FeatureFlagManager';

/**
 * Audio format with browser support information
 */
export interface AudioFormat {
  extension: string;
  mimeType: string;
  quality: number; // 1-10 scale, higher is better quality
  compressionRatio: number; // Higher means smaller file size
  browserSupport: string[]; // List of supported browsers
}

/**
 * Available audio formats in order of preference
 */
const AUDIO_FORMATS: AudioFormat[] = [
  {
    extension: 'mp3',
    mimeType: 'audio/mpeg',
    quality: 7,
    compressionRatio: 8,
    browserSupport: ['chrome', 'firefox', 'safari', 'edge', 'opera']
  },
  {
    extension: 'ogg',
    mimeType: 'audio/ogg',
    quality: 8,
    compressionRatio: 9,
    browserSupport: ['chrome', 'firefox', 'opera']
  },
  {
    extension: 'wav',
    mimeType: 'audio/wav',
    quality: 10,
    compressionRatio: 1,
    browserSupport: ['chrome', 'firefox', 'safari', 'edge', 'opera']
  },
  {
    extension: 'aac',
    mimeType: 'audio/aac',
    quality: 9,
    compressionRatio: 10,
    browserSupport: ['chrome', 'safari', 'edge']
  }
];

/**
 * Voice asset loading priority
 */
export enum VoiceAssetPriority {
  CRITICAL = 0, // Must load immediately (e.g., narrator voice)
  HIGH = 1,     // Should load soon (e.g., main character voices)
  MEDIUM = 2,   // Load when convenient (e.g., secondary character voices)
  LOW = 3       // Load only when needed (e.g., sound effects)
}

/**
 * Extended voice asset with additional metadata
 */
export interface EnhancedVoiceAsset extends VoiceAsset {
  priority: VoiceAssetPriority;
  lastAccessed?: number;
  accessCount?: number;
  memorySize?: number;
}

/**
 * Shared AudioContext pool for efficient audio processing
 */
class AudioContextPool {
  private static MAX_CONTEXTS = 4;
  private contexts: AudioContext[] = [];
  private inUse: Set<AudioContext> = new Set();

  /**
   * Get an available AudioContext from the pool
   */
  acquire(): AudioContext {
    // Check for an available context
    const availableContext = this.contexts.find(ctx => !this.inUse.has(ctx));
    
    if (availableContext) {
      this.inUse.add(availableContext);
      return availableContext;
    }
    
    // Create a new context if under the limit
    if (this.contexts.length < AudioContextPool.MAX_CONTEXTS) {
      const newContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.contexts.push(newContext);
      this.inUse.add(newContext);
      return newContext;
    }
    
    // If at limit, reuse the oldest context
    const oldestContext = this.contexts[0];
    return oldestContext;
  }

  /**
   * Release an AudioContext back to the pool
   */
  release(context: AudioContext): void {
    this.inUse.delete(context);
  }

  /**
   * Get the number of available contexts
   */
  get availableCount(): number {
    return this.contexts.length - this.inUse.size;
  }

  /**
   * Close all contexts and clear the pool
   */
  clear(): void {
    this.contexts.forEach(ctx => {
      try {
        ctx.close();
      } catch (e) {
        console.error('Error closing AudioContext:', e);
      }
    });
    
    this.contexts = [];
    this.inUse.clear();
  }
}

/**
 * Type for original voice optimizer methods
 */
interface OriginalVoiceOptimizerMethods {
  loadVoiceAsset: (assetId: string, onProgress?: (progress: VoiceLoadProgress) => void) => Promise<AudioBuffer>;
  preloadCriticalAssets: (assetIds: string[]) => Promise<void>;
  clearCache: () => void;
  getCacheSize: () => number;
  getLoadingProgress: () => Map<string, Promise<AudioBuffer>>;
}

/**
 * Adapter for the legacy voice optimizer
 * Provides backward compatibility with the existing voice optimizer
 * while adding enhanced capabilities
 */
export class VoiceOptimizerAdapter extends BaseOptimizer {
  private originalOptimizer: typeof voiceOptimizer;
  private originalMethods!: OriginalVoiceOptimizerMethods;
  private audioContextPool: AudioContextPool = new AudioContextPool();
  private enhancedCache = new Map<string, EnhancedVoiceAsset>();
  // Removed unused loadingPriorityQueue
  private maxCacheSize: number = 100 * 1024 * 1024; // 100MB default
  private currentCacheSize: number = 0;
  private networkCondition: 'fast' | 'medium' | 'slow' = 'medium';
  private supportedFormats: string[] = ['mp3']; // Default

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
    super(OptimizerType.VOICE, eventEmitter, configManager);
    this.originalOptimizer = voiceOptimizer;
    
    // Store original methods for restoration if needed
    this.backupOriginalMethods();
    
    // Set max cache size from config
    this.maxCacheSize = this.getOption('cache-size', 100 * 1024 * 1024);
    
    // Detect supported audio formats
    this.detectSupportedFormats();
    
    // Monitor network conditions
    this.monitorNetworkConditions();
  }

  /**
   * Backup original methods for restoration
   */
  private backupOriginalMethods(): void {
    this.originalMethods = {
      loadVoiceAsset: this.originalOptimizer.loadVoiceAsset.bind(this.originalOptimizer),
      preloadCriticalAssets: this.originalOptimizer.preloadCriticalAssets.bind(this.originalOptimizer),
      clearCache: this.originalOptimizer.clearCache.bind(this.originalOptimizer),
      getCacheSize: this.originalOptimizer.getCacheSize.bind(this.originalOptimizer),
      getLoadingProgress: this.originalOptimizer.getLoadingProgress.bind(this.originalOptimizer)
    };
  }

  /**
   * Initialize the adapter
   */
  protected async initializeImpl(): Promise<void> {
    // Check if optimization is enabled
    if (!featureFlagManager.isEnabled('voice-optimization')) {
      console.log('Voice optimization is disabled');
      return;
    }

    // Override original methods with enhanced versions
    this.overrideOriginalMethods();
    
    console.log('Voice optimizer adapter initialized');
  }

  /**
   * Reset the adapter
   */
  protected resetImpl(): void {
    // Restore original methods
    this.restoreOriginalMethods();
    
    // Clear audio context pool
    this.audioContextPool.clear();
    
    // Clear enhanced cache
    this.enhancedCache.clear();
    this.currentCacheSize = 0;
    
    console.log('Voice optimizer adapter reset');
  }

  /**
   * Detect supported audio formats in the current browser
   */
  private detectSupportedFormats(): void {
    if (typeof window === 'undefined') return;
    
    const audio = document.createElement('audio');
    this.supportedFormats = [];
    
    AUDIO_FORMATS.forEach(format => {
      if (audio.canPlayType(format.mimeType)) {
        this.supportedFormats.push(format.extension);
      }
    });
    
    if (this.supportedFormats.length === 0) {
      // Fallback to mp3 if no formats are detected
      this.supportedFormats = ['mp3'];
    }
    
    console.log('Detected supported audio formats:', this.supportedFormats);
  }

  /**
   * Monitor network conditions to adapt loading strategy
   */
  private monitorNetworkConditions(): void {
    if (typeof window === 'undefined' || !('connection' in navigator)) return;
    
    const connection = (navigator as any).connection;
    
    const updateNetworkCondition = () => {
      if (connection.downlink >= 5) {
        this.networkCondition = 'fast';
      } else if (connection.downlink >= 1.5) {
        this.networkCondition = 'medium';
      } else {
        this.networkCondition = 'slow';
      }
      
      this.recordMetric('network-speed', connection.downlink || 0, 'Mbps');
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
   * Get the best audio format based on browser support and network conditions
   */
  private getBestAudioFormat(): string {
    // Start with the supported formats
    const candidates = AUDIO_FORMATS.filter(format => 
      this.supportedFormats.includes(format.extension)
    );
    
    if (candidates.length === 0) return 'mp3'; // Fallback
    
    // Sort by criteria based on network condition
    if (this.networkCondition === 'fast') {
      // Prefer quality on fast connections
      candidates.sort((a, b) => b.quality - a.quality);
    } else if (this.networkCondition === 'slow') {
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
   * Load audio buffer with streaming support
   */
  private async loadAudioBufferWithStreaming(
    assetId: string, 
    format: string,
    onProgress?: (progress: VoiceLoadProgress) => void
  ): Promise<AudioBuffer> {
    const audioContext = this.audioContextPool.acquire();
    const url = `/assets/voices/${assetId}.${format}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load voice asset: ${assetId}`);
      }
      
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;
      
      // Get response as ReadableStream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to read response stream');
      }
      
      // Create a new stream with progress tracking
      const stream = new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              break;
            }
            
            loaded += value.length;
            controller.enqueue(value);
            
            if (onProgress && total > 0) {
              onProgress({
                loaded,
                total,
                percent: (loaded / total) * 100,
                currentAsset: assetId
              });
            }
          }
        }
      });
      
      // Convert stream to response
      const streamResponse = new Response(stream);
      
      // Get array buffer from response
      const arrayBuffer = await streamResponse.arrayBuffer();
      
      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Record metrics
      this.recordMetric('audio-load-time', performance.now(), 'ms', {
        assetId,
        format,
        size: arrayBuffer.byteLength.toString()
      });
      
      // Release audio context back to pool
      this.audioContextPool.release(audioContext);
      
      return audioBuffer;
    } catch (error) {
      // Release audio context back to pool
      this.audioContextPool.release(audioContext);
      
      // Record error metric
      this.recordMetric('audio-load-error', 1, 'count', {
        assetId,
        format,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  /**
   * Manage cache based on memory limits and usage patterns
   */
  private manageCache(newAssetSize: number): void {
    // If adding the new asset would exceed the cache size limit
    if (this.currentCacheSize + newAssetSize > this.maxCacheSize) {
      // Sort assets by priority (higher number = lower priority)
      // Then by last accessed time (older = lower priority)
      const sortedAssets = Array.from(this.enhancedCache.entries())
        .sort(([, assetA], [, assetB]) => {
          // First compare by priority
          const priorityDiff = assetB.priority - assetA.priority;
          if (priorityDiff !== 0) return priorityDiff;
          
          // Then by last accessed time
          return (assetA.lastAccessed || 0) - (assetB.lastAccessed || 0);
        });
      
      // Remove assets until we have enough space
      let removedSize = 0;
      for (const [id, asset] of sortedAssets) {
        if (this.currentCacheSize + newAssetSize - removedSize <= this.maxCacheSize) {
          break;
        }
        
        // Remove from enhanced cache
        this.enhancedCache.delete(id);
        
        // Remove from original cache
        this.originalOptimizer.clearCache();
        
        // Update removed size
        removedSize += asset.memorySize || 0;
        
        // Emit cache event
        this.emitEvent(OptimizationEventType.CACHE_CLEARED, {
          assetId: id,
          reason: 'memory_limit',
          assetSize: asset.memorySize,
          priority: asset.priority
        });
      }
      
      // Update current cache size
      this.currentCacheSize -= removedSize;
    }
  }

  /**
   * Override original methods with enhanced versions
   */
  private overrideOriginalMethods(): void {
    // Override loadVoiceAsset method
    this.originalOptimizer.loadVoiceAsset = async (assetId: string, onProgress?: (progress: VoiceLoadProgress) => void) => {
      const startTime = performance.now();
      
      try {
        // Emit event
        this.emitEvent(OptimizationEventType.STARTED, {
          method: 'loadVoiceAsset',
          assetId
        });
        
        // Check enhanced cache first
        const cachedAsset = this.enhancedCache.get(assetId);
        if (cachedAsset) {
          // Update access stats
          cachedAsset.lastAccessed = Date.now();
          cachedAsset.accessCount = (cachedAsset.accessCount || 0) + 1;
          
          // Emit cache hit event
          this.emitEvent(OptimizationEventType.CACHE_HIT, {
            assetId,
            accessCount: cachedAsset.accessCount
          });
          
          // Call original method to get the cached buffer
          return this.originalMethods.loadVoiceAsset(assetId);
        }
        
        // Emit cache miss event
        this.emitEvent(OptimizationEventType.CACHE_MISS, {
          assetId
        });
        
        // Determine best format based on browser support and network conditions
        const format = this.getBestAudioFormat();
        
        // Load audio buffer with streaming support
        const buffer = await this.loadAudioBufferWithStreaming(assetId, format, onProgress);
        
        // Calculate memory size (approximate)
        const memorySize = buffer.length * buffer.numberOfChannels * 4; // 4 bytes per sample
        
        // Manage cache before adding new asset
        this.manageCache(memorySize);
        
        // Add to enhanced cache with default priority
        this.enhancedCache.set(assetId, {
          id: assetId,
          name: assetId,
          url: `/assets/voices/${assetId}.${format}`,
          size: memorySize,
          type: 'narrator', // Default
          compression: format as any,
          priority: VoiceAssetPriority.MEDIUM,
          lastAccessed: Date.now(),
          accessCount: 1,
          memorySize
        });
        
        // Update current cache size
        this.currentCacheSize += memorySize;
        
        // Calculate duration
        const duration = performance.now() - startTime;
        
        // Record metrics
        this.recordMetric('voice-load-time', duration, 'ms', {
          assetId,
          format,
          size: memorySize.toString()
        });
        
        // Emit event
        this.emitEvent(OptimizationEventType.COMPLETED, {
          method: 'loadVoiceAsset',
          assetId,
          duration,
          format,
          size: memorySize
        });
        
        return buffer;
      } catch (error) {
        // Calculate duration
        const duration = performance.now() - startTime;
        
        // Record error metric
        this.recordMetric('voice-load-error', 1, 'count', {
          assetId,
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Emit event
        this.emitEvent(OptimizationEventType.FAILED, {
          method: 'loadVoiceAsset',
          assetId,
          duration,
          error: error instanceof Error ? error.message : String(error)
        });
        
        throw error;
      }
    };
    
    // Override preloadCriticalAssets method
    this.originalOptimizer.preloadCriticalAssets = async (assetIds: string[]) => {
      const startTime = performance.now();
      
      try {
        // Emit event
        this.emitEvent(OptimizationEventType.STARTED, {
          method: 'preloadCriticalAssets',
          assetIds
        });
        
        // Set all assets as CRITICAL priority
        const enhancedAssetIds = assetIds.map(id => ({
          id,
          priority: VoiceAssetPriority.CRITICAL
        }));
        
        // Load assets in priority order
        await this.loadAssetsByPriority(enhancedAssetIds);
        
        // Calculate duration
        const duration = performance.now() - startTime;
        
        // Record metrics
        this.recordMetric('voice-preload-time', duration, 'ms', {
          assetCount: assetIds.length.toString()
        });
        
        // Emit event
        this.emitEvent(OptimizationEventType.COMPLETED, {
          method: 'preloadCriticalAssets',
          assetCount: assetIds.length,
          duration
        });
      } catch (error) {
        // Calculate duration
        const duration = performance.now() - startTime;
        
        // Record error metric
        this.recordMetric('voice-preload-error', 1, 'count', {
          assetCount: assetIds.length.toString(),
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Emit event
        this.emitEvent(OptimizationEventType.FAILED, {
          method: 'preloadCriticalAssets',
          assetCount: assetIds.length,
          duration,
          error: error instanceof Error ? error.message : String(error)
        });
        
        throw error;
      }
    };
    
    // Override clearCache method
    this.originalOptimizer.clearCache = () => {
      try {
        // Emit event
        this.emitEvent(OptimizationEventType.CACHE_CLEARED, {
          method: 'clearCache',
          cacheSize: this.currentCacheSize
        });
        
        // Clear enhanced cache
        this.enhancedCache.clear();
        this.currentCacheSize = 0;
        
        // Call original method
        this.originalMethods.clearCache();
        
        // Record metric
        this.recordMetric('voice-cache-cleared', 1, 'count');
      } catch (error) {
        // Record error metric
        this.recordMetric('voice-cache-error', 1, 'count', {
          method: 'clearCache',
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Emit event
        this.emitEvent(OptimizationEventType.FAILED, {
          method: 'clearCache',
          error: error instanceof Error ? error.message : String(error)
        });
        
        throw error;
      }
    };
    
    // Override getCacheSize method
    this.originalOptimizer.getCacheSize = () => {
      try {
        // Call original method
        const originalSize = this.originalMethods.getCacheSize();
        
        // Record metrics
        this.recordMetric('voice-cache-size', this.currentCacheSize, 'bytes');
        
        return originalSize;
      } catch (error) {
        // Record error metric
        this.recordMetric('voice-cache-error', 1, 'count', {
          method: 'getCacheSize',
          error: error instanceof Error ? error.message : String(error)
        });
        
        throw error;
      }
    };
  }

  /**
   * Load assets in priority order
   */
  private async loadAssetsByPriority(assets: { id: string; priority: VoiceAssetPriority }[]): Promise<void> {
    // Sort assets by priority (lower number = higher priority)
    const sortedAssets = [...assets].sort((a, b) => a.priority - b.priority);
    
    // Group assets by priority
    const priorityGroups = new Map<VoiceAssetPriority, string[]>();
    
    for (const asset of sortedAssets) {
      if (!priorityGroups.has(asset.priority)) {
        priorityGroups.set(asset.priority, []);
      }
      priorityGroups.get(asset.priority)!.push(asset.id);
    }
    
    // Load assets by priority group
    for (const [priority, assetIds] of priorityGroups.entries()) {
      // For critical assets, load in sequence to ensure they load first
      if (priority === VoiceAssetPriority.CRITICAL) {
        for (const id of assetIds) {
          await this.originalOptimizer.loadVoiceAsset(id);
        }
      } else {
        // For non-critical assets, load in parallel
        const promises = assetIds.map(id => this.originalOptimizer.loadVoiceAsset(id));
        await Promise.allSettled(promises);
      }
    }
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
  public getOriginalOptimizer(): typeof voiceOptimizer {
    return this.originalOptimizer;
  }

  /**
   * Set the priority for a voice asset
   * 
   * @param assetId The asset ID
   * @param priority The priority level
   */
  public setAssetPriority(assetId: string, priority: VoiceAssetPriority): void {
    const asset = this.enhancedCache.get(assetId);
    
    if (asset) {
      asset.priority = priority;
    }
  }

  /**
   * Get enhanced cache statistics
   * 
   * @returns Cache statistics
   */
  public getEnhancedCacheStats(): {
    size: number;
    maxSize: number;
    assetCount: number;
    formatDistribution: Record<string, number>;
  } {
    const formatDistribution: Record<string, number> = {};
    
    for (const asset of this.enhancedCache.values()) {
      const format = asset.compression;
      formatDistribution[format] = (formatDistribution[format] || 0) + 1;
    }
    
    return {
      size: this.currentCacheSize,
      maxSize: this.maxCacheSize,
      assetCount: this.enhancedCache.size,
      formatDistribution
    };
  }

  /**
   * Preload assets with specified priorities
   * 
   * @param assets Assets with priorities
   */
  public async preloadAssets(assets: { id: string; priority: VoiceAssetPriority }[]): Promise<void> {
    return this.loadAssetsByPriority(assets);
  }
}

// Export singleton instance
export const voiceOptimizerAdapter = new VoiceOptimizerAdapter();