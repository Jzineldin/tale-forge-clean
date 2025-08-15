/**
 * Secure localStorage migration utility
 * Migrates existing localStorage usage to secureStorage
 */

import { secureStorage } from '@/services/secureStorage';

interface MigrationResult {
  migrated: string[];
  failed: string[];
  skipped: string[];
}

export class SecureStorageMigrator {
  private static readonly MIGRATION_KEY = 'sc_migration_completed';
  
  /**
   * Keys that should be migrated to secure storage
   */
  private static readonly MIGRATION_KEYS = [
    'taleforge_form_autosave',
    'anonymous_story_ids',
    'anonymous_story_metadata',
    'pending_feedback',
    'taleforge-changelog',
    'taleforge-changelog-version',
    'tale_forge_optimization_config',
    'tale_forge_anonymous_id'
  ];

  /**
   * Keys that should be preserved in localStorage (framework/debug keys)
   */
  private static readonly PRESERVE_KEYS = [
    'debug',
    '_react_devtools',
    '_redux_devtools'
  ];

  /**
   * Check if migration has already been completed
   */
  public static async isMigrationCompleted(): Promise<boolean> {
    try {
      const completed = await secureStorage.getItem(this.MIGRATION_KEY);
      return completed === true;
    } catch {
      return false;
    }
  }

  /**
   * Perform the migration from localStorage to secureStorage
   */
  public static async migrate(): Promise<MigrationResult> {
    const result: MigrationResult = {
      migrated: [],
      failed: [],
      skipped: []
    };

    if (await this.isMigrationCompleted()) {
      console.log('SecureStorage migration already completed');
      return result;
    }

    console.log('Starting secureStorage migration...');

    for (const key of this.MIGRATION_KEYS) {
      try {
        const value = localStorage.getItem(key);
        
        if (value === null) {
          result.skipped.push(key);
          continue;
        }

        // Parse the value if it's JSON
        let parsedValue: any;
        try {
          parsedValue = JSON.parse(value);
        } catch {
          parsedValue = value; // Keep as string if not JSON
        }

        // Save to secure storage with encryption for sensitive data
        const shouldEncrypt = this.shouldEncrypt(key);
        await secureStorage.setItem(key, parsedValue, { encrypt: shouldEncrypt });

        // Remove from localStorage after successful migration
        localStorage.removeItem(key);
        
        result.migrated.push(key);
        console.log(`Migrated ${key} to secure storage${shouldEncrypt ? ' (encrypted)' : ''}`);
      } catch (error) {
        console.error(`Failed to migrate ${key}:`, error);
        result.failed.push(key);
      }
    }

    // Mark migration as completed
    try {
      await secureStorage.setItem(this.MIGRATION_KEY, true, { encrypt: true });
      console.log('SecureStorage migration completed successfully');
    } catch (error) {
      console.error('Failed to mark migration as completed:', error);
    }

    return result;
  }

  /**
   * Clean up any remaining unsafe localStorage usage
   */
  public static cleanupUnsafeStorage(): void {
    const allKeys = Object.keys(localStorage);
    const unsafeKeys = allKeys.filter(key => 
      !this.PRESERVE_KEYS.some(preserve => key.startsWith(preserve)) &&
      !key.startsWith('sc_') // Allow our secure storage prefix
    );

    for (const key of unsafeKeys) {
      console.warn(`Removing unsafe localStorage key: ${key}`);
      localStorage.removeItem(key);
    }
  }

  /**
   * Force re-migration (for testing or emergency recovery)
   */
  public static async forceMigration(): Promise<MigrationResult> {
    try {
      await secureStorage.removeItem(this.MIGRATION_KEY);
      return await this.migrate();
    } catch (error) {
      console.error('Force migration failed:', error);
      return { migrated: [], failed: [], skipped: [] };
    }
  }

  /**
   * Determine if a key should be encrypted in secure storage
   */
  private static shouldEncrypt(key: string): boolean {
    const encryptKeys = [
      'anonymous_story_ids',
      'anonymous_story_metadata',
      'pending_feedback',
      'tale_forge_anonymous_id'
    ];
    
    return encryptKeys.includes(key);
  }
}

/**
 * Auto-migrate on module load if not already completed
 */
if (typeof window !== 'undefined') {
  SecureStorageMigrator.migrate().catch(error => {
    console.error('Auto-migration failed:', error);
  });
}