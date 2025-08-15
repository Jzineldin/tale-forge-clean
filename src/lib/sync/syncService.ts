/**
 * Synchronization service with conflict resolution
 * 
 * This module provides utilities for synchronizing data between
 * the local IndexedDB and the Supabase database when the user is online,
 * and handling any conflicts that may arise.
 */

import { supabase } from '@/integrations/supabase/client';
import { NetworkStatus, NetworkEventType, NetworkMonitor } from '@/lib/network/networkMonitor';
import { 
  OfflineStory, 
  OfflineStorySegment,
  OperationType,
  getUnsyncedStories,
  getUnsyncedStorySegments,
  updateStory,
  updateStorySegment,
  getStory,
  getStorySegment
} from '@/lib/storage/indexedDB';
import {
  OperationQueueItem,
  // OperationStatus,
  OperationQueue
} from '@/lib/storage/operationQueue';
// import { Story, StorySegmentRow } from '@/types/stories';

// Valid Supabase table names
type ValidTableName = 'stories' | 'story_segments';

// Conflict resolution strategies
export enum ConflictStrategy {
  SERVER_WINS = 'server_wins',
  CLIENT_WINS = 'client_wins',
  TIMESTAMP_BASED = 'timestamp_based',
  MANUAL_RESOLUTION = 'manual_resolution'
}

// Sync event types
export enum SyncEventType {
  SYNC_STARTED = 'sync_started',
  SYNC_COMPLETED = 'sync_completed',
  SYNC_FAILED = 'sync_failed',
  CONFLICT_DETECTED = 'conflict_detected',
  CONFLICT_RESOLVED = 'conflict_resolved'
}

// Interface for sync event handlers
export interface SyncEventHandler {
  (eventType: SyncEventType, data?: any): void;
}

// Interface for conflict resolution handlers
export interface ConflictResolutionHandler {
  (serverData: any, clientData: any, recordType: string, recordId: string): Promise<any>;
}

// Configuration options for sync service
export interface SyncServiceOptions {
  // Default conflict resolution strategy
  defaultConflictStrategy?: ConflictStrategy;
  // Whether to automatically sync when coming online
  autoSyncOnReconnect?: boolean;
  // Delay before auto-sync after reconnection in milliseconds
  reconnectSyncDelay?: number;
  // Maximum number of records to sync in a single batch
  maxBatchSize?: number;
}

// Default options
const DEFAULT_OPTIONS: SyncServiceOptions = {
  defaultConflictStrategy: ConflictStrategy.TIMESTAMP_BASED,
  autoSyncOnReconnect: true,
  reconnectSyncDelay: 2000, // 2 seconds
  maxBatchSize: 50
};

// Sync result interface
export interface SyncResult {
  success: boolean;
  syncedStories: number;
  syncedSegments: number;
  conflicts: number;
  errors: Error[];
}

// Class for managing synchronization
export class SyncService {
  private static instance: SyncService;
  private options: SyncServiceOptions;
  private handlers: SyncEventHandler[] = [];
  private conflictHandlers: Map<string, ConflictResolutionHandler> = new Map();
  private isSyncing: boolean = false;
  private lastSyncTime: number | null = null;
  private networkMonitor = NetworkMonitor.getInstance();
  private operationQueue = OperationQueue.getInstance();

  private constructor(options: SyncServiceOptions = DEFAULT_OPTIONS) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Get the singleton instance of SyncService
   */
  public static getInstance(options?: SyncServiceOptions): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService(options);
    } else if (options) {
      // Update options if provided
      SyncService.instance.options = { ...SyncService.instance.options, ...options };
    }
    return SyncService.instance;
  }

  /**
   * Initialize sync service
   */
  public async init(): Promise<void> {
    // Set up operation executor
    this.operationQueue.setExecutor(this.executeOperation.bind(this));

    // Register network event handler
    this.networkMonitor.registerHandler(this.handleNetworkEvent.bind(this));
    await this.networkMonitor.init();

    console.log('Sync service initialized');
  }

  /**
   * Clean up event listeners
   */
  public cleanup(): void {
    this.networkMonitor.cleanup();
    console.log('Sync service cleaned up');
  }

  /**
   * Register a handler for sync events
   */
  public registerHandler(handler: SyncEventHandler): void {
    this.handlers.push(handler);
  }

  /**
   * Unregister a handler
   */
  public unregisterHandler(handler: SyncEventHandler): void {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  /**
   * Register a conflict resolution handler for a specific record type
   */
  public registerConflictHandler(recordType: string, handler: ConflictResolutionHandler): void {
    this.conflictHandlers.set(recordType, handler);
  }

  /**
   * Handle network events
   */
  private handleNetworkEvent(_status: NetworkStatus, eventType: NetworkEventType): void {
    if (eventType === NetworkEventType.RECONNECTED && this.options.autoSyncOnReconnect) {
      console.log(`Network reconnected, scheduling sync in ${this.options.reconnectSyncDelay}ms`);
      
      // Schedule sync after delay
      setTimeout(() => {
        this.syncAll().catch(error => {
          console.error('Error during auto-sync:', error);
        });
      }, this.options.reconnectSyncDelay);
    }
  }

  /**
   * Execute a queued operation
   */
  private async executeOperation(operation: OperationQueueItem): Promise<void> {
    console.log(`Executing operation: ${operation.id} (${operation.operationType} on ${operation.targetTable})`);

    // Check if we're online
    if (!this.networkMonitor.isOnline()) {
      throw new Error('Cannot execute operation while offline');
    }

    // Validate table name
    if (operation.targetTable !== 'stories' && operation.targetTable !== 'story_segments') {
      throw new Error(`Invalid table name: ${operation.targetTable}`);
    }

    const table = operation.targetTable as ValidTableName;

    try {
      switch (operation.operationType) {
        case OperationType.INSERT:
          await this.executeInsertOperation(operation, table);
          break;
        case OperationType.UPDATE:
          await this.executeUpdateOperation(operation, table);
          break;
        case OperationType.DELETE:
          await this.executeDeleteOperation(operation, table);
          break;
        default:
          throw new Error(`Unknown operation type: ${operation.operationType}`);
      }
    } catch (error) {
      console.error(`Error executing operation ${operation.id}:`, error);
      throw error;
    }
  }

  /**
   * Execute an insert operation
   */
  private async executeInsertOperation(operation: OperationQueueItem, table: ValidTableName): Promise<void> {
    const { payload } = operation;

    const { error } = await supabase
      .from(table)
      .insert(payload);

    if (error) {
      throw error;
    }

    // Mark record as synced in IndexedDB
    if (table === 'stories') {
      const story = await getStory(payload.id);
      if (story) {
        await updateStory({
          ...story,
          is_synced: true
        });
      }
    } else if (table === 'story_segments') {
      const segment = await getStorySegment(payload.id);
      if (segment) {
        await updateStorySegment({
          ...segment,
          is_synced: true
        });
      }
    }
  }

  /**
   * Execute an update operation
   */
  private async executeUpdateOperation(operation: OperationQueueItem, table: ValidTableName): Promise<void> {
    const { recordId, payload } = operation;

    // Check for conflicts
    const { data: serverData, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('id', recordId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // If record exists on server, check for conflicts
    if (serverData) {
      const resolvedData = await this.resolveConflict(
        serverData,
        payload,
        table,
        recordId
      );

      // Update with resolved data
      const { error } = await supabase
        .from(table)
        .update(resolvedData)
        .eq('id', recordId);

      if (error) {
        throw error;
      }
    } else {
      // Record doesn't exist on server, insert instead
      const { error } = await supabase
        .from(table)
        .insert(payload);

      if (error) {
        throw error;
      }
    }

    // Mark record as synced in IndexedDB
    if (table === 'stories') {
      const story = await getStory(recordId);
      if (story) {
        await updateStory({
          ...story,
          is_synced: true
        });
      }
    } else if (table === 'story_segments') {
      const segment = await getStorySegment(recordId);
      if (segment) {
        await updateStorySegment({
          ...segment,
          is_synced: true
        });
      }
    }
  }

  /**
   * Execute a delete operation
   */
  private async executeDeleteOperation(operation: OperationQueueItem, table: ValidTableName): Promise<void> {
    const { recordId } = operation;

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', recordId);

    if (error) {
      throw error;
    }
  }

  /**
   * Resolve a conflict between server and client data
   */
  private async resolveConflict(
    serverData: any,
    clientData: any,
    recordType: string,
    recordId: string
  ): Promise<any> {
    console.log(`Resolving conflict for ${recordType} ${recordId}`);

    // Notify handlers of conflict
    this.notifyHandlers(SyncEventType.CONFLICT_DETECTED, {
      recordType,
      recordId,
      serverData,
      clientData
    });

    // Check if there's a custom handler for this record type
    const customHandler = this.conflictHandlers.get(recordType);
    if (customHandler) {
      const resolvedData = await customHandler(serverData, clientData, recordType, recordId);
      
      // Notify handlers of resolution
      this.notifyHandlers(SyncEventType.CONFLICT_RESOLVED, {
        recordType,
        recordId,
        resolvedData,
        strategy: 'custom'
      });
      
      return resolvedData;
    }

    // Apply default strategy
    let resolvedData: any;
    let strategy = this.options.defaultConflictStrategy;

    switch (strategy) {
      case ConflictStrategy.SERVER_WINS:
        resolvedData = { ...serverData };
        break;
      case ConflictStrategy.CLIENT_WINS:
        resolvedData = { ...clientData };
        break;
      case ConflictStrategy.TIMESTAMP_BASED:
        // Compare timestamps if available
        const serverTime = serverData.updated_at ? new Date(serverData.updated_at).getTime() : 0;
        const clientTime = clientData.updated_at ? new Date(clientData.updated_at).getTime() : 0;
        
        if (clientTime > serverTime) {
          resolvedData = { ...clientData };
        } else {
          resolvedData = { ...serverData };
        }
        break;
      case ConflictStrategy.MANUAL_RESOLUTION:
        // This would typically involve UI interaction, but for now we'll default to client wins
        resolvedData = { ...clientData };
        strategy = ConflictStrategy.CLIENT_WINS;
        break;
      default:
        resolvedData = { ...clientData };
        strategy = ConflictStrategy.CLIENT_WINS;
    }

    // Notify handlers of resolution
    this.notifyHandlers(SyncEventType.CONFLICT_RESOLVED, {
      recordType,
      recordId,
      resolvedData,
      strategy
    });

    return resolvedData;
  }

  /**
   * Notify all registered handlers of a sync event
   */
  private notifyHandlers(eventType: SyncEventType, data?: any): void {
    this.handlers.forEach(handler => {
      try {
        handler(eventType, data);
      } catch (error) {
        console.error('Error in sync event handler:', error);
      }
    });
  }

  /**
   * Synchronize all unsynced data
   */
  public async syncAll(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return {
        success: false,
        syncedStories: 0,
        syncedSegments: 0,
        conflicts: 0,
        errors: [new Error('Sync already in progress')]
      };
    }

    if (!this.networkMonitor.isOnline()) {
      console.log('Cannot sync while offline');
      return {
        success: false,
        syncedStories: 0,
        syncedSegments: 0,
        conflicts: 0,
        errors: [new Error('Cannot sync while offline')]
      };
    }

    this.isSyncing = true;
    this.notifyHandlers(SyncEventType.SYNC_STARTED);

    const result: SyncResult = {
      success: true,
      syncedStories: 0,
      syncedSegments: 0,
      conflicts: 0,
      errors: []
    };

    try {
      // Process any pending operations first
      if (await this.operationQueue.hasPendingOperations()) {
        await this.operationQueue.processQueue();
      }

      // Sync unsynced stories
      const unsyncedStories = await getUnsyncedStories();
      console.log(`Found ${unsyncedStories.length} unsynced stories`);

      for (const story of unsyncedStories) {
        try {
          await this.syncStory(story);
          result.syncedStories++;
        } catch (error) {
          console.error(`Error syncing story ${story.id}:`, error);
          result.errors.push(error as Error);
        }
      }

      // Sync unsynced story segments
      const unsyncedSegments = await getUnsyncedStorySegments();
      console.log(`Found ${unsyncedSegments.length} unsynced story segments`);

      for (const segment of unsyncedSegments) {
        try {
          await this.syncStorySegment(segment);
          result.syncedSegments++;
        } catch (error) {
          console.error(`Error syncing story segment ${segment.id}:`, error);
          result.errors.push(error as Error);
        }
      }

      this.lastSyncTime = Date.now();
      result.success = result.errors.length === 0;
      
      this.notifyHandlers(SyncEventType.SYNC_COMPLETED, result);
    } catch (error) {
      console.error('Error during sync:', error);
      result.success = false;
      result.errors.push(error as Error);
      
      this.notifyHandlers(SyncEventType.SYNC_FAILED, {
        error,
        result
      });
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * Synchronize a single story
   */
  private async syncStory(story: OfflineStory): Promise<void> {
    // Check if story exists on server
    const { data: serverStory, error: fetchError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', story.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (serverStory) {
      // Story exists on server, update it
      const resolvedData = await this.resolveConflict(
        serverStory,
        story,
        'stories',
        story.id
      );

      const { error } = await supabase
        .from('stories')
        .update(resolvedData)
        .eq('id', story.id);

      if (error) {
        throw error;
      }
    } else {
      // Story doesn't exist on server, insert it
      const { error } = await supabase
        .from('stories')
        .insert(story);

      if (error) {
        throw error;
      }
    }

    // Mark story as synced in IndexedDB
    await updateStory({
      ...story,
      is_synced: true
    });
  }

  /**
   * Synchronize a single story segment
   */
  private async syncStorySegment(segment: OfflineStorySegment): Promise<void> {
    // Check if segment exists on server
    const { data: serverSegment, error: fetchError } = await supabase
      .from('story_segments')
      .select('*')
      .eq('id', segment.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (serverSegment) {
      // Segment exists on server, update it
      const resolvedData = await this.resolveConflict(
        serverSegment,
        segment,
        'story_segments',
        segment.id
      );

      const { error } = await supabase
        .from('story_segments')
        .update(resolvedData)
        .eq('id', segment.id);

      if (error) {
        throw error;
      }
    } else {
      // Segment doesn't exist on server, insert it
      const { error } = await supabase
        .from('story_segments')
        .insert(segment);

      if (error) {
        throw error;
      }
    }

    // Mark segment as synced in IndexedDB
    await updateStorySegment({
      ...segment,
      is_synced: true
    });
  }

  /**
   * Get the time of the last successful sync
   */
  public getLastSyncTime(): number | null {
    return this.lastSyncTime;
  }

  /**
   * Check if sync is currently in progress
   */
  public isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}

/**
 * Hook for using sync service in components
 */
export const useSyncService = (options?: SyncServiceOptions) => {
  const syncService = SyncService.getInstance(options);

  const init = async () => {
    await syncService.init();
  };

  const cleanup = () => {
    syncService.cleanup();
  };

  const registerHandler = (handler: SyncEventHandler) => {
    syncService.registerHandler(handler);
  };

  const unregisterHandler = (handler: SyncEventHandler) => {
    syncService.unregisterHandler(handler);
  };

  const registerConflictHandler = (recordType: string, handler: ConflictResolutionHandler) => {
    syncService.registerConflictHandler(recordType, handler);
  };

  const syncAll = async (): Promise<SyncResult> => {
    return await syncService.syncAll();
  };

  const getLastSyncTime = (): number | null => {
    return syncService.getLastSyncTime();
  };

  const isSyncInProgress = (): boolean => {
    return syncService.isSyncInProgress();
  };

  return {
    init,
    cleanup,
    registerHandler,
    unregisterHandler,
    registerConflictHandler,
    syncAll,
    getLastSyncTime,
    isSyncInProgress
  };
};