/**
 * Mock implementation of IndexedDB for testing
 */

// Mock store data
interface MockStore {
  data: any[];
  indexes: {
    [indexName: string]: {
      [value: string]: any[];
    };
  };
}

// Mock database structure
type MockDatabase = {
  [storeName: string]: MockStore;
};

// Mock IndexedDB implementation
export class IndexedDBMock {
  private static instance: IndexedDBMock;
  private databases: { [name: string]: MockDatabase } = {};
  private currentDatabase: string | null = null;

  private constructor() {}

  /**
   * Get the singleton instance of IndexedDBMock
   */
  public static getInstance(): IndexedDBMock {
    if (!IndexedDBMock.instance) {
      IndexedDBMock.instance = new IndexedDBMock();
    }
    return IndexedDBMock.instance;
  }

  /**
   * Reset all mock data
   */
  public reset(): void {
    this.databases = {};
    this.currentDatabase = null;
  }

  /**
   * Create a mock database
   */
  public createDatabase(name: string, stores: string[]): void {
    const database: MockDatabase = {};
    
    stores.forEach(storeName => {
      database[storeName] = {
        data: [],
        indexes: {}
      };
    });
    
    this.databases[name] = database;
    this.currentDatabase = name;
  }

  /**
   * Get the current database
   */
  public getDatabase(): MockDatabase | null {
    if (!this.currentDatabase) return null;
    return this.databases[this.currentDatabase];
  }

  /**
   * Set the current database
   */
  public setCurrentDatabase(name: string): void {
    if (!this.databases[name]) {
      throw new Error(`Database ${name} does not exist`);
    }
    this.currentDatabase = name;
  }

  /**
   * Add an item to a store
   */
  public addItem<T>(storeName: string, item: T): T {
    const db = this.getDatabase();
    if (!db) throw new Error('No database selected');
    
    if (!db[storeName]) {
      throw new Error(`Store ${storeName} does not exist`);
    }
    
    // Add to store
    db[storeName].data.push(item);
    
    // Update indexes
    this.updateIndexes(storeName, item);
    
    return item;
  }

  /**
   * Update an item in a store
   */
  public updateItem<T>(storeName: string, item: T): T {
    const db = this.getDatabase();
    if (!db) throw new Error('No database selected');
    
    if (!db[storeName]) {
      throw new Error(`Store ${storeName} does not exist`);
    }
    
    // Find and update item
    const index = db[storeName].data.findIndex((i: any) => i.id === (item as any).id);
    
    if (index === -1) {
      // If item doesn't exist, add it
      return this.addItem(storeName, item);
    }
    
    // Update item
    db[storeName].data[index] = item;
    
    // Update indexes
    this.updateIndexes(storeName, item);
    
    return item;
  }

  /**
   * Get an item from a store by ID
   */
  public getItem<T>(storeName: string, id: string): T | null {
    const db = this.getDatabase();
    if (!db) throw new Error('No database selected');
    
    if (!db[storeName]) {
      throw new Error(`Store ${storeName} does not exist`);
    }
    
    // Find item
    const item = db[storeName].data.find((i: any) => i.id === id);
    
    return item || null;
  }

  /**
   * Delete an item from a store
   */
  public deleteItem(storeName: string, id: string): void {
    const db = this.getDatabase();
    if (!db) throw new Error('No database selected');
    
    if (!db[storeName]) {
      throw new Error(`Store ${storeName} does not exist`);
    }
    
    // Find item index
    const index = db[storeName].data.findIndex((i: any) => i.id === id);
    
    if (index !== -1) {
      // Remove item
      db[storeName].data.splice(index, 1);
      
      // Update indexes (by rebuilding them)
      this.rebuildIndexes(storeName);
    }
  }

  /**
   * Get all items from a store
   */
  public getAllItems<T>(storeName: string): T[] {
    const db = this.getDatabase();
    if (!db) throw new Error('No database selected');
    
    if (!db[storeName]) {
      throw new Error(`Store ${storeName} does not exist`);
    }
    
    return [...db[storeName].data];
  }

  /**
   * Query items by index
   */
  public queryByIndex<T>(storeName: string, indexName: string, value: any): T[] {
    const db = this.getDatabase();
    if (!db) throw new Error('No database selected');
    
    if (!db[storeName]) {
      throw new Error(`Store ${storeName} does not exist`);
    }
    
    if (!db[storeName].indexes[indexName]) {
      throw new Error(`Index ${indexName} does not exist in store ${storeName}`);
    }
    
    const valueStr = String(value);
    
    if (!db[storeName].indexes[indexName][valueStr]) {
      return [];
    }
    
    return [...db[storeName].indexes[indexName][valueStr]];
  }

  /**
   * Clear all data from a store
   */
  public clearStore(storeName: string): void {
    const db = this.getDatabase();
    if (!db) throw new Error('No database selected');
    
    if (!db[storeName]) {
      throw new Error(`Store ${storeName} does not exist`);
    }
    
    // Clear store
    db[storeName].data = [];
    
    // Clear indexes
    db[storeName].indexes = {};
  }

  /**
   * Create an index for a store
   */
  public createIndex(storeName: string, indexName: string): void {
    const db = this.getDatabase();
    if (!db) throw new Error('No database selected');
    
    if (!db[storeName]) {
      throw new Error(`Store ${storeName} does not exist`);
    }
    
    if (!db[storeName].indexes) {
      db[storeName].indexes = {};
    }
    
    db[storeName].indexes[indexName] = {};
    
    // Build index
    this.rebuildIndexes(storeName);
  }

  /**
   * Update indexes for an item
   */
  private updateIndexes(storeName: string, item: any): void {
    const db = this.getDatabase();
    if (!db) return;
    
    // For each index
    Object.keys(db[storeName].indexes).forEach(indexName => {
      // If item has the indexed property
      if (item[indexName] !== undefined) {
        const valueStr = String(item[indexName]);
        
        // Create index entry if it doesn't exist
        if (!db[storeName].indexes[indexName][valueStr]) {
          db[storeName].indexes[indexName][valueStr] = [];
        }
        
        // Remove existing item from index
        const existingIndex = db[storeName].indexes[indexName][valueStr].findIndex((i: any) => i.id === item.id);
        if (existingIndex !== -1) {
          db[storeName].indexes[indexName][valueStr].splice(existingIndex, 1);
        }
        
        // Add item to index
        db[storeName].indexes[indexName][valueStr].push(item);
      }
    });
  }

  /**
   * Rebuild all indexes for a store
   */
  private rebuildIndexes(storeName: string): void {
    const db = this.getDatabase();
    if (!db) return;
    
    // Clear all indexes
    Object.keys(db[storeName].indexes).forEach(indexName => {
      db[storeName].indexes[indexName] = {};
    });
    
    // Rebuild indexes
    db[storeName].data.forEach(item => {
      this.updateIndexes(storeName, item);
    });
  }
}

// Export singleton instance
export const indexedDBMock = IndexedDBMock.getInstance();