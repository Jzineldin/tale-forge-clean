/**
 * Tale Forge Unified Optimization Framework
 * 
 * This file exports all components of the optimization framework.
 */

// Core types and interfaces
export * from './core/types';
export * from './core/BaseOptimizer';

// Utilities
export * from './utils/EventEmitter';
export * from './utils/FeatureFlagManager';

// Configuration
export * from './config/ConfigManager';

// Monitoring
export * from './monitoring/SupabaseConnectionMonitor';

// Adapters
export * from './adapters/DatabaseOptimizerAdapter';
export * from './adapters/VoiceOptimizerAdapter';
export * from './adapters/ImageOptimizerAdapter';
export * from './adapters/PerformanceMonitorAdapter';

// Initialize the framework
import { eventEmitter } from './utils/EventEmitter';
import { configManager } from './config/ConfigManager';
import { featureFlagManager } from './utils/FeatureFlagManager';
import { supabaseConnectionMonitor } from './monitoring/SupabaseConnectionMonitor';
import { databaseOptimizerAdapter } from './adapters/DatabaseOptimizerAdapter';
import { voiceOptimizerAdapter } from './adapters/VoiceOptimizerAdapter';
import { imageOptimizerAdapter } from './adapters/ImageOptimizerAdapter';
import { performanceMonitorAdapter } from './adapters/PerformanceMonitorAdapter';

/**
 * Initialize the optimization framework
 */
export async function initializeOptimizationFramework(): Promise<void> {
  console.log('Initializing Tale Forge Unified Optimization Framework...');
  
  try {
    // Initialize components in the correct order
    await supabaseConnectionMonitor.initialize();
    await databaseOptimizerAdapter.initialize();
    await voiceOptimizerAdapter.initialize();
    await imageOptimizerAdapter.initialize();
    await performanceMonitorAdapter.instance.initialize();
    
    console.log('Tale Forge Unified Optimization Framework initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Tale Forge Unified Optimization Framework:', error);
    throw error;
  }
}

/**
 * Reset the optimization framework
 */
export function resetOptimizationFramework(): void {
  console.log('Resetting Tale Forge Unified Optimization Framework...');
  
  // Reset components in the reverse order
  performanceMonitorAdapter.instance.reset();
  imageOptimizerAdapter.reset();
  voiceOptimizerAdapter.reset();
  databaseOptimizerAdapter.reset();
  supabaseConnectionMonitor.reset();
  
  console.log('Tale Forge Unified Optimization Framework reset successfully');
}

// Export singleton instances
export {
  eventEmitter,
  configManager,
  featureFlagManager,
  supabaseConnectionMonitor,
  databaseOptimizerAdapter,
  voiceOptimizerAdapter,
  imageOptimizerAdapter,
  performanceMonitorAdapter
};