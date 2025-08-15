/**
 * Tale Forge Unified Optimization Framework - Base Optimizer
 * 
 * This file implements the base optimizer class that all specific optimizers will extend.
 */

import { 
  IOptimizer, 
  OptimizerType, 
  OptimizationEvent, 
  OptimizationEventType,
  PerformanceMetric,
  OptimizationConfig
} from './types';
import { EventEmitter } from '../utils/EventEmitter';
import { ConfigManager } from '../config/ConfigManager';

/**
 * Abstract base class for all optimizers
 */
export abstract class BaseOptimizer implements IOptimizer {
  protected type: OptimizerType;
  protected metrics: PerformanceMetric[] = [];
  protected initialized: boolean = false;
  protected config: OptimizationConfig;
  protected eventEmitter: EventEmitter;
  protected configManager: ConfigManager;

  /**
   * Constructor
   * 
   * @param type The optimizer type
   * @param eventEmitter The event emitter instance
   * @param configManager The configuration manager instance
   */
  constructor(
    type: OptimizerType,
    eventEmitter: EventEmitter,
    configManager: ConfigManager
  ) {
    this.type = type;
    this.eventEmitter = eventEmitter;
    this.configManager = configManager;
    this.config = this.configManager.getOptimizerConfig(type);
  }

  /**
   * Get the optimizer type
   */
  getType(): OptimizerType {
    return this.type;
  }

  /**
   * Initialize the optimizer
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Emit initialization started event
      this.emitEvent(OptimizationEventType.STARTED, { message: 'Initializing optimizer' });
      
      // Perform optimizer-specific initialization
      await this.initializeImpl();
      
      this.initialized = true;
      
      // Emit initialization completed event
      this.emitEvent(OptimizationEventType.INITIALIZED, { message: 'Optimizer initialized successfully' });
    } catch (error) {
      // Emit initialization failed event
      this.emitEvent(OptimizationEventType.FAILED, { 
        message: 'Optimizer initialization failed',
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  /**
   * Get the current metrics for this optimizer
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Reset the optimizer state
   */
  reset(): void {
    this.metrics = [];
    this.initialized = false;
    this.resetImpl();
  }

  /**
   * Record a performance metric
   * 
   * @param name The metric name
   * @param value The metric value
   * @param unit The metric unit
   * @param tags Optional tags for the metric
   */
  protected recordMetric(name: string, value: number, unit: string, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags
    };
    
    this.metrics.push(metric);
    
    // Emit metric recorded event
    this.emitEvent(OptimizationEventType.METRIC_RECORDED, { metric });
    
    // Check if the metric exceeds any threshold
    this.checkThresholds(metric);
  }

  /**
   * Check if a metric exceeds any threshold
   * 
   * @param metric The metric to check
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const thresholdKey = `${metric.name}.threshold`;
    const threshold = this.config.thresholds[thresholdKey];
    
    if (threshold !== undefined && metric.value > threshold) {
      this.emitEvent(OptimizationEventType.THRESHOLD_EXCEEDED, {
        metric,
        threshold,
        message: `Metric ${metric.name} exceeded threshold: ${metric.value} > ${threshold} ${metric.unit}`
      });
    }
  }

  /**
   * Emit an optimization event
   * 
   * @param type The event type
   * @param data The event data
   */
  protected emitEvent(type: OptimizationEventType, data?: any): void {
    const event: OptimizationEvent = {
      type,
      optimizerType: this.type,
      timestamp: Date.now(),
      data
    };
    
    this.eventEmitter.emit(type, event);
  }

  /**
   * Check if a feature is enabled for this optimizer
   * 
   * @param featureName The feature name
   * @returns True if the feature is enabled, false otherwise
   */
  protected isFeatureEnabled(featureName: string): boolean {
    // First check if the optimizer itself is enabled
    if (!this.config.enabled) {
      return false;
    }
    
    // Then check if the specific feature is enabled
    return this.config.features[featureName] === true;
  }

  /**
   * Get an option value from the configuration
   * 
   * @param optionName The option name
   * @param defaultValue The default value if the option is not defined
   * @returns The option value or the default value
   */
  protected getOption<T>(optionName: string, defaultValue: T): T {
    const value = this.config.options[optionName];
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Reload the configuration
   */
  protected reloadConfig(): void {
    this.config = this.configManager.getOptimizerConfig(this.type);
  }

  /**
   * Optimizer-specific initialization implementation
   * To be implemented by subclasses
   */
  protected abstract initializeImpl(): Promise<void>;

  /**
   * Optimizer-specific reset implementation
   * To be implemented by subclasses
   */
  protected abstract resetImpl(): void;
}