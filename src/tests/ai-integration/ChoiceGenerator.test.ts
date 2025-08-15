import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChoiceGenerator } from '../../../supabase/functions/_shared/ChoiceGenerator';

describe('ChoiceGenerator', () => {
  let choiceGenerator: ChoiceGenerator;
  const mockStoryId = 'test-story-123';
  const mockSegmentNumber = 1;

  beforeEach(() => {
    choiceGenerator = new ChoiceGenerator();
    vi.clearAllMocks();
  });

  describe('Choice Diversity', () => {
    it('should generate diverse choice types', async () => {
      const context = {
        genre: 'fantasy',
        ageGroup: '7-9',
        currentScene: 'The hero stands at a crossroads',
        characters: ['Hero', 'Companion'],
        plotPoints: ['Quest begun', 'Map found']
      };

      const choices = await choiceGenerator.generateChoices(context, mockStoryId, mockSegmentNumber);
      
      // Check for diversity in choice types
      const choiceTypes = choices.map(c => c.type);
      const uniqueTypes = new Set(choiceTypes);
      
      expect(uniqueTypes.size).toBeGreaterThan(1);
      expect(choices).toHaveLength(3);
    });

    it('should avoid repetitive choice patterns', async () => {
      const previousChoices = [
        { text: 'Fight the dragon', type: 'action' },
        { text: 'Attack the goblin', type: 'action' },
        { text: 'Battle the wizard', type: 'action' }
      ];

      const context = {
        genre: 'fantasy',
        ageGroup: '10-12',
        previousChoices,
        currentScene: 'A new enemy appears'
      };

      const choices = await choiceGenerator.generateChoices(context, mockStoryId, mockSegmentNumber);
      
      // Should generate non-combat alternatives
      const nonActionChoices = choices.filter(c => c.type !== 'action');
      expect(nonActionChoices.length).toBeGreaterThan(0);
    });

    it('should generate age-appropriate complexity', async () => {
      const contexts = [
        { ageGroup: '4-6', scene: 'The bunny sees a carrot' },
        { ageGroup: '7-9', scene: 'The explorer finds a map' },
        { ageGroup: '10-12', scene: 'The detective discovers a clue' },
        { ageGroup: '13+', scene: 'The diplomat faces a crisis' }
      ];

      for (const context of contexts) {
        const choices = await choiceGenerator.generateChoices(context, mockStoryId, mockSegmentNumber);
        
        // Verify complexity increases with age
        const avgWordCount = choices.reduce((sum, c) => sum + c.text.split(' ').length, 0) / choices.length;
        
        if (context.ageGroup === '4-6') {
          expect(avgWordCount).toBeLessThan(8);
        } else if (context.ageGroup === '13+') {
          expect(avgWordCount).toBeGreaterThan(6);
        }
      }
    });

    it('should maintain narrative coherence', async () => {
      const context = {
        genre: 'mystery',
        ageGroup: '10-12',
        currentScene: 'The detective finds a locked door with strange symbols',
        plotPoints: ['Found mysterious note', 'Interviewed witness'],
        narrativeThreads: ['solving the theft', 'decoding symbols']
      };

      const choices = await choiceGenerator.generateChoices(context, mockStoryId, mockSegmentNumber);
      
      // All choices should relate to the current situation
      const relevantChoices = choices.filter(c => 
        c.text.toLowerCase().includes('door') ||
        c.text.toLowerCase().includes('symbol') ||
        c.text.toLowerCase().includes('lock') ||
        c.text.toLowerCase().includes('decode')
      );
      
      expect(relevantChoices.length).toBeGreaterThan(0);
    });
  });

  describe('Choice Relevance', () => {
    it('should generate contextually relevant choices', async () => {
      const context = {
        genre: 'sci-fi',
        ageGroup: '10-12',
        currentScene: 'The spaceship is losing power',
        location: 'Deep space',
        availableResources: ['emergency battery', 'solar panels', 'distress beacon']
      };

      const choices = await choiceGenerator.generateChoices(context, mockStoryId, mockSegmentNumber);
      
      // Choices should relate to the power problem
      const relevantKeywords = ['power', 'battery', 'solar', 'emergency', 'distress'];
      const relevantChoices = choices.filter(c => 
        relevantKeywords.some(keyword => c.text.toLowerCase().includes(keyword))
      );
      
      expect(relevantChoices.length).toBeGreaterThan(0);
    });

    it('should respect character abilities and limitations', async () => {
      const context = {
        genre: 'fantasy',
        ageGroup: '7-9',
        currentScene: 'A magical barrier blocks the path',
        mainCharacter: {
          name: 'Tim',
          abilities: ['climbing', 'puzzle-solving'],
          limitations: ['no magic']
        }
      };

      const choices = await choiceGenerator.generateChoices(context, mockStoryId, mockSegmentNumber);
      
      // Should not suggest magical solutions
      const magicChoices = choices.filter(c => 
        c.text.toLowerCase().includes('cast') ||
        c.text.toLowerCase().includes('spell') ||
        c.text.toLowerCase().includes('magic')
      );
      
      expect(magicChoices.length).toBe(0);
      
      // Should include ability-based solutions
      const abilityChoices = choices.filter(c => 
        c.text.toLowerCase().includes('climb') ||
        c.text.toLowerCase().includes('puzzle') ||
        c.text.toLowerCase().includes('solve')
      );
      
      expect(abilityChoices.length).toBeGreaterThan(0);
    });

    it('should consider emotional context', async () => {
      const context = {
        genre: 'drama',
        ageGroup: '13+',
        currentScene: 'Your best friend reveals they are moving away',
        emotionalTone: 'sad',
        relationship: 'close friendship'
      };

      const choices = await choiceGenerator.generateChoices(context, mockStoryId, mockSegmentNumber);
      
      // Choices should reflect emotional responses
      const emotionalKeywords = ['feel', 'say', 'hug', 'promise', 'remember', 'goodbye'];
      const emotionalChoices = choices.filter(c => 
        emotionalKeywords.some(keyword => c.text.toLowerCase().includes(keyword))
      );
      
      expect(emotionalChoices.length).toBeGreaterThan(0);
    });
  });

  describe('Consequence Tracking', () => {
    it('should track choice consequences', async () => {
      const choice = {
        id: 'choice-1',
        text: 'Take the mysterious potion',
        type: 'risk',
        potentialConsequences: ['gain powers', 'get sick', 'transform']
      };

      await choiceGenerator.recordChoice(mockStoryId, mockSegmentNumber, choice);
      
      const consequences = await choiceGenerator.getChoiceConsequences(mockStoryId, 'choice-1');
      
      expect(consequences).toBeDefined();
      expect(consequences.potentialConsequences).toContain('gain powers');
    });

    it('should influence future choices based on past decisions', async () => {
      const pastChoices = [
        { id: 'c1', text: 'Trust the stranger', consequence: 'betrayed' },
        { id: 'c2', text: 'Help the merchant', consequence: 'rewarded' }
      ];

      const context = {
        genre: 'fantasy',
        ageGroup: '10-12',
        currentScene: 'Another stranger asks for help',
        pastChoices
      };

      const choices = await choiceGenerator.generateChoices(context, mockStoryId, mockSegmentNumber);
      
      // Should include cautious options due to past betrayal
      const cautiousChoices = choices.filter(c => 
        c.text.toLowerCase().includes('careful') ||
        c.text.toLowerCase().includes('suspicious') ||
        c.text.toLowerCase().includes('decline')
      );
      
      expect(cautiousChoices.length).toBeGreaterThan(0);
    });

    it('should create branching narratives', async () => {
      const branchPoint = {
        segmentNumber: 3,
        choice: 'Save the village',
        alternativeChoice: 'Chase the villain'
      };

      const branch1 = await choiceGenerator.generateBranch(mockStoryId, branchPoint, 'village');
      const branch2 = await choiceGenerator.generateBranch(mockStoryId, branchPoint, 'villain');
      
      expect(branch1.narrative).not.toEqual(branch2.narrative);
      expect(branch1.outcomes).not.toEqual(branch2.outcomes);
    });
  });

  describe('Choice Validation', () => {
    it('should validate choice appropriateness', async () => {
      const inappropriateChoices = [
        { text: 'Use violence', ageGroup: '4-6' },
        { text: 'Scary monster attacks', ageGroup: '4-6' },
        { text: 'Complex political negotiation', ageGroup: '7-9' }
      ];

      for (const choice of inappropriateChoices) {
        const isValid = await choiceGenerator.validateChoice(choice.text, choice.ageGroup);
        expect(isValid).toBe(false);
      }
    });

    it('should ensure minimum choice quality', async () => {
      const poorChoices = [
        { text: 'Yes', score: 0 },
        { text: 'No', score: 0 },
        { text: 'Maybe', score: 0 }
      ];

      const context = {
        genre: 'adventure',
        ageGroup: '10-12',
        currentScene: 'You discover an ancient treasure map'
      };

      const choices = await choiceGenerator.generateChoices(context, mockStoryId, mockSegmentNumber);
      
      // All choices should be more descriptive than single words
      choices.forEach(choice => {
        expect(choice.text.split(' ').length).toBeGreaterThan(2);
      });
    });

    it('should prevent duplicate choices', async () => {
      const context = {
        genre: 'fantasy',
        ageGroup: '7-9',
        currentScene: 'The path splits in three directions'
      };

      const choices = await choiceGenerator.generateChoices(context, mockStoryId, mockSegmentNumber);
      
      const uniqueChoices = new Set(choices.map(c => c.text.toLowerCase()));
      expect(uniqueChoices.size).toEqual(choices.length);
    });
  });

  describe('Performance', () => {
    it('should generate choices within time limit', async () => {
      const context = {
        genre: 'fantasy',
        ageGroup: '10-12',
        currentScene: 'Complex battle scene with multiple enemies'
      };

      const startTime = Date.now();
      await choiceGenerator.generateChoices(context, mockStoryId, mockSegmentNumber);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(3000); // 3 seconds max
    });

    it('should cache frequently used choice patterns', async () => {
      const context = {
        genre: 'fantasy',
        ageGroup: '7-9',
        currentScene: 'Standard crossroads scene'
      };

      // First generation
      const start1 = Date.now();
      await choiceGenerator.generateChoices(context, mockStoryId, mockSegmentNumber);
      const time1 = Date.now() - start1;
      
      // Second generation (should be cached)
      const start2 = Date.now();
      await choiceGenerator.generateChoices(context, mockStoryId, mockSegmentNumber);
      const time2 = Date.now() - start2;
      
      expect(time2).toBeLessThan(time1);
    });
  });

  describe('Metrics', () => {
    it('should track choice selection rates', async () => {
      const choices = [
        { id: 'c1', text: 'Option 1', selectedCount: 10 },
        { id: 'c2', text: 'Option 2', selectedCount: 5 },
        { id: 'c3', text: 'Option 3', selectedCount: 15 }
      ];

      const metrics = await choiceGenerator.getChoiceMetrics(mockStoryId);
      
      expect(metrics.totalSelections).toBe(30);
      expect(metrics.mostPopular).toBe('c3');
      expect(metrics.leastPopular).toBe('c2');
    });

    it('should calculate diversity scores', async () => {
      const choiceSets = [
        [
          { type: 'action', text: 'Fight' },
          { type: 'dialogue', text: 'Talk' },
          { type: 'exploration', text: 'Explore' }
        ],
        [
          { type: 'action', text: 'Attack' },
          { type: 'action', text: 'Defend' },
          { type: 'action', text: 'Run' }
        ]
      ];

      const diversity1 = choiceGenerator.calculateDiversityScore(choiceSets[0]);
      const diversity2 = choiceGenerator.calculateDiversityScore(choiceSets[1]);
      
      expect(diversity1).toBeGreaterThan(diversity2);
    });
  });
});