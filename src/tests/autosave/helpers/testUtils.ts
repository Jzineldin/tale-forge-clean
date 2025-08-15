/**
 * Test utilities for autosave tests
 */

import { indexedDBMock } from '../mocks/indexedDBMock';
import { supabaseMock } from '../mocks/supabaseMock';
import { setupBrowserMocks, windowMock, documentMock } from '../mocks/browserMock';
import { Story, StorySegmentRow } from '@/types/stories';
import { OfflineStory, OfflineStorySegment, OperationType, OperationStatus } from '@/lib/storage/indexedDB';

// Constants for testing
export const TEST_DB_NAME = 'taleforge_test_db';
export const TEST_STORES = {
  STORIES: 'stories',
  STORY_SEGMENTS: 'story_segments',
  OPERATION_QUEUE: 'operation_queue'
};

// Setup function to initialize all mocks
export function setupTestEnvironment(): () => void {
  // Setup browser mocks
  const teardownBrowser = setupBrowserMocks();
  
  // Setup IndexedDB mock
  indexedDBMock.reset();
  indexedDBMock.createDatabase(TEST_DB_NAME, [
    TEST_STORES.STORIES,
    TEST_STORES.STORY_SEGMENTS,
    TEST_STORES.OPERATION_QUEUE
  ]);
  
  // Create indexes
  indexedDBMock.createIndex(TEST_STORES.STORIES, 'user_id');
  indexedDBMock.createIndex(TEST_STORES.STORIES, 'is_completed');
  indexedDBMock.createIndex(TEST_STORES.STORIES, 'is_synced');
  indexedDBMock.createIndex(TEST_STORES.STORIES, 'updated_at');
  
  indexedDBMock.createIndex(TEST_STORES.STORY_SEGMENTS, 'story_id');
  indexedDBMock.createIndex(TEST_STORES.STORY_SEGMENTS, 'is_end');
  indexedDBMock.createIndex(TEST_STORES.STORY_SEGMENTS, 'is_synced');
  indexedDBMock.createIndex(TEST_STORES.STORY_SEGMENTS, 'sequence_number');
  
  indexedDBMock.createIndex(TEST_STORES.OPERATION_QUEUE, 'status');
  indexedDBMock.createIndex(TEST_STORES.OPERATION_QUEUE, 'targetTable');
  indexedDBMock.createIndex(TEST_STORES.OPERATION_QUEUE, 'createdAt');
  
  // Setup Supabase mock
  supabaseMock.reset();
  
  // Connect IndexedDB mock to window mock
  windowMock.setIndexedDB({
    open: (_name: string, _version: number) => {
      return {
        result: indexedDBMock,
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null
      };
    }
  });
  
  // Return teardown function
  return () => {
    teardownBrowser();
    indexedDBMock.reset();
    supabaseMock.reset();
  };
}

// Sample test data
export const createTestStory = (id: string = '1', isCompleted: boolean = false, isSynced: boolean = false): Partial<OfflineStory> => {
  return {
    id,
    title: `Test Story ${id}`,
    user_id: 'test-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_completed: isCompleted,
    is_synced: isSynced,
    // Add minimal required properties
  };
};

export const createTestStorySegment = (
  id: string = '1',
  storyId: string = '1',
  _sequenceNumber: number = 1,
  isEnd: boolean = false,
  isSynced: boolean = false
): Partial<OfflineStorySegment> => {
  // Use type assertion to avoid property name issues
  return {
    id,
    story_id: storyId,
    is_end: isEnd,
    is_synced: isSynced,
  } as Partial<OfflineStorySegment>;
};

export const createTestOperationQueueItem = (
  id: string = '1',
  operationType: OperationType = OperationType.INSERT,
  targetTable: string = TEST_STORES.STORIES,
  recordId: string = '1',
  status: OperationStatus = OperationStatus.PENDING
) => {
  return {
    id,
    operationType,
    targetTable,
    recordId,
    payload: { id: recordId, title: `Test ${targetTable} ${recordId}` },
    createdAt: new Date().toISOString(),
    retryCount: 0,
    status
  };
};

// Helper function to wait for promises to resolve
export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

// Helper function to simulate network status change
export const simulateNetworkStatusChange = (isOnline: boolean) => {
  if (isOnline) {
    windowMock.simulateOnline();
  } else {
    windowMock.simulateOffline();
  }
};

// Helper function to simulate visibility change
export const simulateVisibilityChange = (isHidden: boolean) => {
  documentMock.visibilityState = isHidden ? 'hidden' : 'visible';
  windowMock.simulateVisibilityChange(isHidden);
};

// Helper function to simulate page unload
export const simulatePageUnload = () => {
  windowMock.simulateBeforeUnload();
  windowMock.simulatePageHide();
};

// Helper function to seed IndexedDB with test data
export const seedIndexedDB = (
  stories: Partial<OfflineStory>[] = [],
  segments: Partial<OfflineStorySegment>[] = [],
  operations: any[] = []
) => {
  // Add stories with type assertion
  stories.forEach(story => {
    // Ensure required properties are set
    const fullStory = {
      is_synced: false,
      ...story
    } as OfflineStory;
    
    indexedDBMock.addItem(TEST_STORES.STORIES, fullStory);
  });
  
  // Add segments with type assertion
  segments.forEach(segment => {
    // Ensure required properties are set
    const fullSegment = {
      is_synced: false,
      ...segment
    } as OfflineStorySegment;
    
    indexedDBMock.addItem(TEST_STORES.STORY_SEGMENTS, fullSegment);
  });
  
  // Add operations
  operations.forEach(operation => {
    indexedDBMock.addItem(TEST_STORES.OPERATION_QUEUE, operation);
  });
};

// Helper function to seed Supabase with test data
export const seedSupabase = (
  stories: Partial<Story>[] = [],
  segments: Partial<StorySegmentRow>[] = []
) => {
  // Add stories with type assertion
  const fullStories = stories.map(story => {
    // Ensure required properties are set
    return {
      id: '1',
      user_id: 'test-user',
      created_at: new Date().toISOString(),
      ...story
    } as Story;
  });
  
  // Add segments with type assertion
  const fullSegments = segments.map(segment => {
    // Ensure required properties are set
    return {
      id: '1',
      story_id: 'test-story',
      ...segment
    } as StorySegmentRow;
  });
  
  supabaseMock.seedTable('stories', fullStories);
  supabaseMock.seedTable('story_segments', fullSegments);
};