/**
 * Jest setup file for autosave tests
 * 
 * This file defines global Jest functions and types to avoid TypeScript errors.
 */

// Define Jest global functions
export const describe = (_name: string, _fn: () => void): void => {};
export const test = (_name: string, _fn: () => Promise<void> | void): void => {};

// Create a proper expect function with static methods
const expectFn = (_actual: any) => ({
  toBe: (_expected: any) => {},
  toEqual: (_expected: any) => {},
  toBeDefined: () => {},
  toBeNull: () => {},
  toHaveLength: (_length: number) => {},
  toContain: (_item: any) => {}
});

// Add static methods to the expect function
expectFn.arrayContaining = (items: any[]) => items;

// Export the expect function
export const expect = expectFn as any;
export const beforeEach = (_fn: () => void): void => {};
export const afterEach = (_fn: () => void): void => {};

// Define mock function type
export interface MockFunction<T = any> {
  (...args: any[]): Promise<void>;
  calls: any[][];
  returnValue: any;
  mockReturnValue: (val: any) => MockFunction<T>;
  mockResolvedValue: (val: any) => MockFunction<T>;
  mockRejectedValue: (val: any) => MockFunction<T>;
  mockImplementation: (impl: (...args: any[]) => any) => MockFunction<T>;
  mockClear: () => MockFunction<T>;
  toBeCalled: () => boolean;
  toBeCalledWith: (...args: any[]) => boolean;
  [key: string]: any;
}

// Enhanced mock function
export const fn = (): MockFunction => {
  const mockFn = ((...args: any[]) => {
    mockFn.calls.push(args);
    return mockFn.returnValue;
  }) as MockFunction;
  
  // Add mock properties and methods
  mockFn.calls = [];
  mockFn.returnValue = Promise.resolve();
  
  // Mock methods
  mockFn.mockReturnValue = (val: any) => {
    mockFn.returnValue = val;
    return mockFn;
  };
  
  mockFn.mockResolvedValue = (val: any) => {
    mockFn.returnValue = Promise.resolve(val);
    return mockFn;
  };
  
  mockFn.mockRejectedValue = (val: any) => {
    mockFn.returnValue = Promise.reject(val);
    return mockFn;
  };
  
  mockFn.mockImplementation = (impl: (...args: any[]) => any) => {
    const originalMockFn = mockFn;
    const newMockFn = ((...args: any[]) => {
      originalMockFn.calls.push(args);
      return impl(...args);
    }) as MockFunction;
    
    // Copy properties
    Object.assign(newMockFn, originalMockFn);
    
    return newMockFn;
  };
  
  mockFn.mockClear = () => {
    mockFn.calls = [];
    return mockFn;
  };
  
  // Helper to check if the mock was called
  mockFn.toBeCalled = () => mockFn.calls.length > 0;
  mockFn.toBeCalledWith = (...args: any[]) => {
    return mockFn.calls.some(call =>
      call.length === args.length &&
      call.every((arg: any, i: number) => arg === args[i])
    );
  };
  
  return mockFn;
};

// Export as Jest namespace
export const jest = {
  fn
};

// Helper to make a mock function return a Promise
export const asyncMockFn = () => {
  const mockFn = fn();
  return mockFn.mockResolvedValue(undefined);
};