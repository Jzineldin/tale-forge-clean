/**
 * Cookie Management Utility
 * Provides secure cookie handling with proper security flags and user privacy controls
 */

export interface CookieOptions {
  maxAge?: number; // in seconds
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export class CookieManager {
  private static readonly CONSENT_COOKIE = 'taleforge_cookie_consent';
  private static readonly PREFERENCES_COOKIE = 'taleforge_cookie_preferences';
  
  // Default security settings
  private static readonly DEFAULT_OPTIONS: CookieOptions = {
    path: '/',
    secure: window.location.protocol === 'https:',
    sameSite: 'strict',
    maxAge: 86400 // 24 hours default
  };

  /**
   * Set a cookie with security best practices
   */
  static setCookie(name: string, value: string, options: CookieOptions = {}): void {
    const finalOptions = { ...this.DEFAULT_OPTIONS, ...options };
    
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    if (finalOptions.maxAge) {
      cookieString += `; max-age=${finalOptions.maxAge}`;
    }
    
    if (finalOptions.expires) {
      cookieString += `; expires=${finalOptions.expires.toUTCString()}`;
    }
    
    if (finalOptions.path) {
      cookieString += `; path=${finalOptions.path}`;
    }
    
    if (finalOptions.domain) {
      cookieString += `; domain=${finalOptions.domain}`;
    }
    
    if (finalOptions.secure) {
      cookieString += '; secure';
    }
    
    if (finalOptions.httpOnly) {
      cookieString += '; httponly';
    }
    
    if (finalOptions.sameSite) {
      cookieString += `; samesite=${finalOptions.sameSite}`;
    }
    
    document.cookie = cookieString;
    console.log(`🍪 Cookie set: ${name}`);
  }

  /**
   * Get a cookie value
   */
  static getCookie(name: string): string | null {
    const encodedName = encodeURIComponent(name);
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === encodedName) {
        return decodeURIComponent(cookieValue);
      }
    }
    
    return null;
  }

  /**
   * Delete a cookie
   */
  static deleteCookie(name: string, path: string = '/'): void {
    this.setCookie(name, '', {
      path,
      maxAge: -1,
      expires: new Date(0)
    });
    console.log(`🗑️ Cookie deleted: ${name}`);
  }

  /**
   * Check if cookies are enabled
   */
  static areCookiesEnabled(): boolean {
    try {
      const testCookie = 'taleforge_test_cookie';
      this.setCookie(testCookie, 'test', { maxAge: 1 });
      const isEnabled = this.getCookie(testCookie) === 'test';
      this.deleteCookie(testCookie);
      return isEnabled;
    } catch (error) {
      console.error('Error checking cookie support:', error);
      return false;
    }
  }

  /**
   * Get user's cookie preferences
   */
  static getCookiePreferences(): CookiePreferences {
    const preferences = this.getCookie(this.PREFERENCES_COOKIE);
    
    if (preferences) {
      try {
        return JSON.parse(preferences);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
      }
    }
    
    // Default preferences - only essential cookies
    return {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false
    };
  }

  /**
   * Set user's cookie preferences
   */
  static setCookiePreferences(preferences: CookiePreferences): void {
    this.setCookie(this.PREFERENCES_COOKIE, JSON.stringify(preferences), {
      maxAge: 31536000, // 1 year
      secure: true,
      sameSite: 'strict'
    });
    
    // Clean up cookies based on preferences
    this.enforcePreferences(preferences);
  }

  /**
   * Check if user has given consent for cookies
   */
  static hasConsent(): boolean {
    return this.getCookie(this.CONSENT_COOKIE) === 'true';
  }

  /**
   * Set cookie consent
   */
  static setConsent(consent: boolean): void {
    this.setCookie(this.CONSENT_COOKIE, consent.toString(), {
      maxAge: 31536000, // 1 year
      secure: true,
      sameSite: 'strict'
    });
  }

  /**
   * Enforce cookie preferences by removing unauthorized cookies
   */
  private static enforcePreferences(preferences: CookiePreferences): void {
    const allCookies = document.cookie.split(';');
    
    for (let cookie of allCookies) {
      const cookieName = cookie.trim().split('=')[0];
      const decodedName = decodeURIComponent(cookieName);
      
      // Skip essential cookies
      if (this.isEssentialCookie(decodedName)) {
        continue;
      }
      
      // Remove cookies based on preferences
      if (
        (!preferences.functional && this.isFunctionalCookie(decodedName)) ||
        (!preferences.analytics && this.isAnalyticsCookie(decodedName)) ||
        (!preferences.marketing && this.isMarketingCookie(decodedName))
      ) {
        this.deleteCookie(decodedName);
      }
    }
  }

  /**
   * Check if a cookie is essential
   */
  private static isEssentialCookie(name: string): boolean {
    const essentialCookies = [
      'taleforge_cookie_consent',
      'taleforge_cookie_preferences',
      'taleforge_auth_token',
      'taleforge_session_id'
    ];
    
    return essentialCookies.some(essential => name.startsWith(essential));
  }

  /**
   * Check if a cookie is functional
   */
  private static isFunctionalCookie(name: string): boolean {
    const functionalCookies = [
      'taleforge_theme',
      'taleforge_remember_me',
      'taleforge_user_preferences',
      'taleforge_story_settings',
      'sidebar:state'
    ];
    
    return functionalCookies.some(functional => name.startsWith(functional));
  }

  /**
   * Check if a cookie is for analytics
   */
  private static isAnalyticsCookie(name: string): boolean {
    const analyticsCookies = [
      '_ga',
      '_gid',
      '_gat',
      'taleforge_analytics'
    ];
    
    return analyticsCookies.some(analytics => name.startsWith(analytics));
  }

  /**
   * Check if a cookie is for marketing
   */
  private static isMarketingCookie(name: string): boolean {
    const marketingCookies = [
      '_fbp',
      '_fbc',
      'taleforge_marketing'
    ];
    
    return marketingCookies.some(marketing => name.startsWith(marketing));
  }

  /**
   * Get all cookies (for debugging)
   */
  static getAllCookies(): Record<string, string> {
    const cookies: Record<string, string> = {};
    const cookieArray = document.cookie.split(';');
    
    for (let cookie of cookieArray) {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }
    
    return cookies;
  }
}

// Convenience functions for common cookie operations
export const cookieUtils = {
  // Theme management
  setTheme: (theme: 'light' | 'dark' | 'auto') => {
    const preferences = CookieManager.getCookiePreferences();
    if (preferences.functional) {
      CookieManager.setCookie('taleforge_theme', theme, {
        maxAge: 31536000, // 1 year
        secure: true,
        sameSite: 'strict'
      });
    }
  },

  getTheme: (): 'light' | 'dark' | 'auto' | null => {
    const preferences = CookieManager.getCookiePreferences();
    if (preferences.functional) {
      return CookieManager.getCookie('taleforge_theme') as 'light' | 'dark' | 'auto' | null;
    }
    return null;
  },

  // Remember me functionality
  setRememberMe: (remember: boolean) => {
    const preferences = CookieManager.getCookiePreferences();
    if (preferences.functional) {
      CookieManager.setCookie('taleforge_remember_me', remember.toString(), {
        maxAge: remember ? 2592000 : 0, // 30 days if true, session if false
        secure: true,
        sameSite: 'strict'
      });
    }
  },

  getRememberMe: (): boolean => {
    const preferences = CookieManager.getCookiePreferences();
    if (preferences.functional) {
      return CookieManager.getCookie('taleforge_remember_me') === 'true';
    }
    return false;
  },

  // User preferences
  setUserPreferences: (preferences: Record<string, any>) => {
    const cookiePrefs = CookieManager.getCookiePreferences();
    if (cookiePrefs.functional) {
      CookieManager.setCookie('taleforge_user_preferences', JSON.stringify(preferences), {
        maxAge: 31536000, // 1 year
        secure: true,
        sameSite: 'strict'
      });
    }
  },

  getUserPreferences: (): Record<string, any> | null => {
    const cookiePrefs = CookieManager.getCookiePreferences();
    if (cookiePrefs.functional) {
      const prefs = CookieManager.getCookie('taleforge_user_preferences');
      if (prefs) {
        try {
          return JSON.parse(prefs);
        } catch (error) {
          console.error('Error parsing user preferences:', error);
        }
      }
    }
    return null;
  },

  // Story creation preferences
  setStoryPreferences: (preferences: Record<string, any>) => {
    const cookiePrefs = CookieManager.getCookiePreferences();
    if (cookiePrefs.functional) {
      CookieManager.setCookie('taleforge_story_settings', JSON.stringify(preferences), {
        maxAge: 86400 * 7, // 1 week
        secure: true,
        sameSite: 'strict'
      });
    }
  },

  getStoryPreferences: (): Record<string, any> | null => {
    const cookiePrefs = CookieManager.getCookiePreferences();
    if (cookiePrefs.functional) {
      const prefs = CookieManager.getCookie('taleforge_story_settings');
      if (prefs) {
        try {
          return JSON.parse(prefs);
        } catch (error) {
          console.error('Error parsing story preferences:', error);
        }
      }
    }
    return null;
  }
};

export default CookieManager;