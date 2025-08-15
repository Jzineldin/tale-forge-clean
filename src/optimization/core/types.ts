/**
 * Tale Forge Unified Optimization Framework - Core Types
 * 
 * This file defines the core types and interfaces for the optimization framework.
 */

/**
 * Optimization component types
 */
export enum OptimizerType {
  VOICE = 'voice',
  IMAGE = 'image',
  DATABASE = 'database',
  PERFORMANCE = 'performance',
  SUPABASE = 'supabase'
}

/**
 * Optimization event types
 */
export enum OptimizationEventType {
  // Lifecycle events
  INITIALIZED = 'initialized',
  STARTED = 'started',
  COMPLETED = 'completed',
  FAILED = 'failed',
  
  // Performance events
  METRIC_RECORDED = 'metric_recorded',
  THRESHOLD_EXCEEDED = 'threshold_exceeded',
  
  // Cache events
  CACHE_HIT = 'cache_hit',
  CACHE_MISS = 'cache_miss',
  CACHE_UPDATED = 'cache_updated',
  CACHE_CLEARED = 'cache_cleared',
  
  // Connection events
  CONNECTION_ESTABLISHED = 'connection_established',
  CONNECTION_LOST = 'connection_lost',
  CONNECTION_DEGRADED = 'connection_degraded',
  CONNECTION_RESTORED = 'connection_restored',
  
  // Feature flag events
  FEATURE_ENABLED = 'feature_enabled',
  FEATURE_DISABLED = 'feature_disabled',

  // Resource orchestration events
  RESOURCE_PRIORITIZED = 'resource_prioritized',
  RESOURCE_DEPRIORITIZED = 'resource_deprioritized',
  RESOURCE_DEPENDENCY_ADDED = 'resource_dependency_added',
  RESOURCE_DEPENDENCY_REMOVED = 'resource_dependency_removed',
  RESOURCE_LOAD_BALANCED = 'resource_load_balanced',
  
  // Context events
  CONTEXT_UPDATED = 'context_updated',
  CONTEXT_STRATEGY_CHANGED = 'context_strategy_changed',
  
  // Coordination events
  OPTIMIZERS_COORDINATED = 'optimizers_coordinated',
  CONFLICT_RESOLVED = 'conflict_resolved',
  PIPELINE_EXECUTED = 'pipeline_executed'
}

/**
 * Optimization event data
 */
export interface OptimizationEvent {
  type: OptimizationEventType;
  optimizerType: OptimizerType;
  timestamp: number;
  data?: any;
}

/**
 * Optimization event listener
 */
export type OptimizationEventListener = (event: OptimizationEvent) => void;

/**
 * Performance metric data
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string> | undefined;
}

/**
 * Base optimizer interface
 */
export interface IOptimizer {
  /**
   * Get the type of optimizer
   */
  getType(): OptimizerType;
  
  /**
   * Initialize the optimizer
   */
  initialize(): Promise<void>;
  
  /**
   * Get the current metrics for this optimizer
   */
  getMetrics(): PerformanceMetric[];
  
  /**
   * Reset the optimizer state
   */
  reset(): void;
}

/**
 * Optimization configuration
 */
export interface OptimizationConfig {
  enabled: boolean;
  features: Record<string, boolean>;
  thresholds: Record<string, number>;
  options: Record<string, any>;
}

/**
 * Connection health status
 */
export enum ConnectionHealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  DISCONNECTED = 'disconnected'
}

/**
 * Query optimization options
 */
export interface QueryOptimizationOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: { column: string; ascending: boolean };
  filters?: Record<string, any>;
}

/**
 * Connection health metrics
 */
export interface ConnectionHealthMetrics {
  status: ConnectionHealthStatus;
  latency: number;
  errorRate: number;
  successRate: number;
  lastChecked: number;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
}

/**
 * Feature flag definition
 */
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number;
  description: string;
  dependencies?: string[];
}

/**
 * Resource priority levels
 */
export enum ResourcePriority {
  CRITICAL = 0,
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3
}

/**
 * Resource dependency type
 */
export enum ResourceDependencyType {
  REQUIRED = 'required',     // Resource is required for operation
  OPTIONAL = 'optional',     // Resource is optional but enhances operation
  SEQUENTIAL = 'sequential', // Resource must be loaded in sequence
  PARALLEL = 'parallel'      // Resource can be loaded in parallel
}

/**
 * Resource dependency definition
 */
export interface ResourceDependency {
  resourceType: OptimizerType;
  resourceId: string;
  dependencyType: ResourceDependencyType;
  description?: string;
}

/**
 * Resource definition
 */
export interface Resource {
  id: string;
  type: OptimizerType;
  priority: ResourcePriority;
  dependencies: ResourceDependency[];
  metadata?: Record<string, any>;
}

/**
 * Device capability information
 */
export interface DeviceCapabilities {
  cpu: {
    cores: number;
    architecture?: string;
  };
  memory: {
    total: number;
    available: number;
  };
  gpu?: {
    vendor?: string;
    model?: string;
    memory?: number;
  };
  browser: {
    name: string;
    version: string;
    supportedImageFormats: string[];
    supportedAudioFormats: string[];
    supportedVideoFormats: string[];
  };
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
    colorDepth: number;
  };
  connection?: {
    type?: string;
    downlink?: number;
    rtt?: number;
    effectiveType?: string;
  };
  features: {
    webgl: boolean;
    webgl2: boolean;
    webp: boolean;
    avif: boolean;
    webm: boolean;
    webWorker: boolean;
    serviceWorker: boolean;
    indexedDB: boolean;
    localStorage: boolean;
    sessionStorage: boolean;
  };
}

/**
 * Network condition information
 */
export interface NetworkCondition {
  type?: string;
  downlink: number;
  rtt: number;
  effectiveType: 'slow' | 'medium' | 'fast';
  bandwidth: number;
  latency: number;
  packetLoss: number;
  lastUpdated: number;
}

/**
 * User behavior metrics
 */
export interface UserBehavior {
  sessionDuration: number;
  pageViews: number;
  interactions: number;
  scrollDepth: number;
  idleTime: number;
  focusTime: number;
  lastActivity: number;
  preferredContentTypes: string[];
  deviceUsage: {
    cpu: number;
    memory: number;
    battery?: number;
  };
}

/**
 * Application state information
 */
export interface ApplicationState {
  route: string;
  activeComponents: string[];
  loadedResources: {
    images: number;
    audio: number;
    video: number;
    data: number;
  };
  pendingOperations: number;
  errors: {
    count: number;
    lastError?: string;
    lastErrorTime?: number;
  };
  performance: {
    fps: number;
    memoryUsage: number;
    cpuUsage: number;
    loadTime: number;
    interactiveTime: number;
  };
}

/**
 * Optimization context
 */
export interface OptimizationContext {
  device: DeviceCapabilities;
  network: NetworkCondition;
  user: UserBehavior;
  application: ApplicationState;
  timestamp: number;
}

/**
 * Optimization strategy
 */
export enum OptimizationStrategy {
  PERFORMANCE_FIRST = 'performance_first',
  QUALITY_FIRST = 'quality_first',
  BALANCED = 'balanced',
  MEMORY_EFFICIENT = 'memory_efficient',
  BATTERY_EFFICIENT = 'battery_efficient',
  NETWORK_EFFICIENT = 'network_efficient',
  OFFLINE_FIRST = 'offline_first'
}

/**
 * Cache entry metadata
 */
export interface CacheEntryMetadata {
  resourceId: string;
  resourceType: OptimizerType;
  size: number;
  priority: ResourcePriority;
  lastAccessed: number;
  accessCount: number;
  createdAt: number;
  expiresAt?: number;
  volatility: number;
  dependencies: string[];
}

/**
 * Optimization pipeline step
 */
export interface PipelineStep {
  id: string;
  optimizerType: OptimizerType;
  operation: string;
  parameters: Record<string, any>;
  dependsOn: string[];
  timeout?: number;
  retryCount?: number;
  fallback?: string;
}

/**
 * Optimization pipeline
 */
export interface OptimizationPipeline {
  id: string;
  name: string;
  description?: string;
  steps: PipelineStep[];
  parallelExecution: boolean;
  abortOnFailure: boolean;
  timeout?: number;
}

/**
 * Resource conflict
 */
export interface ResourceConflict {
  resourceId: string;
  resourceType: OptimizerType;
  conflictingResourceId: string;
  conflictingResourceType: OptimizerType;
  conflictType: 'priority' | 'memory' | 'cpu' | 'network';
  severity: 'low' | 'medium' | 'high';
  resolution?: 'prioritize_first' | 'prioritize_second' | 'delay_first' | 'delay_second' | 'reduce_quality';
}