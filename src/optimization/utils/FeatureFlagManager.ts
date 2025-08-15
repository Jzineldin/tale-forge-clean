/**
 * Tale Forge Unified Optimization Framework - Feature Flag Manager
 *
 * This file implements the feature flag system for gradual rollout of optimizations.
 */

import { FeatureFlag, OptimizationEventType, OptimizerType } from '../core/types';
import { EventEmitter } from './EventEmitter';
import { ConfigManager } from '../config/ConfigManager';
import { supabase } from '@/integrations/supabase/client';

/**
 * Default feature flags
 */
const DEFAULT_FLAGS: FeatureFlag[] = [
  // Voice optimizer flags
  {
    name: 'voice-optimization',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable voice asset optimization'
  },
  {
    name: 'voice-caching',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable voice asset caching',
    dependencies: ['voice-optimization']
  },
  {
    name: 'voice-preloading',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable voice asset preloading',
    dependencies: ['voice-optimization']
  },
  {
    name: 'voice-streaming',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable voice asset streaming',
    dependencies: ['voice-optimization']
  },
  
  // Image optimizer flags
  {
    name: 'image-optimization',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable image optimization'
  },
  {
    name: 'image-lazy-loading',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable image lazy loading',
    dependencies: ['image-optimization']
  },
  {
    name: 'image-responsive',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable responsive images',
    dependencies: ['image-optimization']
  },
  {
    name: 'image-compression',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable image compression',
    dependencies: ['image-optimization']
  },
  
  // Database optimizer flags
  {
    name: 'database-optimization',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable database optimization'
  },
  {
    name: 'database-query-caching',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable database query caching',
    dependencies: ['database-optimization']
  },
  {
    name: 'database-connection-pooling',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable database connection pooling',
    dependencies: ['database-optimization']
  },
  {
    name: 'database-query-optimization',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable database query optimization',
    dependencies: ['database-optimization']
  },
  
  // Supabase connection flags
  {
    name: 'supabase-optimization',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable Supabase connection optimization'
  },
  {
    name: 'supabase-connection-monitoring',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable Supabase connection monitoring',
    dependencies: ['supabase-optimization']
  },
  {
    name: 'supabase-automatic-reconnect',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable Supabase automatic reconnection',
    dependencies: ['supabase-optimization', 'supabase-connection-monitoring']
  },
  {
    name: 'supabase-realtime-fallback',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable Supabase realtime fallback',
    dependencies: ['supabase-optimization']
  }
];

/**
 * Feature flag manager for the optimization framework
 */
export class FeatureFlagManager {
  private static instance: FeatureFlagManager;
  private flags: Map<string, FeatureFlag> = new Map();
  private userIdHash: number = 0;
  private storageKey = 'tale_forge_feature_flags';
  private eventEmitter: EventEmitter;
  private configManager: ConfigManager;

  /**
   * Private constructor for singleton pattern
   */
  private constructor(
    eventEmitter: EventEmitter = EventEmitter.getInstance(),
    configManager: ConfigManager = ConfigManager.getInstance()
  ) {
    this.eventEmitter = eventEmitter;
    this.configManager = configManager;
    this.initializeFlags();
    this.generateUserIdHash().catch(console.error);
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): FeatureFlagManager {
    if (!FeatureFlagManager.instance) {
      FeatureFlagManager.instance = new FeatureFlagManager();
    }
    return FeatureFlagManager.instance;
  }

  /**
   * Initialize feature flags
   */
  private initializeFlags(): void {
    // Load flags from storage or use defaults
    const storedFlags = this.loadFlags();
    
    if (storedFlags.length > 0) {
      // Use stored flags
      for (const flag of storedFlags) {
        this.flags.set(flag.name, flag);
      }
    } else {
      // Use default flags
      for (const flag of DEFAULT_FLAGS) {
        this.flags.set(flag.name, { ...flag });
      }
      
      // Save default flags
      this.saveFlags();
    }
    
    console.log(`Initialized ${this.flags.size} feature flags`);
  }

  /**
   * Generate a hash from the user ID for consistent flag assignment
   */
  private async generateUserIdHash(): Promise<void> {
    // Try to get user ID from Supabase auth
    let userId = '';
    
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        userId = session.user.id;
      }
    } catch (error) {
      console.warn('Could not get user ID from Supabase auth:', error);
    }
    
    // If no user ID, generate a random one and store it
    if (!userId) {
      const storedId = localStorage.getItem('tale_forge_anonymous_id');
      
      if (storedId) {
        userId = storedId;
      } else {
        userId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('tale_forge_anonymous_id', userId);
      }
    }
    
    // Generate a simple hash from the user ID
    this.userIdHash = userId.split('').reduce((hash, char) => {
      return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0) & 0xFFFFFFFF;
    
    // Normalize to 0-100 range
    this.userIdHash = Math.abs(this.userIdHash % 100);
  }

  /**
   * Load flags from local storage
   */
  private loadFlags(): FeatureFlag[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    
    const storedFlags = localStorage.getItem(this.storageKey);
    
    if (!storedFlags) {
      return [];
    }
    
    try {
      return JSON.parse(storedFlags);
    } catch (error) {
      console.error('Error parsing feature flags:', error);
      return [];
    }
  }

  /**
   * Save flags to local storage
   */
  private saveFlags(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const flagsArray = Array.from(this.flags.values());
      localStorage.setItem(this.storageKey, JSON.stringify(flagsArray));
    } catch (error) {
      console.error('Error saving feature flags:', error);
    }
  }

  /**
   * Check if a feature flag is enabled
   * 
   * @param flagName The feature flag name
   * @returns True if the feature is enabled, false otherwise
   */
  public isEnabled(flagName: string): boolean {
    const flag = this.flags.get(flagName);
    
    // If flag doesn't exist, return false
    if (!flag) {
      return false;
    }
    
    // If flag is not enabled, return false
    if (!flag.enabled) {
      return false;
    }
    
    // Check dependencies
    if (flag.dependencies) {
      for (const dependency of flag.dependencies) {
        if (!this.isEnabled(dependency)) {
          return false;
        }
      }
    }
    
    // If rollout percentage is 100%, return true
    if (flag.rolloutPercentage >= 100) {
      return true;
    }
    
    // If rollout percentage is 0%, return false
    if (flag.rolloutPercentage <= 0) {
      return false;
    }
    
    // Otherwise, check if user is in the rollout group
    return this.userIdHash < flag.rolloutPercentage;
  }

  /**
   * Enable a feature flag
   * 
   * @param flagName The feature flag name
   * @param rolloutPercentage Optional rollout percentage (0-100)
   */
  public enableFlag(flagName: string, rolloutPercentage?: number): void {
    const flag = this.flags.get(flagName);
    
    if (!flag) {
      console.warn(`Feature flag not found: ${flagName}`);
      return;
    }
    
    const wasEnabled = this.isEnabled(flagName);
    
    flag.enabled = true;
    
    if (rolloutPercentage !== undefined) {
      flag.rolloutPercentage = Math.max(0, Math.min(100, rolloutPercentage));
    }
    
    this.saveFlags();
    
    // Update optimizer config if applicable
    this.updateOptimizerConfig(flagName, true);
    
    // Emit event if the flag was not enabled before
    if (!wasEnabled && this.isEnabled(flagName)) {
      this.eventEmitter.emit(OptimizationEventType.FEATURE_ENABLED, {
        type: OptimizationEventType.FEATURE_ENABLED,
        optimizerType: this.getOptimizerTypeForFlag(flagName),
        timestamp: Date.now(),
        data: {
          flagName,
          rolloutPercentage: flag.rolloutPercentage
        }
      });
    }
  }

  /**
   * Disable a feature flag
   * 
   * @param flagName The feature flag name
   */
  public disableFlag(flagName: string): void {
    const flag = this.flags.get(flagName);
    
    if (!flag) {
      console.warn(`Feature flag not found: ${flagName}`);
      return;
    }
    
    const wasEnabled = this.isEnabled(flagName);
    
    flag.enabled = false;
    
    this.saveFlags();
    
    // Update optimizer config if applicable
    this.updateOptimizerConfig(flagName, false);
    
    // Emit event if the flag was enabled before
    if (wasEnabled) {
      this.eventEmitter.emit(OptimizationEventType.FEATURE_DISABLED, {
        type: OptimizationEventType.FEATURE_DISABLED,
        optimizerType: this.getOptimizerTypeForFlag(flagName),
        timestamp: Date.now(),
        data: {
          flagName
        }
      });
    }
  }

  /**
   * Set the rollout percentage for a feature flag
   * 
   * @param flagName The feature flag name
   * @param percentage The rollout percentage (0-100)
   */
  public setRolloutPercentage(flagName: string, percentage: number): void {
    const flag = this.flags.get(flagName);
    
    if (!flag) {
      console.warn(`Feature flag not found: ${flagName}`);
      return;
    }
    
    const wasEnabled = this.isEnabled(flagName);
    
    flag.rolloutPercentage = Math.max(0, Math.min(100, percentage));
    
    this.saveFlags();
    
    // Emit event if the flag's effective state changed
    const isNowEnabled = this.isEnabled(flagName);
    
    if (wasEnabled !== isNowEnabled) {
      const eventType = isNowEnabled 
        ? OptimizationEventType.FEATURE_ENABLED 
        : OptimizationEventType.FEATURE_DISABLED;
      
      this.eventEmitter.emit(eventType, {
        type: eventType,
        optimizerType: this.getOptimizerTypeForFlag(flagName),
        timestamp: Date.now(),
        data: {
          flagName,
          rolloutPercentage: flag.rolloutPercentage
        }
      });
    }
  }

  /**
   * Get all feature flags
   * 
   * @returns All feature flags
   */
  public getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Get a specific feature flag
   * 
   * @param flagName The feature flag name
   * @returns The feature flag or undefined if not found
   */
  public getFlag(flagName: string): FeatureFlag | undefined {
    return this.flags.get(flagName);
  }

  /**
   * Reset all feature flags to defaults
   */
  public resetToDefaults(): void {
    this.flags.clear();
    
    for (const flag of DEFAULT_FLAGS) {
      this.flags.set(flag.name, { ...flag });
    }
    
    this.saveFlags();
    
    console.log('Reset all feature flags to defaults');
  }

  /**
   * Update optimizer config when a flag is enabled or disabled
   * 
   * @param flagName The feature flag name
   * @param enabled Whether the flag is enabled
   */
  private updateOptimizerConfig(flagName: string, enabled: boolean): void {
    const optimizerType = this.getOptimizerTypeForFlag(flagName);
    
    if (optimizerType) {
      // Get the feature name without the optimizer prefix
      const featureName = flagName.replace(`${optimizerType.toLowerCase()}-`, '');
      
      // Update the optimizer config
      this.configManager.setFeatureEnabled(optimizerType, featureName, enabled);
    }
  }

  /**
   * Get the optimizer type for a feature flag
   * 
   * @param flagName The feature flag name
   * @returns The optimizer type or undefined if not found
   */
  private getOptimizerTypeForFlag(flagName: string): OptimizerType {
    if (flagName.startsWith('voice-')) {
      return OptimizerType.VOICE;
    } else if (flagName.startsWith('image-')) {
      return OptimizerType.IMAGE;
    } else if (flagName.startsWith('database-')) {
      return OptimizerType.DATABASE;
    } else if (flagName.startsWith('supabase-')) {
      return OptimizerType.SUPABASE;
    } else if (flagName.startsWith('performance-')) {
      return OptimizerType.PERFORMANCE;
    }
    
    // Default to performance optimizer
    return OptimizerType.PERFORMANCE;
  }
}

// Export singleton instance
export const featureFlagManager = FeatureFlagManager.getInstance();