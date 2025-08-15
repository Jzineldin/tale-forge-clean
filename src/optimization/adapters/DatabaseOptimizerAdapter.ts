/**
 * Tale Forge Unified Optimization Framework - Database Optimizer Adapter
 * 
 * This file implements a backward compatibility adapter for the database optimizer.
 */

// Create a fallback database optimizer if the real one doesn't exist
const fallbackDatabaseOptimizer = {
  getStories: async (_options: any = {}) => [],
  getStorySegments: async (_storyId: string) => [],
  getUserStories: async (_userId: string, _options: any = {}) => [],
  getStoriesWithSegments: async (_storyIds: string[]) => [],
  clearCache: () => {},
  getCacheStats: () => ({ size: 0, entries: 0, timeout: 0 })
};

let databaseOptimizer: any = fallbackDatabaseOptimizer;

// Dynamically import the database optimizer
import('@/lib/database-optimizer')
  .then(module => {
    databaseOptimizer = module.databaseOptimizer;
  })
  .catch(() => {
    console.warn('Database optimizer not found, using fallback implementation');
  });
import { BaseOptimizer } from '../core/BaseOptimizer';
import { OptimizerType, OptimizationEventType, QueryOptimizationOptions } from '../core/types';
import { EventEmitter } from '../utils/EventEmitter';
import { ConfigManager } from '../config/ConfigManager';
import { featureFlagManager } from '../utils/FeatureFlagManager';

/**
 * Cache tier levels for different types of data
 */
export enum CacheTier {
  VOLATILE = 'volatile',     // Very short-lived data (30s)
  STANDARD = 'standard',     // Normal data (5 min)
  STABLE = 'stable',         // Rarely changing data (30 min)
  STATIC = 'static'          // Almost never changing data (1 hour)
}

/**
 * Cache entry with metadata
 */
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
  tier: CacheTier;
  queryHash: string;
  accessCount: number;
  lastAccessed: number;
  size: number;
  volatilityScore: number;
}

/**
 * Query analytics data
 */
interface QueryAnalytics {
  queryHash: string;
  query: string;
  executionCount: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  cacheHitCount: number;
  cacheMissCount: number;
  cacheHitRate: number;
  lastExecuted: number;
  resultSize: number;
  volatilityScore: number;
}

/**
 * Adapter for the legacy database optimizer
 * Provides backward compatibility with the existing database optimizer
 */
export class DatabaseOptimizerAdapter extends BaseOptimizer {
  private originalOptimizer: typeof databaseOptimizer;
  private originalMethods: Record<string, (...args: any[]) => any> = {};
  private enhancedCache: Map<string, CacheEntry> = new Map();
  private queryAnalytics: Map<string, QueryAnalytics> = new Map();
  private realTimeInvalidationEnabled: boolean = true;
  private adaptiveCacheTimeoutsEnabled: boolean = true;
  private tieredCachingEnabled: boolean = true;
  private analyticsEnabled: boolean = true;
  private cacheTierTimeouts: Record<CacheTier, number> = {
    [CacheTier.VOLATILE]: 30 * 1000, // 30 seconds
    [CacheTier.STANDARD]: 5 * 60 * 1000, // 5 minutes
    [CacheTier.STABLE]: 30 * 60 * 1000, // 30 minutes
    [CacheTier.STATIC]: 60 * 60 * 1000 // 1 hour
  };
  private volatilityThresholds: Record<string, number> = {
    low: 0.2,
    medium: 0.5,
    high: 0.8
  };
  private realTimeListeners: Set<() => void> = new Set();
  private maxCacheSize: number = 100 * 1024 * 1024; // 100MB
  private currentCacheSize: number = 0;

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
    super(OptimizerType.DATABASE, eventEmitter, configManager);
    this.originalOptimizer = databaseOptimizer;
    
    // Store original methods for restoration if needed
    this.backupOriginalMethods();

    // Load configuration
    this.loadConfiguration();
  }

  /**
   * Load configuration from config manager
   */
  private loadConfiguration(): void {
    // Load feature flags
    this.realTimeInvalidationEnabled = this.isFeatureEnabled('real-time-invalidation');
    this.adaptiveCacheTimeoutsEnabled = this.isFeatureEnabled('adaptive-cache-timeouts');
    this.tieredCachingEnabled = this.isFeatureEnabled('tiered-caching');
    this.analyticsEnabled = this.isFeatureEnabled('query-analytics');

    // Load cache tier timeouts
    this.cacheTierTimeouts = {
      [CacheTier.VOLATILE]: this.getOption('volatile-cache-ttl', 30 * 1000),
      [CacheTier.STANDARD]: this.getOption('standard-cache-ttl', 5 * 60 * 1000),
      [CacheTier.STABLE]: this.getOption('stable-cache-ttl', 30 * 60 * 1000),
      [CacheTier.STATIC]: this.getOption('static-cache-ttl', 60 * 60 * 1000)
    };

    // Load volatility thresholds
    this.volatilityThresholds = {
      low: this.getOption('volatility-threshold-low', 0.2),
      medium: this.getOption('volatility-threshold-medium', 0.5),
      high: this.getOption('volatility-threshold-high', 0.8)
    };

    // Load max cache size
    this.maxCacheSize = this.getOption('max-cache-size', 100 * 1024 * 1024);
  }

  /**
   * Backup original methods for restoration
   */
  private backupOriginalMethods(): void {
    this.originalMethods = {
      getStories: this.originalOptimizer.getStories.bind(this.originalOptimizer),
      getStorySegments: this.originalOptimizer.getStorySegments.bind(this.originalOptimizer),
      getUserStories: this.originalOptimizer.getUserStories.bind(this.originalOptimizer),
      getStoriesWithSegments: this.originalOptimizer.getStoriesWithSegments.bind(this.originalOptimizer),
      clearCache: this.originalOptimizer.clearCache.bind(this.originalOptimizer),
      getCacheStats: this.originalOptimizer.getCacheStats.bind(this.originalOptimizer)
    };
  }

  /**
   * Initialize the adapter
   */
  protected async initializeImpl(): Promise<void> {
    // Check if optimization is enabled
    if (!featureFlagManager.isEnabled('database-optimization')) {
      console.log('Database optimization is disabled');
      return;
    }

    // Override original methods with enhanced versions
    this.overrideOriginalMethods();
    
    // Setup real-time invalidation if enabled
    if (this.realTimeInvalidationEnabled) {
      this.setupRealTimeInvalidation();
    }
    
    console.log('Database optimizer adapter initialized');
  }

  /**
   * Reset the adapter
   */
  protected resetImpl(): void {
    // Restore original methods
    this.restoreOriginalMethods();
    
    // Clear enhanced cache
    this.enhancedCache.clear();
    this.currentCacheSize = 0;
    
    // Clear query analytics
    this.queryAnalytics.clear();
    
    // Clear real-time listeners
    this.realTimeListeners.clear();
    
    console.log('Database optimizer adapter reset');
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
   * Generate a hash for a query
   * 
   * @param method The query method
   * @param params The query parameters
   * @returns A hash string
   */
  private generateQueryHash(method: string, params: any): string {
    return `${method}:${JSON.stringify(params)}`;
  }

  /**
   * Determine cache tier based on query and volatility
   * 
   * @param method The query method
   * @param params The query parameters
   * @returns The cache tier
   */
  private determineCacheTier(method: string, params: any): CacheTier {
    if (!this.tieredCachingEnabled) {
      return CacheTier.STANDARD;
    }
    
    const queryHash = this.generateQueryHash(method, params);
    const analytics = this.queryAnalytics.get(queryHash);
    
    // If we have analytics, use volatility score
    if (analytics) {
      if (analytics.volatilityScore >= this.volatilityThresholds.high) {
        return CacheTier.VOLATILE;
      } else if (analytics.volatilityScore >= this.volatilityThresholds.medium) {
        return CacheTier.STANDARD;
      } else if (analytics.volatilityScore >= this.volatilityThresholds.low) {
        return CacheTier.STABLE;
      } else {
        return CacheTier.STATIC;
      }
    }
    
    // Default tiers based on method
    switch (method) {
      case 'getStories':
        return CacheTier.STANDARD;
      case 'getStorySegments':
        return CacheTier.STABLE;
      case 'getUserStories':
        return CacheTier.STANDARD;
      case 'getStoriesWithSegments':
        return CacheTier.STANDARD;
      default:
        return CacheTier.STANDARD;
    }
  }

  /**
   * Calculate cache timeout based on tier and volatility
   * 
   * @param tier The cache tier
   * @param volatilityScore The volatility score
   * @returns The cache timeout in milliseconds
   */
  private calculateCacheTimeout(tier: CacheTier, volatilityScore: number): number {
    if (!this.adaptiveCacheTimeoutsEnabled) {
      return this.cacheTierTimeouts[tier];
    }
    
    // Base timeout from tier
    let timeout = this.cacheTierTimeouts[tier];
    
    // Adjust based on volatility
    if (volatilityScore > 0) {
      // More volatile data gets shorter timeouts
      const volatilityFactor = 1 - Math.min(volatilityScore, 0.9);
      timeout = Math.max(1000, Math.floor(timeout * volatilityFactor));
    }
    
    return timeout;
  }

  /**
   * Update query analytics
   * 
   * @param queryHash The query hash
   * @param query The query string
   * @param executionTime The execution time
   * @param resultSize The result size
   * @param cacheHit Whether the query was a cache hit
   */
  private updateQueryAnalytics(
    queryHash: string,
    query: string,
    executionTime: number,
    resultSize: number,
    cacheHit: boolean
  ): void {
    if (!this.analyticsEnabled) {
      return;
    }
    
    let analytics = this.queryAnalytics.get(queryHash);
    
    if (!analytics) {
      analytics = {
        queryHash,
        query,
        executionCount: 0,
        totalExecutionTime: 0,
        averageExecutionTime: 0,
        cacheHitCount: 0,
        cacheMissCount: 0,
        cacheHitRate: 0,
        lastExecuted: Date.now(),
        resultSize,
        volatilityScore: 0.5 // Start with medium volatility
      };
    }
    
    // Update analytics
    analytics.executionCount++;
    analytics.totalExecutionTime += executionTime;
    analytics.averageExecutionTime = analytics.totalExecutionTime / analytics.executionCount;
    
    if (cacheHit) {
      analytics.cacheHitCount++;
    } else {
      analytics.cacheMissCount++;
    }
    
    analytics.cacheHitRate = analytics.cacheHitCount / analytics.executionCount;
    analytics.lastExecuted = Date.now();
    analytics.resultSize = resultSize;
    
    // Store updated analytics
    this.queryAnalytics.set(queryHash, analytics);
    
    // Record metrics
    this.recordMetric('query-execution-time', executionTime, 'ms', {
      queryHash,
      cacheHit: cacheHit.toString()
    });
    
    this.recordMetric('query-cache-hit-rate', analytics.cacheHitRate * 100, '%', {
      queryHash
    });
  }

  /**
   * Update volatility score based on data changes
   * 
   * @param queryHash The query hash
   * @param newData The new data
   * @param oldData The old data
   */
  private updateVolatilityScore(queryHash: string, newData: any, oldData: any): void {
    if (!this.analyticsEnabled) {
      return;
    }
    
    const analytics = this.queryAnalytics.get(queryHash);
    
    if (!analytics) {
      return;
    }
    
    // Calculate change ratio
    let changeRatio = 0;
    
    if (Array.isArray(newData) && Array.isArray(oldData)) {
      // For arrays, compare lengths and sample some items
      const lengthDiff = Math.abs(newData.length - oldData.length);
      const maxLength = Math.max(newData.length, oldData.length);
      
      if (maxLength > 0) {
        changeRatio = lengthDiff / maxLength;
        
        // Sample some items for deeper comparison
        const sampleSize = Math.min(5, Math.min(newData.length, oldData.length));
        
        for (let i = 0; i < sampleSize; i++) {
          const index = Math.floor(Math.random() * Math.min(newData.length, oldData.length));
          
          if (JSON.stringify(newData[index]) !== JSON.stringify(oldData[index])) {
            changeRatio += 0.1; // Add 10% for each different item
          }
        }
        
        // Cap at 1.0
        changeRatio = Math.min(1.0, changeRatio);
      }
    } else {
      // For non-arrays, use a simple string comparison
      const newStr = JSON.stringify(newData);
      const oldStr = JSON.stringify(oldData);
      
      if (newStr !== oldStr) {
        // Calculate Levenshtein distance (simplified)
        const maxLength = Math.max(newStr.length, oldStr.length);
        let diff = 0;
        
        for (let i = 0; i < Math.min(newStr.length, oldStr.length); i++) {
          if (newStr[i] !== oldStr[i]) {
            diff++;
          }
        }
        
        diff += Math.abs(newStr.length - oldStr.length);
        changeRatio = diff / maxLength;
      }
    }
    
    // Update volatility score with exponential moving average
    const alpha = 0.3; // Weight for new observation
    analytics.volatilityScore = (alpha * changeRatio) + ((1 - alpha) * analytics.volatilityScore);
    
    // Store updated analytics
    this.queryAnalytics.set(queryHash, analytics);
    
    // Record metric
    this.recordMetric('data-volatility', analytics.volatilityScore * 100, '%', {
      queryHash
    });
  }

  /**
   * Setup real-time invalidation
   */
  private setupRealTimeInvalidation(): void {
    try {
      // Import from supabase client
      import('@/integrations/supabase/client').then(({ supabase }) => {
        // Note: Realtime subscriptions have changed in newer Supabase versions
        // The .on() method is deprecated. Using channel-based subscriptions instead
        
        supabase.channel('db-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'stories' },
            (payload: any) => {
              console.log('Realtime update for stories:', payload);
              
              // Invalidate related caches
              this.invalidateRelatedCaches('stories', payload.new?.id);
              
              // Notify listeners
              this.notifyRealTimeListeners();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'story_segments' },
            (payload: any) => {
              console.log('Realtime update for story_segments:', payload);
              
              // Invalidate related caches
              this.invalidateRelatedCaches('story_segments', payload.new?.story_id);
              
              // Notify listeners
              this.notifyRealTimeListeners();
            }
          )
          .subscribe();
        
        console.log('Real-time invalidation setup complete');
      }).catch(error => {
        console.error('Failed to import supabase client:', error);
      });
    } catch (error) {
      console.error('Failed to setup real-time invalidation:', error);
    }
  }

  /**
   * Invalidate related caches
   * 
   * @param table The table that changed
   * @param id The ID of the changed record
   */
  private invalidateRelatedCaches(table: string, id?: string): void {
    if (!this.realTimeInvalidationEnabled) {
      return;
    }
    
    // Track invalidated entries
    const invalidatedEntries: string[] = [];
    
    // Iterate through cache entries
    for (const [key, entry] of this.enhancedCache.entries()) {
      let shouldInvalidate = false;
      
      if (table === 'stories') {
        // Invalidate any cache entry related to stories
        if (key.includes('getStories') || key.includes('getUserStories') || key.includes('getStoriesWithSegments')) {
          shouldInvalidate = true;
        }
        
        // If we have an ID, only invalidate entries for that story
        if (id && !key.includes(id)) {
          shouldInvalidate = false;
        }
      } else if (table === 'story_segments') {
        // Invalidate any cache entry related to story segments
        if (key.includes('getStorySegments') || key.includes('getStoriesWithSegments')) {
          shouldInvalidate = true;
        }
        
        // If we have a story ID, only invalidate entries for that story
        if (id && !key.includes(id)) {
          shouldInvalidate = false;
        }
      }
      
      if (shouldInvalidate) {
        // Update cache size
        this.currentCacheSize -= entry.size;
        
        // Remove from cache
        this.enhancedCache.delete(key);
        
        // Add to invalidated entries
        invalidatedEntries.push(key);
      }
    }
    
    // Emit cache cleared event
    if (invalidatedEntries.length > 0) {
      this.emitEvent(OptimizationEventType.CACHE_CLEARED, {
        method: 'realTimeInvalidation',
        table,
        id,
        invalidatedEntries
      });
    }
  }

  /**
   * Notify real-time listeners
   */
  private notifyRealTimeListeners(): void {
    for (const listener of this.realTimeListeners) {
      try {
        listener();
      } catch (error) {
        console.error('Error in real-time listener:', error);
      }
    }
  }

  /**
   * Add a real-time listener
   * 
   * @param listener The listener function
   * @returns A function to remove the listener
   */
  public addRealTimeListener(listener: () => void): () => void {
    this.realTimeListeners.add(listener);
    
    return () => {
      this.realTimeListeners.delete(listener);
    };
  }

  /**
   * Manage cache based on memory limits
   * 
   * @param newEntrySize The size of the new entry
   */
  private manageCache(newEntrySize: number): void {
    // If adding the new entry would exceed the cache size limit
    if (this.currentCacheSize + newEntrySize > this.maxCacheSize) {
      // Sort entries by tier (higher tier = lower priority)
      // Then by last accessed time (older = lower priority)
      const sortedEntries = Array.from(this.enhancedCache.entries())
        .sort(([, entryA], [, entryB]) => {
          // First compare by tier
          const tierA = Object.values(CacheTier).indexOf(entryA.tier);
          const tierB = Object.values(CacheTier).indexOf(entryB.tier);
          const tierDiff = tierA - tierB;
          
          if (tierDiff !== 0) return tierDiff;
          
          // Then by last accessed time
          return entryA.lastAccessed - entryB.lastAccessed;
        });
      
      // Remove entries until we have enough space
      let removedSize = 0;
      const removedEntries: string[] = [];
      
      for (const [key, entry] of sortedEntries) {
        if (this.currentCacheSize + newEntrySize - removedSize <= this.maxCacheSize) {
          break;
        }
        
        // Remove from enhanced cache
        this.enhancedCache.delete(key);
        
        // Update removed size
        removedSize += entry.size;
        
        // Add to removed entries
        removedEntries.push(key);
      }
      
      // Update current cache size
      this.currentCacheSize -= removedSize;
      
      // Emit cache cleared event
      if (removedEntries.length > 0) {
        this.emitEvent(OptimizationEventType.CACHE_CLEARED, {
          method: 'manageCache',
          reason: 'memory_limit',
          removedSize,
          removedEntries
        });
      }
    }
  }

  /**
   * Process a database query with caching and analytics
   * 
   * @param method The method name
   * @param args The method arguments
   * @param originalMethod The original method
   * @returns The query result
   */
  private async processQuery(
    method: string,
    args: any[],
    originalMethod: (...args: any[]) => any
  ): Promise<any> {
    const startTime = performance.now();
    const queryHash = this.generateQueryHash(method, args);
    
    try {
      // Emit event
      this.emitEvent(OptimizationEventType.STARTED, {
        method,
        args,
        queryHash
      });
      
      // Check enhanced cache
      const cachedEntry = this.enhancedCache.get(queryHash);
      let result;
      let cacheHit = false;
      
      if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
        // Cache hit
        result = cachedEntry.data;
        cacheHit = true;
        
        // Update access stats
        cachedEntry.accessCount++;
        cachedEntry.lastAccessed = Date.now();
        
        // Emit cache hit event
        this.emitEvent(OptimizationEventType.CACHE_HIT, {
          method,
          queryHash,
          tier: cachedEntry.tier,
          accessCount: cachedEntry.accessCount
        });
      } else {
        // Cache miss or expired
        if (cachedEntry) {
          // Emit cache miss event
          this.emitEvent(OptimizationEventType.CACHE_MISS, {
            method,
            queryHash,
            reason: 'expired',
            tier: cachedEntry.tier
          });
          
          // Store old data for volatility calculation
          const oldData = cachedEntry.data;
          
          // Call original method
          result = await originalMethod(...args);
          
          // Update volatility score
          this.updateVolatilityScore(queryHash, result, oldData);
        } else {
          // Emit cache miss event
          this.emitEvent(OptimizationEventType.CACHE_MISS, {
            method,
            queryHash,
            reason: 'not_found'
          });
          
          // Call original method
          result = await originalMethod(...args);
        }
        
        // Determine cache tier
        const tier = this.determineCacheTier(method, args);
        
        // Get volatility score
        const analytics = this.queryAnalytics.get(queryHash);
        const volatilityScore = analytics?.volatilityScore || 0.5;
        
        // Calculate cache timeout
        const timeout = this.calculateCacheTimeout(tier, volatilityScore);
        
        // Calculate entry size (approximate)
        const resultStr = JSON.stringify(result);
        const size = resultStr.length * 2; // Approximate size in bytes
        
        // Manage cache before adding new entry
        this.manageCache(size);
        
        // Add to enhanced cache
        this.enhancedCache.set(queryHash, {
          data: result,
          timestamp: Date.now(),
          expiresAt: Date.now() + timeout,
          tier,
          queryHash,
          accessCount: 1,
          lastAccessed: Date.now(),
          size,
          volatilityScore
        });
        
        // Update current cache size
        this.currentCacheSize += size;
        
        // Emit cache updated event
        this.emitEvent(OptimizationEventType.CACHE_UPDATED, {
          method,
          queryHash,
          tier,
          timeout,
          size
        });
      }
      
      // Calculate duration
      const duration = performance.now() - startTime;
      
      // Update query analytics
      this.updateQueryAnalytics(
        queryHash,
        `${method}(${JSON.stringify(args)})`,
        duration,
        result?.length || 0,
        cacheHit
      );
      
      // Record metrics
      this.recordMetric('database-query-time', duration, 'ms', {
        method,
        resultCount: result?.length?.toString() || '0',
        cacheHit: cacheHit.toString()
      });
      
      // Emit event
      this.emitEvent(OptimizationEventType.COMPLETED, {
        method,
        duration,
        resultCount: result?.length || 0,
        cacheHit
      });
      
      return result;
    } catch (error) {
      // Calculate duration
      const duration = performance.now() - startTime;
      
      // Record error metric
      this.recordMetric('database-query-error', 1, 'count', {
        method,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Emit event
      this.emitEvent(OptimizationEventType.FAILED, {
        method,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  /**
   * Override original methods with enhanced versions
   */
  private overrideOriginalMethods(): void {
    // Override getStories method
    this.originalOptimizer.getStories = async (options: QueryOptimizationOptions = {}) => {
      return this.processQuery('getStories', [options], this.originalMethods.getStories);
    };
    
    // Override getStorySegments method
    this.originalOptimizer.getStorySegments = async (storyId: string) => {
      return this.processQuery('getStorySegments', [storyId], this.originalMethods.getStorySegments);
    };
    
    // Override getUserStories method
    this.originalOptimizer.getUserStories = async (userId: string, options: QueryOptimizationOptions = {}) => {
      return this.processQuery('getUserStories', [userId, options], this.originalMethods.getUserStories);
    };
    
    // Override getStoriesWithSegments method
    this.originalOptimizer.getStoriesWithSegments = async (storyIds: string[]) => {
      return this.processQuery('getStoriesWithSegments', [storyIds], this.originalMethods.getStoriesWithSegments);
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
        this.recordMetric('database-cache-cleared', 1, 'count');
      } catch (error) {
        // Record error metric
        this.recordMetric('database-cache-error', 1, 'count', {
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
    
    // Override getCacheStats method
    this.originalOptimizer.getCacheStats = () => {
      try {
        // Call original method
        const originalStats = this.originalMethods.getCacheStats();
        
        // Add enhanced stats
        const enhancedStats = {
          ...originalStats,
          enhancedSize: this.currentCacheSize,
          maxSize: this.maxCacheSize,
          entryCount: this.enhancedCache.size,
          tiers: {
            volatile: Array.from(this.enhancedCache.values()).filter(entry => entry.tier === CacheTier.VOLATILE).length,
            standard: Array.from(this.enhancedCache.values()).filter(entry => entry.tier === CacheTier.STANDARD).length,
            stable: Array.from(this.enhancedCache.values()).filter(entry => entry.tier === CacheTier.STABLE).length,
            static: Array.from(this.enhancedCache.values()).filter(entry => entry.tier === CacheTier.STATIC).length
          }
        };
        
        // Record metrics
        this.recordMetric('database-cache-size', this.currentCacheSize, 'bytes');
        
        return enhancedStats;
      } catch (error) {
        // Record error metric
        this.recordMetric('database-cache-error', 1, 'count', {
          method: 'getCacheStats',
          error: error instanceof Error ? error.message : String(error)
        });
        
        throw error;
      }
    };
  }

  /**
   * Get the original optimizer instance
   * 
   * @returns The original optimizer instance
   */
  public getOriginalOptimizer(): typeof databaseOptimizer {
    return this.originalOptimizer;
  }

  /**
   * Get query analytics
   * 
   * @returns Query analytics
   */
  public getQueryAnalytics(): QueryAnalytics[] {
    return Array.from(this.queryAnalytics.values());
  }

  /**
   * Get enhanced cache statistics
   *
   * @returns Enhanced cache statistics
   */
  public getEnhancedCacheStats(): {
    size: number;
    maxSize: number;
    entryCount: number;
    tiers: Record<string, number>;
  } {
    return {
      size: this.currentCacheSize,
      maxSize: this.maxCacheSize,
      entryCount: this.enhancedCache.size,
      tiers: {
        volatile: Array.from(this.enhancedCache.values()).filter(entry => entry.tier === CacheTier.VOLATILE).length,
        standard: Array.from(this.enhancedCache.values()).filter(entry => entry.tier === CacheTier.STANDARD).length,
        stable: Array.from(this.enhancedCache.values()).filter(entry => entry.tier === CacheTier.STABLE).length,
        static: Array.from(this.enhancedCache.values()).filter(entry => entry.tier === CacheTier.STATIC).length
      }
    };
  }
}

// Export singleton instance
export const databaseOptimizerAdapter = new DatabaseOptimizerAdapter();