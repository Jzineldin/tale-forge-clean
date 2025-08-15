import { supabase } from '@/integrations/supabase/client';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetGroups: string[];
  createdAt: string;
  updatedAt: string;
  version: string;
  fallbackEnabled: boolean;
  dependencies: string[];
  metrics: FeatureFlagMetrics;
}

export interface FeatureFlagMetrics {
  usageCount: number;
  errorCount: number;
  successRate: number;
  avgResponseTime: number;
  lastUsed: string;
}

export interface RollbackConfig {
  flagId: string;
  reason: string;
  automatic: boolean;
  triggeredBy: string;
  timestamp: string;
  previousState: FeatureFlag;
  newState: FeatureFlag;
}

export interface FeatureFlagHistory {
  flagId: string;
  action: 'created' | 'enabled' | 'disabled' | 'modified' | 'rollback';
  timestamp: string;
  user: string;
  changes: Record<string, any>;
  reason?: string;
}

export class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private history: FeatureFlagHistory[] = [];
  private rollbackConfigs: Map<string, RollbackConfig> = new Map();
  
  // AI Storytelling Feature Flags
  private readonly AI_FEATURES = {
    STORY_CONTEXT_MANAGER: 'ai_story_context_manager',
    CHOICE_GENERATOR_V2: 'ai_choice_generator_v2',
    AGE_ADAPTATION_ENHANCED: 'ai_age_adaptation_enhanced',
    GENRE_MANAGER_ADVANCED: 'ai_genre_manager_advanced',
    CHARACTER_INTEGRATION: 'ai_character_integration',
    VISUAL_CONTEXT_MANAGER: 'ai_visual_context_manager',
    QUALITY_SCORING_SYSTEM: 'ai_quality_scoring',
    PERFORMANCE_MONITORING: 'ai_performance_monitoring',
    MULTILINGUAL_SUPPORT: 'ai_multilingual_support',
    ADVANCED_CACHING: 'ai_advanced_caching'
  };

  constructor() {
    this.initializeFlags();
  }

  /**
   * Initialize default feature flags
   */
  private initializeFlags(): void {
    // Story Context Manager
    this.createFlag({
      id: this.AI_FEATURES.STORY_CONTEXT_MANAGER,
      name: 'Story Context Manager',
      description: 'Enhanced context tracking and persistence across story segments',
      enabled: true,
      rolloutPercentage: 100,
      targetGroups: ['all'],
      version: '2.0.0',
      fallbackEnabled: true,
      dependencies: [],
      metrics: this.createDefaultMetrics()
    });

    // Choice Generator V2
    this.createFlag({
      id: this.AI_FEATURES.CHOICE_GENERATOR_V2,
      name: 'Choice Generator V2',
      description: 'Improved choice diversity and consequence tracking',
      enabled: true,
      rolloutPercentage: 80,
      targetGroups: ['beta_users'],
      version: '2.0.0',
      fallbackEnabled: true,
      dependencies: [this.AI_FEATURES.STORY_CONTEXT_MANAGER],
      metrics: this.createDefaultMetrics()
    });

    // Age Adaptation Enhanced
    this.createFlag({
      id: this.AI_FEATURES.AGE_ADAPTATION_ENHANCED,
      name: 'Enhanced Age Adaptation',
      description: 'Advanced age-appropriate content filtering and vocabulary adaptation',
      enabled: true,
      rolloutPercentage: 100,
      targetGroups: ['all'],
      version: '2.0.0',
      fallbackEnabled: true,
      dependencies: [],
      metrics: this.createDefaultMetrics()
    });

    // Genre Manager Advanced
    this.createFlag({
      id: this.AI_FEATURES.GENRE_MANAGER_ADVANCED,
      name: 'Advanced Genre Manager',
      description: 'Multi-genre blending and convention enforcement',
      enabled: true,
      rolloutPercentage: 60,
      targetGroups: ['premium_users', 'beta_users'],
      version: '2.0.0',
      fallbackEnabled: true,
      dependencies: [],
      metrics: this.createDefaultMetrics()
    });

    // Character Integration
    this.createFlag({
      id: this.AI_FEATURES.CHARACTER_INTEGRATION,
      name: 'Character Integration Manager',
      description: 'Consistent character tracking and development',
      enabled: true,
      rolloutPercentage: 90,
      targetGroups: ['all'],
      version: '2.0.0',
      fallbackEnabled: true,
      dependencies: [this.AI_FEATURES.STORY_CONTEXT_MANAGER],
      metrics: this.createDefaultMetrics()
    });

    // Visual Context Manager
    this.createFlag({
      id: this.AI_FEATURES.VISUAL_CONTEXT_MANAGER,
      name: 'Visual Context Manager',
      description: 'Consistent visual generation and style maintenance',
      enabled: true,
      rolloutPercentage: 70,
      targetGroups: ['premium_users'],
      version: '2.0.0',
      fallbackEnabled: true,
      dependencies: [this.AI_FEATURES.CHARACTER_INTEGRATION],
      metrics: this.createDefaultMetrics()
    });

    // Quality Scoring System
    this.createFlag({
      id: this.AI_FEATURES.QUALITY_SCORING_SYSTEM,
      name: 'Quality Scoring System',
      description: 'Automated quality assessment and validation',
      enabled: false,
      rolloutPercentage: 0,
      targetGroups: ['internal_testing'],
      version: '1.0.0',
      fallbackEnabled: false,
      dependencies: [],
      metrics: this.createDefaultMetrics()
    });

    // Performance Monitoring
    this.createFlag({
      id: this.AI_FEATURES.PERFORMANCE_MONITORING,
      name: 'Performance Monitoring',
      description: 'Real-time performance tracking and optimization',
      enabled: true,
      rolloutPercentage: 100,
      targetGroups: ['all'],
      version: '1.0.0',
      fallbackEnabled: false,
      dependencies: [],
      metrics: this.createDefaultMetrics()
    });
  }

  /**
   * Check if a feature is enabled for a user
   */
  isEnabled(flagId: string, userId?: string, userGroups?: string[]): boolean {
    const flag = this.flags.get(flagId);
    
    if (!flag) {
      console.warn(`Feature flag ${flagId} not found`);
      return false;
    }

    // Check if flag is globally disabled
    if (!flag.enabled) {
      return false;
    }

    // Check dependencies
    if (!this.checkDependencies(flag)) {
      return false;
    }

    // Check target groups
    if (flag.targetGroups.includes('all')) {
      return this.checkRolloutPercentage(flag, userId);
    }

    if (userGroups) {
      const hasTargetGroup = userGroups.some(group => flag.targetGroups.includes(group));
      if (hasTargetGroup) {
        return this.checkRolloutPercentage(flag, userId);
      }
    }

    return false;
  }

  /**
   * Enable a feature flag
   */
  async enableFlag(flagId: string, rolloutPercentage: number = 100): Promise<void> {
    const flag = this.flags.get(flagId);
    
    if (!flag) {
      throw new Error(`Feature flag ${flagId} not found`);
    }

    const previousState = { ...flag };
    
    flag.enabled = true;
    flag.rolloutPercentage = rolloutPercentage;
    flag.updatedAt = new Date().toISOString();

    // Record history
    this.recordHistory({
      flagId,
      action: 'enabled',
      timestamp: flag.updatedAt,
      user: 'system',
      changes: {
        enabled: { from: previousState.enabled, to: flag.enabled },
        rolloutPercentage: { from: previousState.rolloutPercentage, to: flag.rolloutPercentage }
      }
    });

    // Store in database
    await this.persistFlag(flag);
  }

  /**
   * Disable a feature flag
   */
  async disableFlag(flagId: string, reason?: string): Promise<void> {
    const flag = this.flags.get(flagId);
    
    if (!flag) {
      throw new Error(`Feature flag ${flagId} not found`);
    }

    const previousState = { ...flag };
    
    flag.enabled = false;
    flag.updatedAt = new Date().toISOString();

    // Record history
    this.recordHistory({
      flagId,
      action: 'disabled',
      timestamp: flag.updatedAt,
      user: 'system',
      changes: {
        enabled: { from: previousState.enabled, to: flag.enabled }
      },
      reason
    });

    // Store in database
    await this.persistFlag(flag);
  }

  /**
   * Gradual rollout of a feature
   */
  async gradualRollout(
    flagId: string,
    targetPercentage: number,
    incrementPercentage: number = 10,
    intervalMs: number = 3600000 // 1 hour
  ): Promise<void> {
    const flag = this.flags.get(flagId);
    
    if (!flag) {
      throw new Error(`Feature flag ${flagId} not found`);
    }

    const rolloutInterval = setInterval(async () => {
      if (flag.rolloutPercentage >= targetPercentage) {
        clearInterval(rolloutInterval);
        console.log(`Gradual rollout complete for ${flagId}`);
        return;
      }

      flag.rolloutPercentage = Math.min(
        flag.rolloutPercentage + incrementPercentage,
        targetPercentage
      );
      
      flag.updatedAt = new Date().toISOString();
      
      console.log(`Rollout progress for ${flagId}: ${flag.rolloutPercentage}%`);
      
      // Check metrics and potentially rollback
      const shouldRollback = await this.checkMetricsForRollback(flag);
      if (shouldRollback) {
        clearInterval(rolloutInterval);
        await this.rollback(flagId, 'Automatic rollback due to poor metrics');
      } else {
        await this.persistFlag(flag);
      }
    }, intervalMs);
  }

  /**
   * Rollback a feature flag to previous state
   */
  async rollback(flagId: string, reason: string): Promise<void> {
    const flag = this.flags.get(flagId);
    
    if (!flag) {
      throw new Error(`Feature flag ${flagId} not found`);
    }

    // Find the last stable state from history
    const lastStableState = this.findLastStableState(flagId);
    
    if (!lastStableState) {
      // Fallback to disabling the feature
      await this.disableFlag(flagId, reason);
      return;
    }

    const rollbackConfig: RollbackConfig = {
      flagId,
      reason,
      automatic: reason.includes('Automatic'),
      triggeredBy: 'system',
      timestamp: new Date().toISOString(),
      previousState: { ...flag },
      newState: lastStableState
    };

    // Apply rollback
    this.flags.set(flagId, lastStableState);
    this.rollbackConfigs.set(flagId, rollbackConfig);

    // Record history
    this.recordHistory({
      flagId,
      action: 'rollback',
      timestamp: rollbackConfig.timestamp,
      user: rollbackConfig.triggeredBy,
      changes: {
        state: { from: rollbackConfig.previousState, to: rollbackConfig.newState }
      },
      reason
    });

    // Store in database
    await this.persistFlag(lastStableState);
    
    // Notify about rollback
    await this.notifyRollback(rollbackConfig);
  }

  /**
   * Check if automatic rollback is needed based on metrics
   */
  private async checkMetricsForRollback(flag: FeatureFlag): Promise<boolean> {
    const metrics = flag.metrics;
    
    // Define thresholds for automatic rollback
    const thresholds = {
      minSuccessRate: 90,
      maxErrorCount: 100,
      maxResponseTime: 2000
    };

    // Check success rate
    if (metrics.successRate < thresholds.minSuccessRate) {
      console.warn(`Low success rate for ${flag.id}: ${metrics.successRate}%`);
      return true;
    }

    // Check error count
    if (metrics.errorCount > thresholds.maxErrorCount) {
      console.warn(`High error count for ${flag.id}: ${metrics.errorCount}`);
      return true;
    }

    // Check response time
    if (metrics.avgResponseTime > thresholds.maxResponseTime) {
      console.warn(`High response time for ${flag.id}: ${metrics.avgResponseTime}ms`);
      return true;
    }

    return false;
  }

  /**
   * Update feature flag metrics
   */
  async updateMetrics(
    flagId: string,
    success: boolean,
    responseTime: number
  ): Promise<void> {
    const flag = this.flags.get(flagId);
    
    if (!flag) {
      return;
    }

    const metrics = flag.metrics;
    
    metrics.usageCount++;
    if (!success) {
      metrics.errorCount++;
    }
    
    // Update success rate
    metrics.successRate = ((metrics.usageCount - metrics.errorCount) / metrics.usageCount) * 100;
    
    // Update average response time
    metrics.avgResponseTime = 
      (metrics.avgResponseTime * (metrics.usageCount - 1) + responseTime) / metrics.usageCount;
    
    metrics.lastUsed = new Date().toISOString();

    // Check if automatic rollback is needed
    if (await this.checkMetricsForRollback(flag)) {
      await this.rollback(flagId, 'Automatic rollback due to poor metrics');
    }
  }

  /**
   * Get feature flag with fallback
   */
  async getFeatureImplementation(flagId: string, userId?: string): Promise<any> {
    const isEnabled = this.isEnabled(flagId, userId);
    
    if (isEnabled) {
      // Return new implementation
      return this.getNewImplementation(flagId);
    } else if (this.flags.get(flagId)?.fallbackEnabled) {
      // Return fallback implementation
      return this.getFallbackImplementation(flagId);
    } else {
      // Feature is completely disabled
      return null;
    }
  }

  /**
   * Get new implementation for a feature
   */
  private getNewImplementation(flagId: string): any {
    const implementations: Record<string, any> = {
      [this.AI_FEATURES.STORY_CONTEXT_MANAGER]: {
        module: 'StoryContextManager',
        version: '2.0.0',
        handler: 'enhanced'
      },
      [this.AI_FEATURES.CHOICE_GENERATOR_V2]: {
        module: 'ChoiceGenerator',
        version: '2.0.0',
        handler: 'advanced'
      },
      [this.AI_FEATURES.AGE_ADAPTATION_ENHANCED]: {
        module: 'AgeAdaptationManager',
        version: '2.0.0',
        handler: 'enhanced'
      },
      [this.AI_FEATURES.GENRE_MANAGER_ADVANCED]: {
        module: 'GenreManager',
        version: '2.0.0',
        handler: 'advanced'
      },
      [this.AI_FEATURES.CHARACTER_INTEGRATION]: {
        module: 'CharacterIntegrationManager',
        version: '2.0.0',
        handler: 'integrated'
      },
      [this.AI_FEATURES.VISUAL_CONTEXT_MANAGER]: {
        module: 'VisualContextManager',
        version: '2.0.0',
        handler: 'enhanced'
      }
    };

    return implementations[flagId];
  }

  /**
   * Get fallback implementation for a feature
   */
  private getFallbackImplementation(flagId: string): any {
    const fallbacks: Record<string, any> = {
      [this.AI_FEATURES.STORY_CONTEXT_MANAGER]: {
        module: 'StoryContextManager',
        version: '1.0.0',
        handler: 'basic'
      },
      [this.AI_FEATURES.CHOICE_GENERATOR_V2]: {
        module: 'ChoiceGenerator',
        version: '1.0.0',
        handler: 'basic'
      },
      [this.AI_FEATURES.AGE_ADAPTATION_ENHANCED]: {
        module: 'AgeAdaptationManager',
        version: '1.0.0',
        handler: 'basic'
      },
      [this.AI_FEATURES.GENRE_MANAGER_ADVANCED]: {
        module: 'GenreManager',
        version: '1.0.0',
        handler: 'basic'
      },
      [this.AI_FEATURES.CHARACTER_INTEGRATION]: {
        module: 'CharacterIntegrationManager',
        version: '1.0.0',
        handler: 'basic'
      },
      [this.AI_FEATURES.VISUAL_CONTEXT_MANAGER]: {
        module: 'VisualContextManager',
        version: '1.0.0',
        handler: 'basic'
      }
    };

    return fallbacks[flagId];
  }

  /**
   * Helper methods
   */
  private createFlag(config: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>): void {
    const flag: FeatureFlag = {
      ...config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.flags.set(flag.id, flag);
  }

  private createDefaultMetrics(): FeatureFlagMetrics {
    return {
      usageCount: 0,
      errorCount: 0,
      successRate: 100,
      avgResponseTime: 0,
      lastUsed: new Date().toISOString()
    };
  }

  private checkDependencies(flag: FeatureFlag): boolean {
    for (const depId of flag.dependencies) {
      const depFlag = this.flags.get(depId);
      if (!depFlag || !depFlag.enabled) {
        return false;
      }
    }
    return true;
  }

  private checkRolloutPercentage(flag: FeatureFlag, userId?: string): boolean {
    if (flag.rolloutPercentage === 100) {
      return true;
    }
    
    if (!userId) {
      // Random rollout for anonymous users
      return Math.random() * 100 < flag.rolloutPercentage;
    }
    
    // Consistent rollout based on user ID
    const hash = this.hashUserId(userId);
    return (hash % 100) < flag.rolloutPercentage;
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private findLastStableState(flagId: string): FeatureFlag | null {
    // Look through history for last stable state
    const flagHistory = this.history
      .filter(h => h.flagId === flagId && h.action !== 'rollback')
      .reverse();
    
    // For now, return a disabled state as fallback
    const currentFlag = this.flags.get(flagId);
    if (currentFlag) {
      return {
        ...currentFlag,
        enabled: false,
        rolloutPercentage: 0
      };
    }
    
    return null;
  }

  private recordHistory(entry: FeatureFlagHistory): void {
    this.history.push(entry);
    
    // Keep only last 100 entries per flag
    const flagHistory = this.history.filter(h => h.flagId === entry.flagId);
    if (flagHistory.length > 100) {
      const toRemove = flagHistory.slice(0, flagHistory.length - 100);
      this.history = this.history.filter(h => !toRemove.includes(h));
    }
  }

  private async persistFlag(flag: FeatureFlag): Promise<void> {
    try {
      // In a real implementation, this would save to database
      console.log('Persisting feature flag:', flag);
      
      // await supabase
      //   .from('feature_flags')
      //   .upsert({
      //     id: flag.id,
      //     name: flag.name,
      //     description: flag.description,
      //     enabled: flag.enabled,
      //     rollout_percentage: flag.rolloutPercentage,
      //     target_groups: flag.targetGroups,
      //     version: flag.version,
      //     fallback_enabled: flag.fallbackEnabled,
      //     dependencies: flag.dependencies,
      //     metrics: flag.metrics,
      //     updated_at: flag.updatedAt
      //   });
    } catch (error) {
      console.error('Error persisting feature flag:', error);
    }
  }

  private async notifyRollback(config: RollbackConfig): Promise<void> {
    console.warn('FEATURE ROLLBACK:', {
      flag: config.flagId,
      reason: config.reason,
      automatic: config.automatic,
      timestamp: config.timestamp
    });
    
    // In a real implementation, this would send notifications
    // to monitoring systems, Slack, email, etc.
  }

  /**
   * Export feature flag configuration
   */
  exportConfiguration(): {
    flags: FeatureFlag[];
    history: FeatureFlagHistory[];
    rollbacks: RollbackConfig[];
  } {
    return {
      flags: Array.from(this.flags.values()),
      history: this.history,
      rollbacks: Array.from(this.rollbackConfigs.values())
    };
  }

  /**
   * Get feature flag status summary
   */
  getStatusSummary(): {
    total: number;
    enabled: number;
    disabled: number;
    inRollout: number;
    withIssues: number;
  } {
    const flags = Array.from(this.flags.values());
    
    return {
      total: flags.length,
      enabled: flags.filter(f => f.enabled).length,
      disabled: flags.filter(f => !f.enabled).length,
      inRollout: flags.filter(f => f.enabled && f.rolloutPercentage < 100).length,
      withIssues: flags.filter(f => f.metrics.successRate < 90 || f.metrics.errorCount > 50).length
    };
  }
}

// Export singleton instance
export const featureFlagManager = new FeatureFlagManager();