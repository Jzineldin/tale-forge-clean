/**
 * Mock implementation of Supabase client for testing
 */

// Mock data storage
interface MockTable {
  data: Record<string, any>[];
}

// Mock database
interface MockDatabase {
  [tableName: string]: MockTable;
}

// Mock query builder
class QueryBuilder {
  private table: string;
  private filters: Array<{
    column: string;
    operator: string;
    value: any;
  }> = [];
  private limitValue: number | null = null;
  private singleResult: boolean = false;
  private db: MockDatabase;

  constructor(table: string, db: MockDatabase) {
    this.table = table;
    this.db = db;
  }

  // Filter by equality
  eq(column: string, value: any): QueryBuilder {
    this.filters.push({
      column,
      operator: 'eq',
      value
    });
    return this;
  }

  // Filter by inequality
  neq(column: string, value: any): QueryBuilder {
    this.filters.push({
      column,
      operator: 'neq',
      value
    });
    return this;
  }

  // Limit results
  limit(count: number): QueryBuilder {
    this.limitValue = count;
    return this;
  }

  // Return a single result
  single(): QueryBuilder {
    this.singleResult = true;
    return this;
  }

  // Execute select query
  async select(_columns: string = '*'): Promise<{ data: any; error: Error | null }> {
    try {
      if (!this.db[this.table]) {
        return { data: null, error: new Error(`Table ${this.table} does not exist`) };
      }

      // Apply filters
      let results = [...this.db[this.table].data];
      
      for (const filter of this.filters) {
        if (filter.operator === 'eq') {
          results = results.filter(item => item[filter.column] === filter.value);
        } else if (filter.operator === 'neq') {
          results = results.filter(item => item[filter.column] !== filter.value);
        }
      }

      // Apply limit
      if (this.limitValue !== null) {
        results = results.slice(0, this.limitValue);
      }

      // Return single result if requested
      if (this.singleResult) {
        return { data: results.length > 0 ? results[0] : null, error: null };
      }

      return { data: results, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Execute insert query
  async insert(data: Record<string, any> | Record<string, any>[]): Promise<{ data: any; error: Error | null }> {
    try {
      if (!this.db[this.table]) {
        return { data: null, error: new Error(`Table ${this.table} does not exist`) };
      }

      const dataArray = Array.isArray(data) ? data : [data];
      
      // Add data to table
      this.db[this.table].data.push(...dataArray);
      
      return { data: dataArray, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Execute update query
  async update(data: Record<string, any>): Promise<{ data: any; error: Error | null }> {
    try {
      if (!this.db[this.table]) {
        return { data: null, error: new Error(`Table ${this.table} does not exist`) };
      }

      // Apply filters
      // let _results = [...this.db[this.table].data];
      let updatedItems = [];
      
      for (const filter of this.filters) {
        if (filter.operator === 'eq') {
          // Find items to update
          const indices = [];
          for (let i = 0; i < this.db[this.table].data.length; i++) {
            if (this.db[this.table].data[i][filter.column] === filter.value) {
              indices.push(i);
            }
          }
          
          // Update items
          for (const index of indices) {
            this.db[this.table].data[index] = {
              ...this.db[this.table].data[index],
              ...data
            };
            updatedItems.push(this.db[this.table].data[index]);
          }
        }
      }

      return { data: updatedItems, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Execute delete query
  async delete(): Promise<{ data: any; error: Error | null }> {
    try {
      if (!this.db[this.table]) {
        return { data: null, error: new Error(`Table ${this.table} does not exist`) };
      }

      // Apply filters
      let deletedItems = [];
      
      for (const filter of this.filters) {
        if (filter.operator === 'eq') {
          // Find items to delete
          const indices = [];
          for (let i = 0; i < this.db[this.table].data.length; i++) {
            if (this.db[this.table].data[i][filter.column] === filter.value) {
              indices.push(i);
              deletedItems.push(this.db[this.table].data[i]);
            }
          }
          
          // Delete items (in reverse order to avoid index shifting)
          for (let i = indices.length - 1; i >= 0; i--) {
            this.db[this.table].data.splice(indices[i], 1);
          }
        }
      }

      return { data: deletedItems, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

// Mock Supabase client
export class SupabaseMock {
  private static instance: SupabaseMock;
  private db: MockDatabase = {};

  private constructor() {
    // Initialize with empty tables
    this.db = {
      stories: { data: [] },
      story_segments: { data: [] }
    };
  }

  /**
   * Get the singleton instance of SupabaseMock
   */
  public static getInstance(): SupabaseMock {
    if (!SupabaseMock.instance) {
      SupabaseMock.instance = new SupabaseMock();
    }
    return SupabaseMock.instance;
  }

  /**
   * Reset all mock data
   */
  public reset(): void {
    this.db = {
      stories: { data: [] },
      story_segments: { data: [] }
    };
  }

  /**
   * Access a table
   */
  public from(table: string): QueryBuilder {
    return new QueryBuilder(table, this.db);
  }

  /**
   * Add a table to the mock database
   */
  public addTable(tableName: string): void {
    if (!this.db[tableName]) {
      this.db[tableName] = { data: [] };
    }
  }

  /**
   * Seed a table with data
   */
  public seedTable(tableName: string, data: Record<string, any>[]): void {
    if (!this.db[tableName]) {
      this.addTable(tableName);
    }
    this.db[tableName].data = [...data];
  }

  /**
   * Get all data from a table
   */
  public getTableData(tableName: string): Record<string, any>[] {
    if (!this.db[tableName]) {
      return [];
    }
    return [...this.db[tableName].data];
  }
}

// Export singleton instance
export const supabaseMock = SupabaseMock.getInstance();

// Mock Supabase client for export
export const mockSupabaseClient = {
  from: (table: string) => supabaseMock.from(table)
};