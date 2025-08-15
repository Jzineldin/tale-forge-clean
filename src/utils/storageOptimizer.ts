/**
 * Storage Optimizer - Migrates localStorage usage to secure storage
 * Part of the performance and security optimization plan
 */

import { secureStorage } from '@/services/secureStorage';
import { secureConsole as logger } from '@/utils/secureLogger';

interface MigrationResult {
  success: boolean;
  migratedKeys: string[];
  errors: string[];
}

/**
 * Migrate data from localStorage to secure storage
 */
export async function migrateLocalStorageToSecure(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedKeys: [],
    errors: []
  };

  try {
    // Critical data keys that should be migrated
    const criticalKeys = [
      'storyCanvasSettings',
      'anonymous_story_ids',
      'anonymous_story_metadata',
      'pending_feedback',
      'tale_forge_anonymous_id'
    ];

    for (const key of criticalKeys) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          // Store in secure storage
          await secureStorage.setItem(key, JSON.parse(data));
          
          // Remove from localStorage after successful migration
          localStorage.removeItem(key);
          
          result.migratedKeys.push(key);
          logger.info(`Migrated ${key} to secure storage`);
        }
      } catch (error) {
        const errorMsg = `Failed to migrate ${key}: ${error}`;
        result.errors.push(errorMsg);
        logger.error(errorMsg);
        result.success = false;
      }
    }

    // Clean up any remaining non-essential localStorage items
    cleanupNonEssentialStorage();

  } catch (error) {
    logger.error('Storage migration failed:', error);
    result.success = false;
    result.errors.push(`General migration error: ${error}`);
  }

  return result;
}

/**
 * Clean up non-essential localStorage items to reduce memory usage
 */
function cleanupNonEssentialStorage(): void {
  try {
    const keysToRemove: string[] = [];
    
    // Find keys that can be safely removed
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        // Remove debug and temporary keys
        if (key.startsWith('debug_') || 
            key.startsWith('temp_') || 
            key.startsWith('test_') ||
            key.includes('recovery_attempt') ||
            key.includes('session_')) {
          keysToRemove.push(key);
        }
      }
    }

    // Remove the identified keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      logger.debug(`Cleaned up localStorage key: ${key}`);
    });

  } catch (error) {
    logger.error('Failed to cleanup localStorage:', error);
  }
}

/**
 * Get storage usage statistics
 */
export function getStorageStats(): {
  localStorageSize: number;
  secureStorageSize: number;
  sessionStorageSize: number;
} {
  const stats = {
    localStorageSize: 0,
    secureStorageSize: 0,
    sessionStorageSize: 0
  };

  try {
    // Calculate localStorage size
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        stats.localStorageSize += (key.length + (value?.length || 0)) * 2; // UTF-16
      }
    }

    // Calculate sessionStorage size
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        stats.sessionStorageSize += (key.length + (value?.length || 0)) * 2; // UTF-16
      }
    }

  } catch (error) {
    logger.error('Failed to calculate storage stats:', error);
  }

  return stats;
}

/**
 * Optimize memory by clearing temporary data
 */
export function optimizeMemoryUsage(): void {
  try {
    // Clear temporary session data
    sessionStorage.removeItem('taleforge_session_state');
    
    // Clear old autosave data (keep only recent)
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('taleforge_autosave_')) {
        try {
          const data = sessionStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (parsed.timestamp && (now - parsed.timestamp) > maxAge) {
              sessionStorage.removeItem(key);
            }
          }
        } catch {
          // Remove corrupted data
          sessionStorage.removeItem(key);
        }
      }
    }

    logger.info('Memory optimization completed');
  } catch (error) {
    logger.error('Memory optimization failed:', error);
  }
}

/**
 * Initialize storage optimization on app startup
 */
export async function initializeStorageOptimization(): Promise<void> {
  try {
    // Check if migration is needed
    const hasLegacyData = localStorage.getItem('storyCanvasSettings') || 
                         localStorage.getItem('anonymous_story_ids');

    if (hasLegacyData) {
      logger.info('Legacy data detected, starting migration...');
      const result = await migrateLocalStorageToSecure();
      
      if (result.success) {
        logger.info(`Migration completed successfully. Migrated: ${result.migratedKeys.join(', ')}`);
      } else {
        logger.warn(`Migration completed with errors: ${result.errors.join(', ')}`);
      }
    }

    // Always run memory optimization
    optimizeMemoryUsage();

  } catch (error) {
    logger.error('Storage optimization initialization failed:', error);
  }
}

export default {
  migrateLocalStorageToSecure,
  cleanupNonEssentialStorage,
  getStorageStats,
  optimizeMemoryUsage,
  initializeStorageOptimization
};
