/**
 * Network status monitoring service
 * 
 * This module provides utilities for monitoring the network status
 * and triggering actions when the connection state changes.
 */

// Network status types
export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  CHECKING = 'checking'
}

// Network event types
export enum NetworkEventType {
  STATUS_CHANGE = 'status_change',
  RECONNECTED = 'reconnected'
}

// Interface for network event handlers
export interface NetworkEventHandler {
  (status: NetworkStatus, eventType: NetworkEventType): void;
}

// Configuration options for network monitoring
export interface NetworkMonitorOptions {
  // URL to ping for checking actual connectivity (default: Supabase health check)
  heartbeatUrl?: string;
  // Interval for heartbeat checks in milliseconds (default: 30 seconds)
  heartbeatInterval?: number;
  // Timeout for heartbeat requests in milliseconds (default: 5 seconds)
  heartbeatTimeout?: number;
  // Whether to use navigator.onLine as a fallback (default: true)
  useNavigatorOnline?: boolean;
}

// Default options
const DEFAULT_OPTIONS: NetworkMonitorOptions = {
  heartbeatUrl: '/api/health-check',
  heartbeatInterval: 30000, // 30 seconds
  heartbeatTimeout: 5000, // 5 seconds
  useNavigatorOnline: true
};

// Class for monitoring network status
export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private options: NetworkMonitorOptions;
  private handlers: NetworkEventHandler[] = [];
  private currentStatus: NetworkStatus = NetworkStatus.CHECKING;
  // private _previousStatus: NetworkStatus = NetworkStatus.CHECKING;
  private heartbeatInterval: number | null = null;
  private isInitialized: boolean = false;
  private reconnectTime: number | null = null;

  private constructor(options: NetworkMonitorOptions = DEFAULT_OPTIONS) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Get the singleton instance of NetworkMonitor
   */
  public static getInstance(options?: NetworkMonitorOptions): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor(options);
    } else if (options) {
      // Update options if provided
      NetworkMonitor.instance.options = { ...NetworkMonitor.instance.options, ...options };
    }
    return NetworkMonitor.instance;
  }

  /**
   * Initialize network monitoring
   */
  public async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Add event listeners for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Start heartbeat checks
    this.startHeartbeatChecks();

    // Initial status check
    await this.checkNetworkStatus();

    this.isInitialized = true;
    console.log('Network monitoring initialized');
  }

  /**
   * Clean up event listeners
   */
  public cleanup(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);

    if (this.heartbeatInterval !== null) {
      window.clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.isInitialized = false;
    console.log('Network monitoring cleaned up');
  }

  /**
   * Register a handler for network events
   */
  public registerHandler(handler: NetworkEventHandler): void {
    this.handlers.push(handler);
  }

  /**
   * Unregister a handler
   */
  public unregisterHandler(handler: NetworkEventHandler): void {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  /**
   * Get the current network status
   */
  public getStatus(): NetworkStatus {
    return this.currentStatus;
  }

  /**
   * Check if currently online
   */
  public isOnline(): boolean {
    return this.currentStatus === NetworkStatus.ONLINE;
  }

  /**
   * Start heartbeat checks
   */
  private startHeartbeatChecks(): void {
    if (this.heartbeatInterval !== null) {
      window.clearInterval(this.heartbeatInterval);
    }

    if (this.options.heartbeatInterval) {
      this.heartbeatInterval = window.setInterval(() => {
        this.checkNetworkStatus();
      }, this.options.heartbeatInterval);

      console.log(`Heartbeat checks started (interval: ${this.options.heartbeatInterval}ms)`);
    }
  }

  /**
   * Handle online event
   */
  private handleOnline = (): void => {
    console.log('Browser reported online status');
    
    // Don't immediately trust the browser's online event
    // Instead, verify with a heartbeat check
    this.checkNetworkStatus();
  };

  /**
   * Handle offline event
   */
  private handleOffline = (): void => {
    console.log('Browser reported offline status');
    this.updateStatus(NetworkStatus.OFFLINE);
  };

  /**
   * Check network status with a heartbeat request
   */
  private async checkNetworkStatus(): Promise<void> {
    // First check navigator.onLine as a quick check
    if (this.options.useNavigatorOnline && navigator.onLine === false) {
      this.updateStatus(NetworkStatus.OFFLINE);
      return;
    }

    // Set status to checking during the heartbeat
    // this._previousStatus = this.currentStatus;
    this.currentStatus = NetworkStatus.CHECKING;

    try {
      // Use a heartbeat request to check actual connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.options.heartbeatTimeout);

      const response = await fetch(this.options.heartbeatUrl!, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.updateStatus(NetworkStatus.ONLINE);
      } else {
        this.updateStatus(NetworkStatus.OFFLINE);
      }
    } catch (error) {
      console.error('Heartbeat check failed:', error);
      this.updateStatus(NetworkStatus.OFFLINE);
    }
  }

  /**
   * Update the network status and notify handlers
   */
  private updateStatus(newStatus: NetworkStatus): void {
    // Skip if status hasn't changed
    if (newStatus === this.currentStatus) {
      return;
    }

    const oldStatus = this.currentStatus;
    // this._previousStatus = oldStatus;
    this.currentStatus = newStatus;

    console.log(`Network status changed: ${oldStatus} -> ${newStatus}`);

    // Determine event type
    let eventType = NetworkEventType.STATUS_CHANGE;

    // Check if this is a reconnection event (offline -> online)
    if (oldStatus === NetworkStatus.OFFLINE && newStatus === NetworkStatus.ONLINE) {
      eventType = NetworkEventType.RECONNECTED;
      this.reconnectTime = Date.now();
    }

    // Notify all handlers
    this.notifyHandlers(eventType);
  }

  /**
   * Notify all registered handlers of a status change
   */
  private notifyHandlers(eventType: NetworkEventType): void {
    this.handlers.forEach(handler => {
      try {
        handler(this.currentStatus, eventType);
      } catch (error) {
        console.error('Error in network event handler:', error);
      }
    });
  }

  /**
   * Get time since last reconnection in milliseconds
   */
  public getTimeSinceReconnect(): number | null {
    if (this.reconnectTime === null) {
      return null;
    }
    return Date.now() - this.reconnectTime;
  }

  /**
   * Force a network status check
   */
  public async forceCheck(): Promise<NetworkStatus> {
    await this.checkNetworkStatus();
    return this.currentStatus;
  }
}

/**
 * Hook for using network monitoring in components
 */
export const useNetworkMonitor = (options?: NetworkMonitorOptions) => {
  const networkMonitor = NetworkMonitor.getInstance(options);

  const init = async () => {
    await networkMonitor.init();
  };

  const cleanup = () => {
    networkMonitor.cleanup();
  };

  const registerHandler = (handler: NetworkEventHandler) => {
    networkMonitor.registerHandler(handler);
  };

  const unregisterHandler = (handler: NetworkEventHandler) => {
    networkMonitor.unregisterHandler(handler);
  };

  const getStatus = () => {
    return networkMonitor.getStatus();
  };

  const isOnline = () => {
    return networkMonitor.isOnline();
  };

  const forceCheck = async () => {
    return await networkMonitor.forceCheck();
  };

  return {
    init,
    cleanup,
    registerHandler,
    unregisterHandler,
    getStatus,
    isOnline,
    forceCheck
  };
};