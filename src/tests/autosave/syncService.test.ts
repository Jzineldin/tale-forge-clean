import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
  asyncMockFn
} from './setup/jest.setup';

import {
  SyncService,
  ConflictStrategy,
  SyncEventType,
  useSyncService
} from '@/lib/sync/syncService';

// import {
//   NetworkStatus,
//   NetworkEventType
// } from '@/lib/network/networkMonitor';

import {
  // OperationType,
  // OperationStatus,
  // OfflineStory,
  // OfflineStorySegment,
  // addStory,
  // updateStory,
  getStory,
  // getUnsyncedStories,
  // addStorySegment,
  // updateStorySegment,
  getStorySegment,
  // getUnsyncedStorySegments
} from '@/lib/storage/indexedDB';

import {
  setupTestEnvironment,
  createTestStory,
  createTestStorySegment,
  // flushPromises,
  simulateNetworkStatusChange,
  seedIndexedDB,
  seedSupabase,
  // TEST_STORES
} from './helpers/testUtils';

// import { indexedDBMock } from './mocks/indexedDBMock';
import { supabaseMock, mockSupabaseClient } from './mocks/supabaseMock';
// import { windowMock } from './mocks/browserMock';

// Mock the supabase client
jest.fn().mockImplementation(() => mockSupabaseClient);

describe('Sync Service Tests', () => {
  // Setup and teardown
  let teardown: () => void;
  
  beforeEach(() => {
    teardown = setupTestEnvironment();
  });
  
  afterEach(() => {
    teardown();
  });
  
  describe('SyncService Class', () => {
    test('should initialize sync service', async () => {
      const syncService = SyncService.getInstance();
      await syncService.init();
      
      // Check that it's initialized
      expect(syncService.isSyncInProgress()).toBe(false);
      expect(syncService.getLastSyncTime()).toBeNull();
    });
    
    test('should register and unregister handlers', async () => {
      const syncService = SyncService.getInstance();
      await syncService.init();
      
      const handlerFn = jest.fn();
      
      syncService.registerHandler(handlerFn);
      
      // Trigger a sync event
      await syncService.syncAll();
      
      // Handler should be called
      expect(handlerFn).toBeCalled();
      
      // Unregister handler
      syncService.unregisterHandler(handlerFn);
      
      // Reset mock
      handlerFn.mockClear();
      
      // Trigger sync event again
      await syncService.syncAll();
      
      // Handler should not be called
      expect(handlerFn).not.toBeCalled();
    });
    
    test('should register conflict handlers', async () => {
      const syncService = SyncService.getInstance();
      await syncService.init();
      
      // Register a conflict handler for stories
      const conflictHandler = asyncMockFn();
      syncService.registerConflictHandler('stories', conflictHandler);
      
      // Seed data with conflicts
      const localStory = createTestStory('1', false, false);
      const serverStory = { ...createTestStory('1', true, true), title: 'Server Title' };
      
      seedIndexedDB([localStory], [], []);
      seedSupabase([serverStory], []);
      
      // Sync
      await syncService.syncAll();
      
      // Conflict handler should be called
      expect(conflictHandler).toBeCalled();
    });
  });
  
  describe('Synchronization', () => {
    test('should sync unsynced stories', async () => {
      const syncService = SyncService.getInstance();
      await syncService.init();
      
      // Add unsynced stories to IndexedDB
      const story1 = createTestStory('1', false, false);
      const story2 = createTestStory('2', true, false);
      
      seedIndexedDB([story1, story2], [], []);
      
      // Sync
      const result = await syncService.syncAll();
      
      // Check result
      expect(result.success).toBe(true);
      expect(result.syncedStories).toBe(2);
      expect(result.syncedSegments).toBe(0);
      expect(result.conflicts).toBe(0);
      
      // Check that stories were added to Supabase
      const supabaseStories = supabaseMock.getTableData('stories');
      expect(supabaseStories).toHaveLength(2);
      
      // Check that stories were marked as synced in IndexedDB
      const story1After = await getStory('1');
      const story2After = await getStory('2');
      
      expect(story1After?.is_synced).toBe(true);
      expect(story2After?.is_synced).toBe(true);
    });
    
    test('should sync unsynced story segments', async () => {
      const syncService = SyncService.getInstance();
      await syncService.init();
      
      // Add unsynced story segments to IndexedDB
      const segment1 = createTestStorySegment('1', 'story1', 1, false, false);
      const segment2 = createTestStorySegment('2', 'story1', 2, true, false);
      
      seedIndexedDB([], [segment1, segment2], []);
      
      // Sync
      const result = await syncService.syncAll();
      
      // Check result
      expect(result.success).toBe(true);
      expect(result.syncedStories).toBe(0);
      expect(result.syncedSegments).toBe(2);
      expect(result.conflicts).toBe(0);
      
      // Check that segments were added to Supabase
      const supabaseSegments = supabaseMock.getTableData('story_segments');
      expect(supabaseSegments).toHaveLength(2);
      
      // Check that segments were marked as synced in IndexedDB
      const segment1After = await getStorySegment('1');
      const segment2After = await getStorySegment('2');
      
      expect(segment1After?.is_synced).toBe(true);
      expect(segment2After?.is_synced).toBe(true);
    });
    
    test('should handle conflicts with server wins strategy', async () => {
      const syncService = SyncService.getInstance({
        defaultConflictStrategy: ConflictStrategy.SERVER_WINS
      });
      await syncService.init();
      
      // Register a handler to track events
      const handlerFn = jest.fn();
      syncService.registerHandler(handlerFn);
      
      // Seed data with conflicts
      const localStory = { ...createTestStory('1', false, false), title: 'Local Title' };
      const serverStory = { ...createTestStory('1', true, true), title: 'Server Title' };
      
      seedIndexedDB([localStory], [], []);
      seedSupabase([serverStory], []);
      
      // Sync
      const result = await syncService.syncAll();
      
      // Check result
      expect(result.success).toBe(true);
      expect(result.syncedStories).toBe(1);
      
      // Check that conflict events were fired
      expect(handlerFn).toBeCalledWith(SyncEventType.CONFLICT_DETECTED, expect.anything());
      expect(handlerFn).toBeCalledWith(SyncEventType.CONFLICT_RESOLVED, expect.anything());
      
      // Check that server version won
      const supabaseStories = supabaseMock.getTableData('stories');
      expect(supabaseStories[0].title).toBe('Server Title');
      
      // Check that local story was updated with server version
      const storyAfter = await getStory('1');
      expect(storyAfter?.title).toBe('Server Title');
      expect(storyAfter?.is_synced).toBe(true);
    });
    
    test('should handle conflicts with client wins strategy', async () => {
      const syncService = SyncService.getInstance({
        defaultConflictStrategy: ConflictStrategy.CLIENT_WINS
      });
      await syncService.init();
      
      // Register a handler to track events
      const handlerFn = jest.fn();
      syncService.registerHandler(handlerFn);
      
      // Seed data with conflicts
      const localStory = { ...createTestStory('1', false, false), title: 'Local Title' };
      const serverStory = { ...createTestStory('1', true, true), title: 'Server Title' };
      
      seedIndexedDB([localStory], [], []);
      seedSupabase([serverStory], []);
      
      // Sync
      const result = await syncService.syncAll();
      
      // Check result
      expect(result.success).toBe(true);
      expect(result.syncedStories).toBe(1);
      
      // Check that conflict events were fired
      expect(handlerFn).toBeCalledWith(SyncEventType.CONFLICT_DETECTED, expect.anything());
      expect(handlerFn).toBeCalledWith(SyncEventType.CONFLICT_RESOLVED, expect.anything());
      
      // Check that client version won
      const supabaseStories = supabaseMock.getTableData('stories');
      expect(supabaseStories[0].title).toBe('Local Title');
      
      // Check that local story was marked as synced
      const storyAfter = await getStory('1');
      expect(storyAfter?.title).toBe('Local Title');
      expect(storyAfter?.is_synced).toBe(true);
    });
    
    test('should handle conflicts with timestamp-based strategy', async () => {
      const syncService = SyncService.getInstance({
        defaultConflictStrategy: ConflictStrategy.TIMESTAMP_BASED
      });
      await syncService.init();
      
      // Create stories with different timestamps
      const olderTimestamp = new Date(Date.now() - 10000).toISOString();
      const newerTimestamp = new Date().toISOString();
      
      // Local story is newer
      const localStory = { 
        ...createTestStory('1', false, false), 
        title: 'Local Title',
        updated_at: newerTimestamp
      };
      
      // Server story is older
      const serverStory = { 
        ...createTestStory('1', true, true), 
        title: 'Server Title',
        updated_at: olderTimestamp
      };
      
      seedIndexedDB([localStory], [], []);
      seedSupabase([serverStory], []);
      
      // Sync
      const result = await syncService.syncAll();
      
      // Check result
      expect(result.success).toBe(true);
      expect(result.syncedStories).toBe(1);
      
      // Check that newer version (local) won
      const supabaseStories = supabaseMock.getTableData('stories');
      expect(supabaseStories[0].title).toBe('Local Title');
      
      // Check that local story was marked as synced
      const storyAfter = await getStory('1');
      expect(storyAfter?.title).toBe('Local Title');
      expect(storyAfter?.is_synced).toBe(true);
    });
    
    test('should handle custom conflict resolution', async () => {
      const syncService = SyncService.getInstance();
      await syncService.init();
      
      // Register a custom conflict handler that merges titles
      const conflictHandler = jest.fn().mockImplementation(
        async (serverData, clientData) => {
          return {
            ...serverData,
            title: `${clientData.title} + ${serverData.title}`
          };
        }
      );
      
      syncService.registerConflictHandler('stories', conflictHandler);
      
      // Seed data with conflicts
      const localStory = { ...createTestStory('1', false, false), title: 'Local Title' };
      const serverStory = { ...createTestStory('1', true, true), title: 'Server Title' };
      
      seedIndexedDB([localStory], [], []);
      seedSupabase([serverStory], []);
      
      // Sync
      const result = await syncService.syncAll();
      
      // Check result
      expect(result.success).toBe(true);
      expect(result.syncedStories).toBe(1);
      
      // Check that conflict handler was called
      expect(conflictHandler).toBeCalled();
      
      // Check that merged version was used
      const supabaseStories = supabaseMock.getTableData('stories');
      expect(supabaseStories[0].title).toBe('Local Title + Server Title');
      
      // Check that local story was updated with merged version
      const storyAfter = await getStory('1');
      expect(storyAfter?.title).toBe('Local Title + Server Title');
      expect(storyAfter?.is_synced).toBe(true);
    });
  });
  
  describe('Auto-Sync on Reconnect', () => {
    test('should auto-sync when coming back online', async () => {
      const syncService = SyncService.getInstance({
        autoSyncOnReconnect: true,
        reconnectSyncDelay: 100 // Short delay for testing
      });
      await syncService.init();
      
      // Add unsynced stories to IndexedDB
      const story = createTestStory('1', false, false);
      seedIndexedDB([story], [], []);
      
      // Simulate going offline
      simulateNetworkStatusChange(false);
      
      // Simulate coming back online
      simulateNetworkStatusChange(true);
      
      // Wait for reconnect delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Check that story was synced
      const supabaseStories = supabaseMock.getTableData('stories');
      expect(supabaseStories).toHaveLength(1);
      
      // Check that story was marked as synced in IndexedDB
      const storyAfter = await getStory('1');
      expect(storyAfter?.is_synced).toBe(true);
    });
    
    test('should not auto-sync when disabled', async () => {
      const syncService = SyncService.getInstance({
        autoSyncOnReconnect: false
      });
      await syncService.init();
      
      // Add unsynced stories to IndexedDB
      const story = createTestStory('1', false, false);
      seedIndexedDB([story], [], []);
      
      // Simulate going offline
      simulateNetworkStatusChange(false);
      
      // Simulate coming back online
      simulateNetworkStatusChange(true);
      
      // Wait for a moment
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Check that story was not synced
      const supabaseStories = supabaseMock.getTableData('stories');
      expect(supabaseStories).toHaveLength(0);
      
      // Check that story is still unsynced in IndexedDB
      const storyAfter = await getStory('1');
      expect(storyAfter?.is_synced).toBe(false);
    });
  });
  
  describe('useSyncService Hook', () => {
    test('should provide sync service functionality', async () => {
      const {
        init,
        cleanup,
        registerHandler,
        unregisterHandler,
        // registerConflictHandler,
        syncAll,
        getLastSyncTime,
        isSyncInProgress
      } = useSyncService();
      
      // Initialize
      await init();
      
      // Register handler
      const handlerFn = jest.fn();
      registerHandler(handlerFn);
      
      // Add unsynced stories to IndexedDB
      const story = createTestStory('1', false, false);
      seedIndexedDB([story], [], []);
      
      // Sync
      const result = await syncAll();
      
      // Check result
      expect(result.success).toBe(true);
      expect(result.syncedStories).toBe(1);
      
      // Handler should be called
      expect(handlerFn).toBeCalled();
      
      // Check last sync time
      const lastSyncTime = getLastSyncTime();
      expect(lastSyncTime).not.toBeNull();
      
      // Check sync in progress
      const inProgress = isSyncInProgress();
      expect(inProgress).toBe(false);
      
      // Unregister handler
      unregisterHandler(handlerFn);
      
      // Reset mock
      handlerFn.mockClear();
      
      // Sync again
      await syncAll();
      
      // Handler should not be called
      expect(handlerFn).not.toBeCalled();
      
      // Cleanup
      cleanup();
    });
  });
});