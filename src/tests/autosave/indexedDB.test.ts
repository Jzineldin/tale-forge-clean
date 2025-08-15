import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest
} from './setup/jest.setup';

import {
  initDatabase,
  addItem,
  updateItem,
  getItem,
  deleteItem,
  getAllItems,
  queryByIndex,
  clearStore,
  // STORES,
  addStory,
  updateStory,
  getStory,
  deleteStory,
  getAllStories,
  getStoriesByUserId,
  getUnsyncedStories,
  addStorySegment,
  updateStorySegment,
  getStorySegment,
  deleteStorySegment,
  getStorySegmentsByStoryId,
  getUnsyncedStorySegments,
  addOperation,
  updateOperation,
  getPendingOperations,
  getFailedOperations,
  deleteOperation,
  OperationType,
  OperationStatus
} from '@/lib/storage/indexedDB';

import {
  setupTestEnvironment,
  createTestStory,
  createTestStorySegment,
  createTestOperationQueueItem,
  TEST_STORES
} from './helpers/testUtils';
import { indexedDBMock } from './mocks/indexedDBMock';

// Mock the global indexedDB
const mockOpenRequest = {
  result: indexedDBMock,
  onsuccess: null as any,
  onerror: null as any,
  onupgradeneeded: null as any
};

// Mock window.indexedDB
Object.defineProperty(window, 'indexedDB', {
  value: {
    open: jest.fn().mockReturnValue(mockOpenRequest)
  }
});

describe('IndexedDB Storage Tests', () => {
  // Setup and teardown
  let teardown: () => void;
  
  beforeEach(() => {
    teardown = setupTestEnvironment();
    
    // Simulate successful database open
    setTimeout(() => {
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
      }
    }, 0);
  });
  
  afterEach(() => {
    teardown();
  });
  
  describe('Generic IndexedDB Operations', () => {
    test('should initialize the database', async () => {
      const db = await initDatabase();
      expect(db).toBeDefined();
    });
    
    test('should add an item to a store', async () => {
      const testItem = { id: '1', name: 'Test Item' };
      const result = await addItem(TEST_STORES.STORIES, testItem);
      
      expect(result).toEqual(testItem);
      
      const items = indexedDBMock.getAllItems(TEST_STORES.STORIES);
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual(testItem);
    });
    
    test('should update an item in a store', async () => {
      const testItem = { id: '1', name: 'Test Item' };
      await addItem(TEST_STORES.STORIES, testItem);
      
      const updatedItem = { id: '1', name: 'Updated Item' };
      const result = await updateItem(TEST_STORES.STORIES, updatedItem);
      
      expect(result).toEqual(updatedItem);
      
      const items = indexedDBMock.getAllItems(TEST_STORES.STORIES);
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual(updatedItem);
    });
    
    test('should get an item from a store by ID', async () => {
      const testItem = { id: '1', name: 'Test Item' };
      await addItem(TEST_STORES.STORIES, testItem);
      
      const result = await getItem(TEST_STORES.STORIES, '1');
      
      expect(result).toEqual(testItem);
    });
    
    test('should return null when getting a non-existent item', async () => {
      const result = await getItem(TEST_STORES.STORIES, 'non-existent');
      
      expect(result).toBeNull();
    });
    
    test('should delete an item from a store', async () => {
      const testItem = { id: '1', name: 'Test Item' };
      await addItem(TEST_STORES.STORIES, testItem);
      
      await deleteItem(TEST_STORES.STORIES, '1');
      
      const items = indexedDBMock.getAllItems(TEST_STORES.STORIES);
      expect(items).toHaveLength(0);
    });
    
    test('should get all items from a store', async () => {
      const testItems = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' }
      ];
      
      for (const item of testItems) {
        await addItem(TEST_STORES.STORIES, item);
      }
      
      const result = await getAllItems(TEST_STORES.STORIES);
      
      expect(result).toHaveLength(3);
      expect(result).toEqual(expect.arrayContaining(testItems));
    });
    
    test('should query items by index', async () => {
      const testItems = [
        { id: '1', category: 'A', name: 'Item 1' },
        { id: '2', category: 'B', name: 'Item 2' },
        { id: '3', category: 'A', name: 'Item 3' }
      ];
      
      for (const item of testItems) {
        await addItem(TEST_STORES.STORIES, item);
      }
      
      // Create index
      indexedDBMock.createIndex(TEST_STORES.STORIES, 'category');
      
      const result = await queryByIndex(TEST_STORES.STORIES, 'category', 'A');
      
      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining([
        testItems[0],
        testItems[2]
      ]));
    });
    
    test('should clear all data from a store', async () => {
      const testItems = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' }
      ];
      
      for (const item of testItems) {
        await addItem(TEST_STORES.STORIES, item);
      }
      
      await clearStore(TEST_STORES.STORIES);
      
      const items = indexedDBMock.getAllItems(TEST_STORES.STORIES);
      expect(items).toHaveLength(0);
    });
  });
  
  describe('Story Operations', () => {
    test('should add a story', async () => {
      const story = createTestStory('1', false, false);
      const result = await addStory(story);
      
      expect(result.id).toBe('1');
      expect(result.is_synced).toBe(false);
      expect(result.updated_at).toBeDefined();
    });
    
    test('should update a story', async () => {
      const story = createTestStory('1', false, false);
      await addStory(story);
      
      const updatedStory = { ...story, title: 'Updated Title' };
      const result = await updateStory(updatedStory);
      
      expect(result.title).toBe('Updated Title');
      expect(result.is_synced).toBe(false);
      expect(result.updated_at).toBeDefined();
    });
    
    test('should get a story by ID', async () => {
      const story = createTestStory('1', false, false);
      await addStory(story);
      
      const result = await getStory('1');
      
      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
    });
    
    test('should delete a story', async () => {
      const story = createTestStory('1', false, false);
      await addStory(story);
      
      await deleteStory('1');
      
      const result = await getStory('1');
      expect(result).toBeNull();
    });
    
    test('should get all stories', async () => {
      const stories = [
        createTestStory('1', false, false),
        createTestStory('2', true, false),
        createTestStory('3', false, true)
      ];
      
      for (const story of stories) {
        await addStory(story);
      }
      
      const result = await getAllStories();
      
      expect(result).toHaveLength(3);
    });
    
    test('should get stories by user ID', async () => {
      const stories = [
        { ...createTestStory('1', false, false), user_id: 'user1' },
        { ...createTestStory('2', true, false), user_id: 'user2' },
        { ...createTestStory('3', false, true), user_id: 'user1' }
      ];
      
      for (const story of stories) {
        await addStory(story);
      }
      
      const result = await getStoriesByUserId('user1');
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
    });
    
    test('should get unsynced stories', async () => {
      const stories = [
        { ...createTestStory('1', false, false), is_synced: false },
        { ...createTestStory('2', true, false), is_synced: true },
        { ...createTestStory('3', false, true), is_synced: false }
      ];
      
      for (const story of stories) {
        await addStory(story);
      }
      
      const result = await getUnsyncedStories();
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
    });
  });
  
  describe('Story Segment Operations', () => {
    test('should add a story segment', async () => {
      const segment = createTestStorySegment('1', '1', 1, false, false);
      const result = await addStorySegment(segment);
      
      expect(result.id).toBe('1');
      expect(result.is_synced).toBe(false);
    });
    
    test('should update a story segment', async () => {
      const segment = createTestStorySegment('1', '1', 1, false, false);
      await addStorySegment(segment);
      
      const updatedSegment = { ...segment, is_end: true };
      const result = await updateStorySegment(updatedSegment);
      
      expect(result.is_end).toBe(true);
      expect(result.is_synced).toBe(false);
    });
    
    test('should get a story segment by ID', async () => {
      const segment = createTestStorySegment('1', '1', 1, false, false);
      await addStorySegment(segment);
      
      const result = await getStorySegment('1');
      
      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
    });
    
    test('should delete a story segment', async () => {
      const segment = createTestStorySegment('1', '1', 1, false, false);
      await addStorySegment(segment);
      
      await deleteStorySegment('1');
      
      const result = await getStorySegment('1');
      expect(result).toBeNull();
    });
    
    test('should get all story segments for a story', async () => {
      const segments = [
        createTestStorySegment('1', 'story1', 1, false, false),
        createTestStorySegment('2', 'story2', 1, false, false),
        createTestStorySegment('3', 'story1', 2, true, false)
      ];
      
      for (const segment of segments) {
        await addStorySegment(segment);
      }
      
      const result = await getStorySegmentsByStoryId('story1');
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
    });
    
    test('should get unsynced story segments', async () => {
      const segments = [
        { ...createTestStorySegment('1', 'story1', 1, false, false), is_synced: false },
        { ...createTestStorySegment('2', 'story2', 1, false, false), is_synced: true },
        { ...createTestStorySegment('3', 'story1', 2, true, false), is_synced: false }
      ];
      
      for (const segment of segments) {
        await addStorySegment(segment);
      }
      
      const result = await getUnsyncedStorySegments();
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
    });
  });
  
  describe('Operation Queue Operations', () => {
    test('should add an operation to the queue', async () => {
      const operation = createTestOperationQueueItem('1', OperationType.INSERT, TEST_STORES.STORIES, '1', OperationStatus.PENDING);
      const result = await addOperation(operation);
      
      expect(result.id).toBe('1');
      expect(result.status).toBe(OperationStatus.PENDING);
    });
    
    test('should update an operation in the queue', async () => {
      const operation = createTestOperationQueueItem('1', OperationType.INSERT, TEST_STORES.STORIES, '1', OperationStatus.PENDING);
      await addOperation(operation);
      
      const updatedOperation = { ...operation, status: OperationStatus.COMPLETED };
      const result = await updateOperation(updatedOperation);
      
      expect(result.status).toBe(OperationStatus.COMPLETED);
    });
    
    test('should get pending operations', async () => {
      const operations = [
        createTestOperationQueueItem('1', OperationType.INSERT, TEST_STORES.STORIES, '1', OperationStatus.PENDING),
        createTestOperationQueueItem('2', OperationType.UPDATE, TEST_STORES.STORIES, '2', OperationStatus.COMPLETED),
        createTestOperationQueueItem('3', OperationType.DELETE, TEST_STORES.STORIES, '3', OperationStatus.PENDING)
      ];
      
      for (const operation of operations) {
        await addOperation(operation);
      }
      
      const result = await getPendingOperations();
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
    });
    
    test('should get failed operations', async () => {
      const operations = [
        createTestOperationQueueItem('1', OperationType.INSERT, TEST_STORES.STORIES, '1', OperationStatus.PENDING),
        createTestOperationQueueItem('2', OperationType.UPDATE, TEST_STORES.STORIES, '2', OperationStatus.FAILED),
        createTestOperationQueueItem('3', OperationType.DELETE, TEST_STORES.STORIES, '3', OperationStatus.FAILED)
      ];
      
      for (const operation of operations) {
        await addOperation(operation);
      }
      
      const result = await getFailedOperations();
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
    });
    
    test('should delete an operation from the queue', async () => {
      const operation = createTestOperationQueueItem('1', OperationType.INSERT, TEST_STORES.STORIES, '1', OperationStatus.PENDING);
      await addOperation(operation);
      
      await deleteOperation('1');
      
      const pendingOperations = await getPendingOperations();
      expect(pendingOperations).toHaveLength(0);
    });
  });
});