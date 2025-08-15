import { Story, StorySegmentRow } from '@/types/stories';

// Database configuration
const DB_NAME = 'taleforge_offline_db';
const DB_VERSION = 1;

// Store names
export const STORES = {
  STORIES: 'stories',
  STORY_SEGMENTS: 'story_segments',
  OPERATION_QUEUE: 'operation_queue'
};

// Extended interfaces for offline storage
export interface OfflineStory extends Story {
  is_synced: boolean;
  updated_at: string;
}

export interface OfflineStorySegment extends StorySegmentRow {
  is_synced: boolean;
}

// Operation types for the queue
export enum OperationType {
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete'
}

// Operation status
export enum OperationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Operation queue item interface
export interface OperationQueueItem {
  id: string;
  operationType: OperationType;
  targetTable: string;
  recordId: string;
  payload: any;
  createdAt: string;
  retryCount: number;
  status: OperationStatus;
  error?: string;
}

// Initialize the database
export const initDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('IndexedDB opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stories store
      if (!db.objectStoreNames.contains(STORES.STORIES)) {
        const storyStore = db.createObjectStore(STORES.STORIES, { keyPath: 'id' });
        storyStore.createIndex('user_id', 'user_id', { unique: false });
        storyStore.createIndex('is_completed', 'is_completed', { unique: false });
        storyStore.createIndex('is_synced', 'is_synced', { unique: false });
        storyStore.createIndex('updated_at', 'updated_at', { unique: false });
      }

      // Create story segments store
      if (!db.objectStoreNames.contains(STORES.STORY_SEGMENTS)) {
        const segmentStore = db.createObjectStore(STORES.STORY_SEGMENTS, { keyPath: 'id' });
        segmentStore.createIndex('story_id', 'story_id', { unique: false });
        segmentStore.createIndex('is_end', 'is_end', { unique: false });
        segmentStore.createIndex('is_synced', 'is_synced', { unique: false });
        segmentStore.createIndex('sequence_number', 'sequence_number', { unique: false });
      }

      // Create operation queue store
      if (!db.objectStoreNames.contains(STORES.OPERATION_QUEUE)) {
        const queueStore = db.createObjectStore(STORES.OPERATION_QUEUE, { keyPath: 'id' });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('targetTable', 'targetTable', { unique: false });
        queueStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

// Generic function to add an item to a store
export const addItem = <T>(storeName: string, item: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = (event) => {
        console.error(`Error adding item to ${storeName}:`, event);
        reject(new Error(`Failed to add item to ${storeName}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    }).catch(reject);
  });
};

// Generic function to update an item in a store
export const updateItem = <T>(storeName: string, item: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = (event) => {
        console.error(`Error updating item in ${storeName}:`, event);
        reject(new Error(`Failed to update item in ${storeName}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    }).catch(reject);
  });
};

// Generic function to get an item from a store by ID
export const getItem = <T>(storeName: string, id: string): Promise<T | null> => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = (event) => {
        console.error(`Error getting item from ${storeName}:`, event);
        reject(new Error(`Failed to get item from ${storeName}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    }).catch(reject);
  });
};

// Generic function to delete an item from a store
export const deleteItem = (storeName: string, id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error(`Error deleting item from ${storeName}:`, event);
        reject(new Error(`Failed to delete item from ${storeName}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    }).catch(reject);
  });
};

// Generic function to get all items from a store
export const getAllItems = <T>(storeName: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error(`Error getting all items from ${storeName}:`, event);
        reject(new Error(`Failed to get all items from ${storeName}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    }).catch(reject);
  });
};

// Function to query items by index
export const queryByIndex = <T>(
  storeName: string, 
  indexName: string, 
  value: any
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error(`Error querying items by index ${indexName}:`, event);
        reject(new Error(`Failed to query items by index ${indexName}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    }).catch(reject);
  });
};

// Clear all data from a store
export const clearStore = (storeName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    initDatabase().then(db => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error(`Error clearing store ${storeName}:`, event);
        reject(new Error(`Failed to clear store ${storeName}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    }).catch(reject);
  });
};

// Add a story to IndexedDB
export const addStory = (story: Partial<OfflineStory>): Promise<OfflineStory> => {
  return addItem<OfflineStory>(STORES.STORIES, {
    ...story as any,
    is_synced: story.is_synced ?? false,
    updated_at: new Date().toISOString()
  } as OfflineStory);
};

// Update a story in IndexedDB
export const updateStory = (story: Partial<OfflineStory>): Promise<OfflineStory> => {
  return updateItem<OfflineStory>(STORES.STORIES, {
    ...story as any,
    is_synced: story.is_synced ?? false,
    updated_at: new Date().toISOString()
  } as OfflineStory);
};

// Get a story from IndexedDB
export const getStory = (id: string): Promise<OfflineStory | null> => {
  return getItem<OfflineStory>(STORES.STORIES, id);
};

// Delete a story from IndexedDB
export const deleteStory = (id: string): Promise<void> => {
  return deleteItem(STORES.STORIES, id);
};

// Get all stories from IndexedDB
export const getAllStories = (): Promise<OfflineStory[]> => {
  return getAllItems<OfflineStory>(STORES.STORIES);
};

// Get stories by user ID
export const getStoriesByUserId = (userId: string): Promise<OfflineStory[]> => {
  return queryByIndex<OfflineStory>(STORES.STORIES, 'user_id', userId);
};

// Get unsynced stories
export const getUnsyncedStories = (): Promise<OfflineStory[]> => {
  return queryByIndex<OfflineStory>(STORES.STORIES, 'is_synced', false);
};

// Add a story segment to IndexedDB
export const addStorySegment = (segment: Partial<OfflineStorySegment>): Promise<OfflineStorySegment> => {
  return addItem<OfflineStorySegment>(STORES.STORY_SEGMENTS, {
    ...segment as any,
    is_synced: segment.is_synced ?? false
  } as OfflineStorySegment);
};

// Update a story segment in IndexedDB
export const updateStorySegment = (segment: Partial<OfflineStorySegment>): Promise<OfflineStorySegment> => {
  return updateItem<OfflineStorySegment>(STORES.STORY_SEGMENTS, {
    ...segment as any,
    is_synced: segment.is_synced ?? false
  } as OfflineStorySegment);
};

// Get a story segment from IndexedDB
export const getStorySegment = (id: string): Promise<OfflineStorySegment | null> => {
  return getItem<OfflineStorySegment>(STORES.STORY_SEGMENTS, id);
};

// Delete a story segment from IndexedDB
export const deleteStorySegment = (id: string): Promise<void> => {
  return deleteItem(STORES.STORY_SEGMENTS, id);
};

// Get all story segments for a story
export const getStorySegmentsByStoryId = (storyId: string): Promise<OfflineStorySegment[]> => {
  return queryByIndex<OfflineStorySegment>(STORES.STORY_SEGMENTS, 'story_id', storyId);
};

// Get unsynced story segments
export const getUnsyncedStorySegments = (): Promise<OfflineStorySegment[]> => {
  return queryByIndex<OfflineStorySegment>(STORES.STORY_SEGMENTS, 'is_synced', false);
};

// Add an operation to the queue
export const addOperation = (operation: OperationQueueItem): Promise<OperationQueueItem> => {
  return addItem<OperationQueueItem>(STORES.OPERATION_QUEUE, operation);
};

// Update an operation in the queue
export const updateOperation = (operation: OperationQueueItem): Promise<OperationQueueItem> => {
  return updateItem<OperationQueueItem>(STORES.OPERATION_QUEUE, operation);
};

// Get pending operations
export const getPendingOperations = (): Promise<OperationQueueItem[]> => {
  return queryByIndex<OperationQueueItem>(STORES.OPERATION_QUEUE, 'status', OperationStatus.PENDING);
};

// Get failed operations
export const getFailedOperations = (): Promise<OperationQueueItem[]> => {
  return queryByIndex<OperationQueueItem>(STORES.OPERATION_QUEUE, 'status', OperationStatus.FAILED);
};

// Delete an operation from the queue
export const deleteOperation = (id: string): Promise<void> => {
  return deleteItem(STORES.OPERATION_QUEUE, id);
};