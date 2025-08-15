import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StoryContextManager } from '../../../supabase/functions/_shared/StoryContextManager';
import { supabase } from '../../../integrations/supabase/client';

// Mock Supabase client
vi.mock('../../../integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }
}));

describe('StoryContextManager', () => {
  let contextManager: StoryContextManager;
  const mockStoryId = 'test-story-123';
  const mockUserId = 'test-user-456';

  beforeEach(() => {
    contextManager = new StoryContextManager(mockStoryId, mockUserId);
    vi.clearAllMocks();
  });

  describe('Context Persistence', () => {
    it('should maintain context across multiple segments', async () => {
      const segment1Context = {
        characters: ['Alice', 'Bob'],
        locations: ['Forest', 'Castle'],
        plotPoints: ['Found magical sword'],
        emotionalTone: 'adventurous'
      };

      await contextManager.updateContext(segment1Context);
      const context1 = await contextManager.getContext();
      
      expect(context1).toMatchObject(segment1Context);

      const segment2Context = {
        characters: ['Alice', 'Bob', 'Dragon'],
        locations: ['Forest', 'Castle', 'Cave'],
        plotPoints: ['Found magical sword', 'Encountered dragon'],
        emotionalTone: 'tense'
      };

      await contextManager.updateContext(segment2Context);
      const context2 = await contextManager.getContext();
      
      expect(context2.characters).toContain('Dragon');
      expect(context2.plotPoints).toHaveLength(2);
    });

    it('should handle context window limits appropriately', async () => {
      const largeContext = {
        characters: Array(50).fill(null).map((_, i) => `Character${i}`),
        locations: Array(100).fill(null).map((_, i) => `Location${i}`),
        plotPoints: Array(200).fill(null).map((_, i) => `Plot${i}`),
        emotionalTone: 'complex'
      };

      await contextManager.updateContext(largeContext);
      const context = await contextManager.getContext();
      
      // Should maintain most important context within limits
      expect(context.characters.length).toBeLessThanOrEqual(20);
      expect(context.locations.length).toBeLessThanOrEqual(10);
      expect(context.plotPoints.length).toBeLessThanOrEqual(50);
    });

    it('should preserve character relationships', async () => {
      const relationships = {
        'Alice-Bob': 'friends',
        'Bob-Dragon': 'enemies',
        'Alice-Dragon': 'neutral'
      };

      await contextManager.updateRelationships(relationships);
      const context = await contextManager.getContext();
      
      expect(context.relationships).toEqual(relationships);
    });

    it('should track narrative threads', async () => {
      const threads = [
        { id: 'quest', status: 'active', description: 'Find the crystal' },
        { id: 'romance', status: 'developing', description: 'Alice and Bob' },
        { id: 'mystery', status: 'resolved', description: 'Who stole the crown' }
      ];

      await contextManager.updateNarrativeThreads(threads);
      const context = await contextManager.getContext();
      
      expect(context.narrativeThreads).toHaveLength(3);
      expect(context.narrativeThreads.find(t => t.id === 'quest')).toBeDefined();
    });
  });

  describe('Context Retrieval', () => {
    it('should retrieve relevant context for new segments', async () => {
      const historicalContext = {
        characters: ['Alice', 'Bob', 'Charlie'],
        locations: ['Forest', 'Village'],
        plotPoints: ['Met wizard', 'Found map', 'Crossed river'],
        emotionalTone: 'hopeful'
      };

      await contextManager.updateContext(historicalContext);
      
      const relevantContext = await contextManager.getRelevantContext('river crossing');
      
      expect(relevantContext).toContain('Crossed river');
      expect(relevantContext).toContain('Alice');
    });

    it('should prioritize recent context over older context', async () => {
      const oldContext = {
        plotPoints: ['Started journey'],
        timestamp: new Date(Date.now() - 86400000).toISOString()
      };

      const recentContext = {
        plotPoints: ['Found treasure'],
        timestamp: new Date().toISOString()
      };

      await contextManager.addHistoricalContext(oldContext);
      await contextManager.addHistoricalContext(recentContext);
      
      const context = await contextManager.getContext();
      
      expect(context.recentEvents).toContain('Found treasure');
      expect(context.recentEvents.indexOf('Found treasure')).toBeLessThan(
        context.recentEvents.indexOf('Started journey')
      );
    });
  });

  describe('Context Consistency', () => {
    it('should maintain character consistency across segments', async () => {
      const characterProfile = {
        name: 'Alice',
        traits: ['brave', 'curious', 'kind'],
        appearance: 'Long brown hair, green eyes, blue dress',
        abilities: ['swordfighting', 'magic sensing']
      };

      await contextManager.registerCharacter(characterProfile);
      
      const validation = await contextManager.validateCharacterConsistency('Alice', {
        traits: ['brave', 'mean'],
        appearance: 'Short blonde hair'
      });
      
      expect(validation.isConsistent).toBe(false);
      expect(validation.inconsistencies).toContain('trait mismatch');
      expect(validation.inconsistencies).toContain('appearance change');
    });

    it('should track and validate location consistency', async () => {
      const location = {
        name: 'Enchanted Forest',
        features: ['tall trees', 'magical creatures', 'hidden paths'],
        atmosphere: 'mysterious and ancient'
      };

      await contextManager.registerLocation(location);
      
      const validation = await contextManager.validateLocationConsistency('Enchanted Forest', {
        features: ['tall trees', 'modern buildings'],
        atmosphere: 'urban and busy'
      });
      
      expect(validation.isConsistent).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(supabase.from).mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });

      const result = await contextManager.getContext();
      
      expect(result).toBeDefined();
      expect(result.error).toContain('Database connection failed');
    });

    it('should provide fallback context on retrieval failure', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: new Error('Not found') }))
          }))
        }))
      } as any);

      const context = await contextManager.getContext();
      
      expect(context).toBeDefined();
      expect(context.characters).toEqual([]);
      expect(context.locations).toEqual([]);
      expect(context.plotPoints).toEqual([]);
    });
  });

  describe('Performance', () => {
    it('should cache frequently accessed context', async () => {
      const spy = vi.spyOn(supabase, 'from');
      
      // First call should hit database
      await contextManager.getContext();
      expect(spy).toHaveBeenCalledTimes(1);
      
      // Subsequent calls within cache period should use cache
      await contextManager.getContext();
      await contextManager.getContext();
      expect(spy).toHaveBeenCalledTimes(1);
      
      // After cache expiry, should hit database again
      vi.advanceTimersByTime(60000); // Advance 1 minute
      await contextManager.getContext();
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should batch context updates efficiently', async () => {
      const updates = [
        { characters: ['Alice'] },
        { locations: ['Forest'] },
        { plotPoints: ['Found key'] }
      ];

      const spy = vi.spyOn(supabase, 'from');
      
      await contextManager.batchUpdate(updates);
      
      // Should make single database call for batch update
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});