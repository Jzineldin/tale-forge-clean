/**
 * Edge Mocks for Vitest
 *
 * This file mocks remote https ESM imports used by edge/shared modules
 * to allow them to be tested in a Node.js environment.
 */

import { vi } from 'vitest';

// Mock the Supabase client from ESM import
vi.mock('https://esm.sh/@supabase/supabase-js@2.45.0', async () => {
  // Import the actual package from node_modules
  const actual = await import('@supabase/supabase-js');
  
  return {
    createClient: vi.fn((url: string, key: string) => {
      // Return a mock client with the same API
      return actual.createClient(url, key);
    })
  };
});

// Mock any other ESM imports used in the shared modules
// Example: If there are other https imports that need to be mocked

// Export a function to initialize mocks if needed
export function setupEdgeMocks(): void {
  // Any additional setup can be done here
  console.log('Edge mocks initialized for testing');
}