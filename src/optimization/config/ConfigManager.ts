/**
 * Tale Forge Unified Optimization Framework - Configuration Manager
 * 
 * This file implements the configuration manager for the optimization framework.
 */

import { OptimizerType, OptimizationConfig } from '../core/types';

/**
 * Default configuration for optimizers
 */
const DEFAULT_CONFIG: Record<OptimizerType, OptimizationConfig> = {
  [OptimizerType.VOICE]: {
    enabled: true,
    features: {
      'caching': true,
      'preloading': true,
      'streaming': true,
      'compression': true
    },
    thresholds: {
      'load-time.threshold': 3000, // ms
      'memory-usage.threshold': 50 * 1024 * 1024, // 50MB
      'error-rate.threshold': 0.05 // 5%
    },
    options: {
      'cache-size': 100 * 1024 * 1024, // 100MB
      'preload-timeout': 10000, // 10s
      'chunk-size': 64 * 1024 // 64KB
    }
  },
  [OptimizerType.IMAGE]: {
    enabled: true,
    features: {
      'lazy-loading': true,
      'responsive-images': true,
      'compression': true,
      'format-conversion': true
    },
    thresholds: {
      'load-time.threshold': 2000, // ms
      'size.threshold': 1024 * 1024, // 1MB
      'error-rate.threshold': 0.05 // 5%
    },
    options: {
      'quality': 80, // 0-100
      'default-format': 'webp',
      'placeholder-blur': 10, // px
      'lazy-margin': '200px'
    }
  },
  [OptimizerType.DATABASE]: {
    enabled: true,
    features: {
      'query-caching': true,
      'connection-pooling': true,
      'query-optimization': true,
      'batch-operations': true
    },
    thresholds: {
      'query-time.threshold': 500, // ms
      'connection-count.threshold': 20,
      'error-rate.threshold': 0.05 // 5%
    },
    options: {
      'cache-ttl': 5 * 60 * 1000, // 5 minutes
      'max-connections': 10,
      'retry-attempts': 3,
      'batch-size': 100
    }
  },
  [OptimizerType.PERFORMANCE]: {
    enabled: true,
    features: {
      'metrics-collection': true,
      'automatic-optimization': true,
      'reporting': true,
      'alerts': true
    },
    thresholds: {
      'cpu-usage.threshold': 80, // %
      'memory-usage.threshold': 80, // %
      'load-time.threshold': 3000, // ms
      'error-rate.threshold': 0.05 // 5%
    },
    options: {
      'sampling-rate': 0.1, // 10%
      'report-interval': 60 * 1000, // 1 minute
      'metrics-retention': 7 * 24 * 60 * 60 * 1000, // 7 days
      'alert-cooldown': 5 * 60 * 1000 // 5 minutes
    }
  },
  [OptimizerType.SUPABASE]: {
    enabled: true,
    features: {
      'connection-monitoring': true,
      'automatic-reconnect': true,
      'query-optimization': true,
      'realtime-fallback': true
    },
    thresholds: {
      'latency.threshold': 1000, // ms
      'error-rate.threshold': 0.05, // 5%
      'connection-failures.threshold': 3,
      'query-time.threshold': 500 // ms
    },
    options: {
      'health-check-interval': 30 * 1000, // 30 seconds
      'reconnect-attempts': 5,
      'reconnect-delay': 1000, // 1 second
      'timeout': 10000 // 10 seconds
    }
  }
};

/**
 * Configuration manager for the optimization framework
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private configs: Record<OptimizerType, OptimizationConfig>;
  private storageKey = 'tale_forge_optimization_config';

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.configs = this.loadConfig();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Get the configuration for a specific optimizer
   * 
   * @param type The optimizer type
   * @returns The optimizer configuration
   */
  public getOptimizerConfig(type: OptimizerType): OptimizationConfig {
    return this.configs[type];
  }

  /**
   * Update the configuration for a specific optimizer
   * 
   * @param type The optimizer type
   * @param config The new configuration
   */
  public updateOptimizerConfig(type: OptimizerType, config: Partial<OptimizationConfig>): void {
    this.configs[type] = {
      ...this.configs[type],
      ...config,
      features: {
        ...this.configs[type].features,
        ...(config.features || {})
      },
      thresholds: {
        ...this.configs[type].thresholds,
        ...(config.thresholds || {})
      },
      options: {
        ...this.configs[type].options,
        ...(config.options || {})
      }
    };
    
    this.saveConfig();
  }

  /**
   * Enable or disable an optimizer
   * 
   * @param type The optimizer type
   * @param enabled Whether the optimizer should be enabled
   */
  public setOptimizerEnabled(type: OptimizerType, enabled: boolean): void {
    this.configs[type].enabled = enabled;
    this.saveConfig();
  }

  /**
   * Enable or disable a feature for a specific optimizer
   * 
   * @param type The optimizer type
   * @param featureName The feature name
   * @param enabled Whether the feature should be enabled
   */
  public setFeatureEnabled(type: OptimizerType, featureName: string, enabled: boolean): void {
    this.configs[type].features[featureName] = enabled;
    this.saveConfig();
  }

  /**
   * Set a threshold for a specific optimizer
   * 
   * @param type The optimizer type
   * @param thresholdName The threshold name
   * @param value The threshold value
   */
  public setThreshold(type: OptimizerType, thresholdName: string, value: number): void {
    this.configs[type].thresholds[thresholdName] = value;
    this.saveConfig();
  }

  /**
   * Set an option for a specific optimizer
   * 
   * @param type The optimizer type
   * @param optionName The option name
   * @param value The option value
   */
  public setOption(type: OptimizerType, optionName: string, value: any): void {
    this.configs[type].options[optionName] = value;
    this.saveConfig();
  }

  /**
   * Reset the configuration to default values
   */
  public resetToDefaults(): void {
    this.configs = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    this.saveConfig();
  }

  /**
   * Load the configuration from local storage
   */
  private loadConfig(): Record<OptimizerType, OptimizationConfig> {
    if (typeof localStorage === 'undefined') {
      return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }
    
    const storedConfig = localStorage.getItem(this.storageKey);
    
    if (!storedConfig) {
      return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }
    
    try {
      const parsedConfig = JSON.parse(storedConfig);
      
      // Merge with default config to ensure all properties exist
      const mergedConfig: Record<OptimizerType, OptimizationConfig> = {} as any;
      
      for (const type of Object.values(OptimizerType)) {
        mergedConfig[type] = {
          enabled: parsedConfig[type]?.enabled ?? DEFAULT_CONFIG[type].enabled,
          features: {
            ...DEFAULT_CONFIG[type].features,
            ...(parsedConfig[type]?.features || {})
          },
          thresholds: {
            ...DEFAULT_CONFIG[type].thresholds,
            ...(parsedConfig[type]?.thresholds || {})
          },
          options: {
            ...DEFAULT_CONFIG[type].options,
            ...(parsedConfig[type]?.options || {})
          }
        };
      }
      
      return mergedConfig;
    } catch (error) {
      console.error('Error parsing optimization config:', error);
      return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }
  }

  /**
   * Save the configuration to local storage
   */
  private saveConfig(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.configs));
    } catch (error) {
      console.error('Error saving optimization config:', error);
    }
  }

  /**
   * Export the configuration as JSON
   * 
   * @returns The configuration as a JSON string
   */
  public exportConfig(): string {
    return JSON.stringify(this.configs, null, 2);
  }

  /**
   * Import configuration from JSON
   * 
   * @param json The configuration as a JSON string
   * @returns True if the import was successful, false otherwise
   */
  public importConfig(json: string): boolean {
    try {
      const config = JSON.parse(json);
      
      // Validate the config
      for (const type of Object.values(OptimizerType)) {
        if (!config[type]) {
          return false;
        }
      }
      
      this.configs = config;
      this.saveConfig();
      return true;
    } catch (error) {
      console.error('Error importing optimization config:', error);
      return false;
    }
  }
}

// Export singleton instance
export const configManager = ConfigManager.getInstance();