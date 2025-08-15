/**
 * Secure changelog manager using secureStorage instead of localStorage
 */

import { secureStorage } from '@/services/secureStorage';

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    type: 'feature' | 'improvement' | 'fix';
    description: string;
  }[];
}

class SecureChangelogManager {
  private static readonly STORAGE_KEY = 'taleforge-changelog';
  private static readonly VERSION_KEY = 'taleforge-changelog-version';
  private static readonly CURRENT_VERSION = '2.10.0-stability-update';
  
  // Get current changelog from secure storage or return default
  static async getCurrentChangelog(): Promise<ChangelogEntry[]> {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = await secureStorage.getItem(this.STORAGE_KEY);
      const storedVersion = await secureStorage.getItem(this.VERSION_KEY);
      
      // If version doesn't match, clear cache and use new default
      if (storedVersion !== this.CURRENT_VERSION) {
        await secureStorage.removeItem(this.STORAGE_KEY);
        await secureStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
      }
      
      if (stored && storedVersion === this.CURRENT_VERSION) {
        return stored;
      }
      
      // Return default changelog
      return this.getDefaultChangelog();
    } catch (error) {
      console.error('Failed to get changelog from secure storage:', error);
      return this.getDefaultChangelog();
    }
  }
  
  // Update changelog
  static async updateChangelog(changelog: ChangelogEntry[]): Promise<void> {
    try {
      await secureStorage.setItem(this.STORAGE_KEY, changelog);
      console.log('Changelog updated in secure storage');
    } catch (error) {
      console.error('Failed to update changelog in secure storage:', error);
    }
  }
  
  // Clear changelog
  static async clearChangelog(): Promise<void> {
    try {
      await secureStorage.removeItem(this.STORAGE_KEY);
      await secureStorage.removeItem(this.VERSION_KEY);
      console.log('Changelog cleared from secure storage');
    } catch (error) {
      console.error('Failed to clear changelog from secure storage:', error);
    }
  }
  
  private static getDefaultChangelog(): ChangelogEntry[] {
    return [
      {
        version: '2.10.1',
        date: '2025-01-15',
        type: 'patch' as const,
        changes: [
          { type: 'fix' as const, description: 'Security Enhancement - Fixed admin privilege escalation vulnerability by removing fallback database queries' },
          { type: 'improvement' as const, description: 'Secure Storage Migration - Migrated all localStorage usage to encrypted secure storage for better XSS protection' },
          { type: 'feature' as const, description: 'Security Audit System - Implemented comprehensive security event logging with database persistence' },
          { type: 'improvement' as const, description: 'Enhanced Security Monitoring - Added real-time security metrics and threat detection' },
          { type: 'fix' as const, description: 'CSRF Protection - Added CSRF token generation and validation for sensitive operations' },
          { type: 'improvement' as const, description: 'Input Validation - Enhanced content sanitization and validation across all user inputs' },
        ],
      },
      {
        version: '2.10.0',
        date: '2024-12-25',
        type: 'major' as const,
        changes: [
          { type: 'feature' as const, description: 'New Story Mode - Added a new story mode with enhanced AI' },
          { type: 'improvement' as const, description: 'Improved UI - Revamped the user interface for better usability' },
          { type: 'fix' as const, description: 'Bug Fixes - Fixed several bugs reported by users' },
        ],
      },
      {
        version: '2.9.0',
        date: '2024-12-01',
        type: 'minor' as const,
        changes: [
          { type: 'feature' as const, description: 'Voice Integration - Integrated voice input for story creation' },
          { type: 'improvement' as const, description: 'Performance Boost - Improved the performance of the AI engine' },
        ],
      },
    ];
  }
}

export { SecureChangelogManager };
export type { ChangelogEntry };
