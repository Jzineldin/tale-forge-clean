/**
 * Tale Forge Unified Optimization Framework - Supabase Connection Monitor
 * 
 * This file implements the Supabase connection monitoring system.
 */

import { supabase } from '@/integrations/supabase/client';
import { BaseOptimizer } from '../core/BaseOptimizer';
import { 
  OptimizerType, 
  OptimizationEventType, 
  ConnectionHealthStatus,
  ConnectionHealthMetrics
} from '../core/types';
import { EventEmitter } from '../utils/EventEmitter';
import { ConfigManager } from '../config/ConfigManager';

/**
 * Supabase connection monitor
 * Monitors the health of the Supabase connection and provides metrics and alerts
 */
export class SupabaseConnectionMonitor extends BaseOptimizer {
  private healthCheckInterval: number | null = null;
  private healthMetrics: ConnectionHealthMetrics = {
    status: ConnectionHealthStatus.DISCONNECTED,
    latency: 0,
    errorRate: 0,
    successRate: 100,
    lastChecked: 0,
    consecutiveFailures: 0,
    consecutiveSuccesses: 0
  };
  
  private recentRequests: Array<{ success: boolean, latency: number, timestamp: number }> = [];
  private maxRecentRequests = 100;
  private healthCheckPromise: Promise<void> | null = null;

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
    super(OptimizerType.SUPABASE, eventEmitter, configManager);
  }

  /**
   * Initialize the Supabase connection monitor
   */
  protected async initializeImpl(): Promise<void> {
    // Check if connection monitoring is enabled
    if (!this.isFeatureEnabled('connection-monitoring')) {
      console.log('Supabase connection monitoring is disabled');
      return;
    }

    // Perform initial health check
    await this.checkConnectionHealth();
    
    // Start periodic health checks
    const interval = this.getOption('health-check-interval', 30000);
    this.healthCheckInterval = window.setInterval(() => {
      // Only start a new health check if the previous one has completed
      if (!this.healthCheckPromise) {
        this.healthCheckPromise = this.checkConnectionHealth().finally(() => {
          this.healthCheckPromise = null;
        });
      }
    }, interval);
    
    console.log(`Supabase connection monitoring initialized with interval: ${interval}ms`);
  }

  /**
   * Reset the Supabase connection monitor
   */
  protected resetImpl(): void {
    // Clear health check interval
    if (this.healthCheckInterval !== null) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    // Reset health metrics
    this.healthMetrics = {
      status: ConnectionHealthStatus.DISCONNECTED,
      latency: 0,
      errorRate: 0,
      successRate: 100,
      lastChecked: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0
    };
    
    // Clear recent requests
    this.recentRequests = [];
    
    console.log('Supabase connection monitoring reset');
  }

  /**
   * Check the health of the Supabase connection
   */
  public async checkConnectionHealth(): Promise<void> {
    const startTime = performance.now();
    let success = false;
    
    try {
      // Perform a simple query to check connection
      // Use an existing table for the health check
      const { error } = await supabase.from('admin_settings').select('count').limit(1).maybeSingle();
      
      // If there's no error, the connection is healthy
      success = !error;
      
      // Calculate latency
      const latency = performance.now() - startTime;
      
      // Update recent requests
      this.addRecentRequest(success, latency);
      
      // Update health metrics
      this.updateHealthMetrics(success, latency);
      
      // Emit appropriate events based on the health status
      this.emitHealthEvents();
      
      // Record metrics
      this.recordMetric('supabase-connection-latency', latency, 'ms');
      this.recordMetric('supabase-connection-success', success ? 1 : 0, 'boolean');
      
    } catch (error) {
      // Handle unexpected errors
      console.error('Error checking Supabase connection health:', error);
      
      // Update recent requests
      this.addRecentRequest(false, performance.now() - startTime);
      
      // Update health metrics
      this.updateHealthMetrics(false, 0);
      
      // Emit appropriate events
      this.emitHealthEvents();
      
      // Record error metric
      this.recordMetric('supabase-connection-error', 1, 'count');
    }
  }

  /**
   * Add a recent request to the history
   * 
   * @param success Whether the request was successful
   * @param latency The request latency in milliseconds
   */
  private addRecentRequest(success: boolean, latency: number): void {
    // Add to recent requests
    this.recentRequests.push({
      success,
      latency,
      timestamp: Date.now()
    });
    
    // Trim to max size
    if (this.recentRequests.length > this.maxRecentRequests) {
      this.recentRequests.shift();
    }
  }

  /**
   * Update health metrics based on the latest check
   * 
   * @param success Whether the check was successful
   * @param latency The check latency in milliseconds
   */
  private updateHealthMetrics(success: boolean, latency: number): void {
    // Update consecutive counters
    if (success) {
      this.healthMetrics.consecutiveSuccesses++;
      this.healthMetrics.consecutiveFailures = 0;
    } else {
      this.healthMetrics.consecutiveFailures++;
      this.healthMetrics.consecutiveSuccesses = 0;
    }
    
    // Update latency (only if successful)
    if (success) {
      this.healthMetrics.latency = latency;
    }
    
    // Calculate error and success rates
    const recentRequestsCount = this.recentRequests.length;
    if (recentRequestsCount > 0) {
      const successCount = this.recentRequests.filter(r => r.success).length;
      this.healthMetrics.successRate = (successCount / recentRequestsCount) * 100;
      this.healthMetrics.errorRate = 100 - this.healthMetrics.successRate;
    }
    
    // Update last checked timestamp
    this.healthMetrics.lastChecked = Date.now();
    
    // Determine connection status
    this.updateConnectionStatus();
  }

  /**
   * Update the connection status based on health metrics
   */
  private updateConnectionStatus(): void {
    const previousStatus = this.healthMetrics.status;
    let newStatus: ConnectionHealthStatus;
    
    // Get thresholds from config
    const latencyThreshold = this.config.thresholds['latency.threshold'] || 1000;
    const errorRateThreshold = this.config.thresholds['error-rate.threshold'] || 0.05;
    const connectionFailuresThreshold = this.config.thresholds['connection-failures.threshold'] || 3;
    
    // Determine status based on metrics
    if (this.healthMetrics.consecutiveFailures >= connectionFailuresThreshold) {
      newStatus = ConnectionHealthStatus.DISCONNECTED;
    } else if (this.healthMetrics.errorRate > errorRateThreshold * 100) {
      newStatus = ConnectionHealthStatus.UNHEALTHY;
    } else if (this.healthMetrics.latency > latencyThreshold) {
      newStatus = ConnectionHealthStatus.DEGRADED;
    } else {
      newStatus = ConnectionHealthStatus.HEALTHY;
    }
    
    // Update status
    this.healthMetrics.status = newStatus;
    
    // Log status change
    if (previousStatus !== newStatus) {
      console.log(`Supabase connection status changed: ${previousStatus} -> ${newStatus}`);
    }
  }

  /**
   * Emit events based on the current health status
   */
  private emitHealthEvents(): void {
    const status = this.healthMetrics.status;
    
    // Emit event based on status
    switch (status) {
      case ConnectionHealthStatus.HEALTHY:
        if (this.healthMetrics.consecutiveSuccesses === 1) {
          this.emitEvent(OptimizationEventType.CONNECTION_RESTORED, {
            status,
            metrics: this.healthMetrics
          });
        }
        break;
        
      case ConnectionHealthStatus.DEGRADED:
        this.emitEvent(OptimizationEventType.CONNECTION_DEGRADED, {
          status,
          metrics: this.healthMetrics,
          reason: 'High latency'
        });
        break;
        
      case ConnectionHealthStatus.UNHEALTHY:
        this.emitEvent(OptimizationEventType.CONNECTION_DEGRADED, {
          status,
          metrics: this.healthMetrics,
          reason: 'High error rate'
        });
        break;
        
      case ConnectionHealthStatus.DISCONNECTED:
        if (this.healthMetrics.consecutiveFailures === 1) {
          this.emitEvent(OptimizationEventType.CONNECTION_LOST, {
            status,
            metrics: this.healthMetrics
          });
        }
        break;
    }
  }

  /**
   * Get the current connection health metrics
   * 
   * @returns The current connection health metrics
   */
  public getConnectionHealth(): ConnectionHealthMetrics {
    return { ...this.healthMetrics };
  }

  /**
   * Get the recent request history
   * 
   * @returns The recent request history
   */
  public getRecentRequests(): Array<{ success: boolean, latency: number, timestamp: number }> {
    return [...this.recentRequests];
  }

  /**
   * Check if the connection is currently healthy
   * 
   * @returns True if the connection is healthy, false otherwise
   */
  public isConnectionHealthy(): boolean {
    return this.healthMetrics.status === ConnectionHealthStatus.HEALTHY;
  }

  /**
   * Force a connection health check
   * 
   * @returns A promise that resolves when the health check is complete
   */
  public async forceHealthCheck(): Promise<ConnectionHealthMetrics> {
    await this.checkConnectionHealth();
    return this.getConnectionHealth();
  }
}

// Export singleton instance
export const supabaseConnectionMonitor = new SupabaseConnectionMonitor();