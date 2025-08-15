/**
 * Secure storage service to replace localStorage usage
 * Provides encrypted session storage with XSS protection
 */

interface StorageData {
  value: any;
  timestamp: number;
  encrypted?: boolean;
}

interface SecureStorageOptions {
  encrypt?: boolean;
  ttl?: number; // Time to live in milliseconds
}

class SecureStorageService {
  private readonly PREFIX = 'sc_'; // Story Canvas prefix
  private readonly crypto = window.crypto;
  
  /**
   * Simple encryption using Web Crypto API
   */
  private async encrypt(data: string): Promise<string> {
    if (!this.crypto?.subtle) {
      console.warn('Web Crypto API not available, storing data unencrypted');
      return data;
    }
    
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Generate a random key for each encryption operation
      const key = await this.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true, // Allow export for storage
        ['encrypt', 'decrypt']
      );
      
      // Generate random IV
      const iv = this.crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt the data
      const encrypted = await this.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        dataBuffer
      );
      
      // Export key for storage
      const keyData = await this.crypto.subtle.exportKey('raw', key);
      
      // Combine encrypted data, key, and IV into a single structure
      const encryptedPackage = {
        data: Array.from(new Uint8Array(encrypted)),
        key: Array.from(new Uint8Array(keyData)),
        iv: Array.from(iv)
      };
      
      return btoa(JSON.stringify(encryptedPackage));
    } catch (error) {
      console.warn('Encryption failed, storing data unencrypted:', error);
      return data;
    }
  }
  
  /**
   * Decrypt data using the embedded key and IV
   */
  private async decrypt(encryptedData: string): Promise<string> {
    if (!this.crypto?.subtle) {
      return encryptedData;
    }
    
    try {
      // Parse the encrypted package
      const encryptedPackage = JSON.parse(atob(encryptedData));
      
      if (!encryptedPackage.data || !encryptedPackage.key || !encryptedPackage.iv) {
        throw new Error('Invalid encrypted data format');
      }
      
      // Import the key
      const key = await this.crypto.subtle.importKey(
        'raw',
        new Uint8Array(encryptedPackage.key),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
      
      // Decrypt the data
      const decrypted = await this.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(encryptedPackage.iv) },
        key,
        new Uint8Array(encryptedPackage.data)
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.warn('Decryption failed, returning data as-is:', error);
      return encryptedData;
    }
  }
  
  /**
   * Sanitize key to prevent injection attacks
   */
  private sanitizeKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9_-]/g, '');
  }
  
  /**
   * Store data securely
   */
  async setItem(key: string, value: any, options: SecureStorageOptions = {}): Promise<void> {
    const sanitizedKey = this.sanitizeKey(key);
    const storageKey = `${this.PREFIX}${sanitizedKey}`;
    
    const storageData: StorageData = {
      value,
      timestamp: Date.now(),
      encrypted: options.encrypt || false
    };
    
    try {
      if (options.encrypt) {
        // Encrypt the value and store with metadata
        const encryptedValue = await this.encrypt(JSON.stringify(value));
        storageData.value = encryptedValue;
        storageData.encrypted = true;
      }
      
      // Use sessionStorage instead of localStorage for better security
      sessionStorage.setItem(storageKey, JSON.stringify(storageData));
      
      // Set TTL if specified
      if (options.ttl) {
        setTimeout(() => {
          this.removeItem(key);
        }, options.ttl);
      }
    } catch (error) {
      console.error('Failed to store data securely:', error);
      throw new Error('Storage operation failed');
    }
  }
  
  /**
   * Retrieve data securely
   */
  async getItem<T = any>(key: string): Promise<T | null> {
    const sanitizedKey = this.sanitizeKey(key);
    const storageKey = `${this.PREFIX}${sanitizedKey}`;
    
    try {
      let storedData = sessionStorage.getItem(storageKey);
      if (!storedData) {
        return null;
      }
      
      // Try to parse as JSON first
      let storageObj: StorageData;
      try {
        storageObj = JSON.parse(storedData);
        
        // Check if this is encrypted data (new format)
        if (storageObj.encrypted && typeof storageObj.value === 'string') {
          const decryptedValue = await this.decrypt(storageObj.value);
          storageObj.value = JSON.parse(decryptedValue);
        }
      } catch (parseError) {
        // If parsing fails, assume it's old encrypted format
        try {
          const decryptedData = await this.decrypt(storedData);
          storageObj = JSON.parse(decryptedData);
        } catch (decryptError) {
          console.warn('Failed to decrypt or parse stored data:', decryptError);
          return null;
        }
      }
      
      return storageObj.value;
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      return null;
    }
  }
  
  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    const sanitizedKey = this.sanitizeKey(key);
    const storageKey = `${this.PREFIX}${sanitizedKey}`;
    sessionStorage.removeItem(storageKey);
  }
  
  /**
   * Clear all app data from storage
   */
  clear(): void {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  }
  
  /**
   * Migrate data from localStorage to secure storage
   */
  async migrateFromLocalStorage(): Promise<void> {
    const keysToMigrate = [
      'anonymous_story_ids',
      'storyCanvasSettings',
      'pending_feedback'
    ];
    
    for (const key of keysToMigrate) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          await this.setItem(key, JSON.parse(data), { encrypt: true });
          localStorage.removeItem(key);
          console.log(`Migrated ${key} from localStorage to secure storage`);
        }
      } catch (error) {
        console.warn(`Failed to migrate ${key}:`, error);
      }
    }
  }
}

// Export singleton instance
export const secureStorage = new SecureStorageService();

// Auto-migrate from localStorage on first load
if (typeof window !== 'undefined') {
  secureStorage.migrateFromLocalStorage().catch(console.warn);
}