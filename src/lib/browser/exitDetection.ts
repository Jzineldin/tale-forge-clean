/**
 * Browser exit detection system
 * 
 * This module provides utilities for detecting when the user is about to leave the page
 * or close the browser, and triggers emergency saves to ensure no data is lost.
 */

import { AutosaveData } from '@/utils/autosaveUtils';

// Types of exit events we can detect
export enum ExitEventType {
  VISIBILITY_CHANGE = 'visibility_change',
  BEFORE_UNLOAD = 'before_unload',
  PAGE_HIDE = 'page_hide',
  PERIODIC = 'periodic'
}

// Interface for exit event handlers
export interface ExitEventHandler {
  (data: AutosaveData, eventType: ExitEventType): Promise<void>;
}

// Configuration options for exit detection
export interface ExitDetectionOptions {
  // Whether to enable periodic autosave
  enablePeriodicSave: boolean;
  // Interval for periodic autosave in milliseconds (default: 30 seconds)
  periodicSaveInterval?: number;
  // Whether to show confirmation dialog when user tries to leave with unsaved changes
  showConfirmationDialog?: boolean;
  // Custom message for confirmation dialog
  confirmationMessage?: string;
}

// Default options
const DEFAULT_OPTIONS: ExitDetectionOptions = {
  enablePeriodicSave: true,
  periodicSaveInterval: 30000, // 30 seconds
  showConfirmationDialog: false,
  confirmationMessage: 'You have unsaved changes. Are you sure you want to leave?'
};

// Class for managing exit detection
export class ExitDetection {
  private static instance: ExitDetection;
  private options: ExitDetectionOptions;
  private handlers: ExitEventHandler[] = [];
  private currentData: AutosaveData | null = null;
  private hasUnsavedChanges: boolean = false;
  private periodicSaveInterval: number | null = null;
  private isInitialized: boolean = false;

  private constructor(options: ExitDetectionOptions = DEFAULT_OPTIONS) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Get the singleton instance of ExitDetection
   */
  public static getInstance(options?: ExitDetectionOptions): ExitDetection {
    if (!ExitDetection.instance) {
      ExitDetection.instance = new ExitDetection(options);
    } else if (options) {
      // Update options if provided
      ExitDetection.instance.options = { ...ExitDetection.instance.options, ...options };
    }
    return ExitDetection.instance;
  }

  /**
   * Initialize exit detection
   */
  public init(): void {
    if (this.isInitialized) {
      return;
    }

    // Add event listeners for exit detection
    window.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    window.addEventListener('pagehide', this.handlePageHide);

    // Start periodic autosave if enabled
    if (this.options.enablePeriodicSave && this.options.periodicSaveInterval) {
      this.startPeriodicSave();
    }

    this.isInitialized = true;
    console.log('Exit detection initialized');
  }

  /**
   * Clean up event listeners
   */
  public cleanup(): void {
    window.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('pagehide', this.handlePageHide);

    if (this.periodicSaveInterval !== null) {
      window.clearInterval(this.periodicSaveInterval);
      this.periodicSaveInterval = null;
    }

    this.isInitialized = false;
    console.log('Exit detection cleaned up');
  }

  /**
   * Register a handler for exit events
   */
  public registerHandler(handler: ExitEventHandler): void {
    this.handlers.push(handler);
  }

  /**
   * Unregister a handler
   */
  public unregisterHandler(handler: ExitEventHandler): void {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  /**
   * Update the current data to be saved on exit
   */
  public updateCurrentData(data: AutosaveData): void {
    this.currentData = data;
    this.hasUnsavedChanges = true;
  }

  /**
   * Mark changes as saved
   */
  public markChangesSaved(): void {
    this.hasUnsavedChanges = false;
  }

  /**
   * Start periodic autosave
   */
  private startPeriodicSave(): void {
    if (this.periodicSaveInterval !== null) {
      window.clearInterval(this.periodicSaveInterval);
    }

    this.periodicSaveInterval = window.setInterval(() => {
      this.triggerSave(ExitEventType.PERIODIC);
    }, this.options.periodicSaveInterval);

    console.log(`Periodic autosave started (interval: ${this.options.periodicSaveInterval}ms)`);
  }

  /**
   * Handle visibility change event
   */
  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      console.log('Page visibility changed to hidden, triggering save');
      this.triggerSave(ExitEventType.VISIBILITY_CHANGE);
    }
  };

  /**
   * Handle beforeunload event
   */
  private handleBeforeUnload = (event: BeforeUnloadEvent): string | undefined => {
    console.log('Page about to unload, triggering save');
    this.triggerSave(ExitEventType.BEFORE_UNLOAD);

    // Show confirmation dialog if enabled and there are unsaved changes
    if (this.options.showConfirmationDialog && this.hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = this.options.confirmationMessage;
      return this.options.confirmationMessage;
    }
    
    return undefined;
  };

  /**
   * Handle pagehide event
   */
  private handlePageHide = (): void => {
    console.log('Page hidden, triggering save');
    this.triggerSave(ExitEventType.PAGE_HIDE);
  };

  /**
   * Trigger save for all registered handlers
   */
  private triggerSave(eventType: ExitEventType): void {
    if (!this.currentData || !this.hasUnsavedChanges) {
      return;
    }

    console.log(`Triggering save for event type: ${eventType}`);
    
    // Call all handlers with current data
    this.handlers.forEach(handler => {
      try {
        handler(this.currentData!, eventType).catch(error => {
          console.error('Error in exit handler:', error);
        });
      } catch (error) {
        console.error('Error calling exit handler:', error);
      }
    });
  }

  /**
   * Manually trigger a save
   */
  public forceSave(): void {
    if (this.currentData) {
      console.log('Manually triggering save');
      this.triggerSave(ExitEventType.PERIODIC);
    }
  }
}

/**
 * Hook for using exit detection in components
 */
export const useExitDetection = (options?: ExitDetectionOptions) => {
  const exitDetection = ExitDetection.getInstance(options);

  const init = () => {
    exitDetection.init();
  };

  const cleanup = () => {
    exitDetection.cleanup();
  };

  const registerHandler = (handler: ExitEventHandler) => {
    exitDetection.registerHandler(handler);
  };

  const unregisterHandler = (handler: ExitEventHandler) => {
    exitDetection.unregisterHandler(handler);
  };

  const updateCurrentData = (data: AutosaveData) => {
    exitDetection.updateCurrentData(data);
  };

  const markChangesSaved = () => {
    exitDetection.markChangesSaved();
  };

  const forceSave = () => {
    exitDetection.forceSave();
  };

  return {
    init,
    cleanup,
    registerHandler,
    unregisterHandler,
    updateCurrentData,
    markChangesSaved,
    forceSave
  };
};