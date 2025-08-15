/**
 * Mobile Optimization Integration Hook (Basic Implementation)
 * Provides essential mobile optimization features without external dependencies
 */

import { useEffect, useState, useCallback } from 'react';

export interface MobileOptimizationState {
  // Performance metrics
  performance: {
    fps: number;
    memoryUsage: number;
    batteryLevel: number;
    connectionType: string;
    isLowPowerMode: boolean;
  };
  
  // Network status
  network: {
    isOnline: boolean;
    shouldReduceQuality: boolean;
    effectiveType: string;
    downlink: number;
  };
  
  // Cache management
  cache: {
    size: number;
    limit: number;
    usagePercentage: number;
    shouldClearCache: boolean;
  };
  
  // Accessibility settings
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    touchAccommodation: boolean;
    optimalTouchTargetSize: number;
  };
  
  // PWA features
  pwa: {
    isInstallable: boolean;
    isInstalled: boolean;
    hasNotificationPermission: boolean;
    offlineStoriesCount: number;
  };
  
  // Loading strategy
  loading: {
    strategy: 'aggressive' | 'conservative' | 'minimal';
    shouldPreloadAssets: boolean;
    maxConcurrentRequests: number;
  };
}

export interface MobileOptimizationActions {
  clearCache: () => Promise<void>;
  syncOfflineStories: () => Promise<void>;
  optimizeForBattery: () => void;
  installApp: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<boolean>;
  preloadVoices: (voiceIds: string[]) => void;
  clearVoiceCache: () => void;
  adjustForAccessibility: () => void;
}

export const useMobileOptimization = (): [MobileOptimizationState, MobileOptimizationActions] => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pwaState, setPwaState] = useState({
    isInstallable: false,
    isInstalled: false,
    hasNotificationPermission: false,
    offlineStoriesCount: 0,
  });

  // Basic network monitoring
  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Check PWA state
  useEffect(() => {
    const checkPWAState = () => {
      try {
        const isInstalled = (window.navigator as any).standalone || 
                           window.matchMedia('(display-mode: standalone)').matches;
        const hasNotificationPermission = 'Notification' in window && 
                                        Notification.permission === 'granted';
        
        setPwaState(prev => ({
          ...prev,
          isInstalled,
          hasNotificationPermission,
        }));
      } catch (error) {
        console.warn('PWA state check failed:', error);
      }
    };

    checkPWAState();
  }, []);

  // Basic performance metrics
  const getBasicMetrics = useCallback(() => {
    const connection = (navigator as any).connection;
    return {
      fps: 60, // Default assumption
      memoryUsage: 0,
      batteryLevel: 1,
      connectionType: connection?.effectiveType || 'unknown',
      isLowPowerMode: false,
    };
  }, []);

  // Basic accessibility detection
  const getAccessibilitySettings = useCallback(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    return {
      reducedMotion,
      highContrast,
      touchAccommodation: 'ontouchstart' in window,
      optimalTouchTargetSize: 44, // iOS guideline
    };
  }, []);

  // Consolidated state
  const state: MobileOptimizationState = {
    performance: getBasicMetrics(),
    network: {
      isOnline,
      shouldReduceQuality: !isOnline || (navigator as any).connection?.saveData,
      effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
      downlink: (navigator as any).connection?.downlink || 0,
    },
    cache: {
      size: 0,
      limit: 50 * 1024 * 1024, // 50MB default
      usagePercentage: 0,
      shouldClearCache: false,
    },
    accessibility: getAccessibilitySettings(),
    pwa: pwaState,
    loading: {
      strategy: isOnline ? 'aggressive' : 'conservative',
      shouldPreloadAssets: isOnline,
      maxConcurrentRequests: isOnline ? 6 : 2,
    },
  };

  // Actions
  const actions: MobileOptimizationActions = {
    clearCache: useCallback(async () => {
      try {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
      } catch (error) {
        console.warn('Cache clear failed:', error);
      }
    }, []),

    syncOfflineStories: useCallback(async () => {
      // Basic implementation - could be enhanced
      console.log('Offline story sync not implemented in basic version');
    }, []),

    optimizeForBattery: useCallback(() => {
      // Basic battery optimization
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      document.documentElement.classList.add('battery-saver-mode');
    }, []),

    installApp: useCallback(async () => {
      try {
        // Basic PWA install prompt
        const deferredPrompt = (window as any).deferredPrompt;
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          return outcome === 'accepted';
        }
      } catch (error) {
        console.warn('App install failed:', error);
      }
      return false;
    }, []),

    requestNotificationPermission: useCallback(async () => {
      try {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          const hasPermission = permission === 'granted';
          setPwaState(prev => ({ ...prev, hasNotificationPermission: hasPermission }));
          return hasPermission;
        }
      } catch (error) {
        console.warn('Notification permission request failed:', error);
      }
      return false;
    }, []),

    preloadVoices: useCallback((_voiceIds: string[]) => {
      // Basic implementation - could be enhanced
      console.log('Voice preloading not implemented in basic version');
    }, []),

    clearVoiceCache: useCallback(() => {
      // Basic implementation - could be enhanced
      console.log('Voice cache clear not implemented in basic version');
    }, []),

    adjustForAccessibility: useCallback(() => {
      const root = document.documentElement;
      const settings = getAccessibilitySettings();
      
      if (settings.reducedMotion) {
        root.setAttribute('data-reduced-motion', 'true');
      }
      
      if (settings.highContrast) {
        root.setAttribute('data-high-contrast', 'true');
      }
      
      if (settings.touchAccommodation) {
        root.style.setProperty('--touch-target-size', `${settings.optimalTouchTargetSize}px`);
      }
    }, [getAccessibilitySettings]),
  };

  // Auto-optimize on mount
  useEffect(() => {
    actions.adjustForAccessibility();
  }, [actions.adjustForAccessibility]);

  return [state, actions];
};