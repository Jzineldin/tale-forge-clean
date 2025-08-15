import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgeAdaptationManager } from '../../../supabase/functions/_shared/AgeAdaptationManager';

describe('AgeAdaptationManager', () => {
  let ageManager: AgeAdaptationManager;

  beforeEach(() => {
    ageManager = new AgeAdaptationManager();
    vi.clearAllMocks();
  });

  describe('Content Appropriateness', () => {
    it('should validate content for age group 4-6', async () => {
      const testContent = [
        { text: 'The bunny hopped happily', appropriate: true },
        { text: 'The monster was terrifying and gruesome', appropriate: false },
        { text: 'They played in the garden', appropriate: true },
        { text: 'Complex political intrigue unfolded', appropriate: false }
      ];

      for (const content of testContent) {
        const result = await ageManager.validateContent(content.text, '4-6');
        expect(result.isAppropriate).toBe(content.appropriate);
      }
    });

    it('should validate content for age group 7-9', async () => {
      const testContent = [
        { text: 'The adventure was exciting', appropriate: true },
        { text: 'Mild danger approached', appropriate: true },
        { text: 'Graphic violence ensued', appropriate: false },
        { text: 'They solved the puzzle together', appropriate: true }
      ];

      for (const content of testContent) {
        const result = await ageManager.validateContent(content.text, '7-9');
        expect(result.isAppropriate).toBe(content.appropriate);
      }
    });

    it('should validate content for age group 10-12', async () => {
      const testContent = [
        { text: 'The mystery deepened', appropriate: true },
        { text: 'Romantic feelings emerged', appropriate: true },
        { text: 'Explicit content', appropriate: false },
        { text: 'Complex moral dilemmas', appropriate: true }
      ];

      for (const content of testContent) {
        const result = await ageManager.validateContent(content.text, '10-12');
        expect(result.isAppropriate).toBe(content.appropriate);
      }
    });

    it('should validate content for age group 13+', async () => {
      const testContent = [
        { text: 'Mature themes explored', appropriate: true },
        { text: 'Complex relationships', appropriate: true },
        { text: 'Philosophical questions', appropriate: true },
        { text: 'Age-appropriate romance', appropriate: true }
      ];

      for (const content of testContent) {
        const result = await ageManager.validateContent(content.text, '13+');
        expect(result.isAppropriate).toBe(content.appropriate);
      }
    });
  });

  describe('Vocabulary Adaptation', () => {
    it('should adapt vocabulary for different age groups', async () => {
      const complexText = 'The protagonist contemplated the existential implications of their predicament';
      
      const adapted4_6 = await ageManager.adaptVocabulary(complexText, '4-6');
      const adapted7_9 = await ageManager.adaptVocabulary(complexText, '7-9');
      const adapted10_12 = await ageManager.adaptVocabulary(complexText, '10-12');
      const adapted13Plus = await ageManager.adaptVocabulary(complexText, '13+');
      
      // Check word complexity decreases for younger ages
      expect(adapted4_6.averageWordLength).toBeLessThan(adapted13Plus.averageWordLength);
      expect(adapted4_6.text).toContain('thought about');
      expect(adapted13Plus.text).toContain('contemplated');
    });

    it('should maintain sentence complexity appropriate to age', async () => {
      const complexSentence = 'Despite the overwhelming odds against them, the brave adventurers, who had traveled from distant lands, decided to continue their perilous journey through the enchanted forest.';
      
      const adapted4_6 = await ageManager.adaptSentenceStructure(complexSentence, '4-6');
      const adapted10_12 = await ageManager.adaptSentenceStructure(complexSentence, '10-12');
      
      // Younger age groups should have shorter sentences
      expect(adapted4_6.sentences.length).toBeGreaterThan(1);
      expect(adapted4_6.maxWordsPerSentence).toBeLessThan(15);
      expect(adapted10_12.maxWordsPerSentence).toBeLessThan(25);
    });
  });

  describe('Theme Filtering', () => {
    it('should filter inappropriate themes by age', async () => {
      const themes = [
        'friendship', 'adventure', 'death', 'violence', 
        'romance', 'betrayal', 'magic', 'war'
      ];

      const filtered4_6 = await ageManager.filterThemes(themes, '4-6');
      const filtered13Plus = await ageManager.filterThemes(themes, '13+');
      
      expect(filtered4_6).toContain('friendship');
      expect(filtered4_6).toContain('adventure');
      expect(filtered4_6).not.toContain('death');
      expect(filtered4_6).not.toContain('violence');
      
      expect(filtered13Plus).toContain('romance');
      expect(filtered13Plus).toContain('betrayal');
    });

    it('should suggest age-appropriate alternatives', async () => {
      const inappropriateThemes = {
        '4-6': ['violence', 'death'],
        '7-9': ['graphic violence', 'horror'],
        '10-12': ['explicit content']
      };

      for (const [ageGroup, themes] of Object.entries(inappropriateThemes)) {
        const alternatives = await ageManager.suggestAlternatives(themes, ageGroup);
        
        expect(alternatives).toBeDefined();
        expect(alternatives.length).toBeGreaterThan(0);
        
        // Verify alternatives are appropriate
        for (const alt of alternatives) {
          const validation = await ageManager.validateContent(alt, ageGroup);
          expect(validation.isAppropriate).toBe(true);
        }
      }
    });
  });

  describe('Complexity Scoring', () => {
    it('should calculate reading level accurately', async () => {
      const texts = [
        { text: 'The cat sat on the mat.', expectedLevel: '4-6' },
        { text: 'The adventurous explorer discovered ancient ruins.', expectedLevel: '7-9' },
        { text: 'The protagonist\'s internal conflict manifested through subtle actions.', expectedLevel: '10-12' },
        { text: 'Existential philosophy permeated the narrative\'s underlying themes.', expectedLevel: '13+' }
      ];

      for (const { text, expectedLevel } of texts) {
        const level = await ageManager.calculateReadingLevel(text);
        expect(level).toBe(expectedLevel);
      }
    });

    it('should score emotional complexity', async () => {
      const scenarios = [
        { 
          text: 'Happy bunny plays', 
          ageGroup: '4-6',
          expectedComplexity: 'simple'
        },
        { 
          text: 'Feeling both excited and nervous about the competition', 
          ageGroup: '7-9',
          expectedComplexity: 'moderate'
        },
        { 
          text: 'Conflicted between loyalty to friends and personal ambition', 
          ageGroup: '10-12',
          expectedComplexity: 'complex'
        }
      ];

      for (const scenario of scenarios) {
        const complexity = await ageManager.assessEmotionalComplexity(scenario.text, scenario.ageGroup);
        expect(complexity).toBe(scenario.expectedComplexity);
      }
    });
  });

  describe('Content Modification', () => {
    it('should sanitize content for younger audiences', async () => {
      const originalContent = 'The warrior fought fiercely in the bloody battle';
      
      const sanitized4_6 = await ageManager.sanitizeContent(originalContent, '4-6');
      const sanitized10_12 = await ageManager.sanitizeContent(originalContent, '10-12');
      
      expect(sanitized4_6).not.toContain('bloody');
      expect(sanitized4_6).not.toContain('fiercely');
      expect(sanitized10_12).toContain('battle');
    });

    it('should add age-appropriate descriptions', async () => {
      const baseScene = 'The character entered the forest';
      
      const enhanced4_6 = await ageManager.enhanceDescription(baseScene, '4-6');
      const enhanced13Plus = await ageManager.enhanceDescription(baseScene, '13+');
      
      // Younger audiences get simpler, more colorful descriptions
      expect(enhanced4_6).toMatch(/bright|colorful|friendly|happy/i);
      
      // Older audiences get more atmospheric descriptions
      expect(enhanced13Plus).toMatch(/mysterious|ancient|foreboding|atmospheric/i);
    });
  });

  describe('Educational Value', () => {
    it('should incorporate age-appropriate learning elements', async () => {
      const educationalElements = await ageManager.getEducationalElements('4-6');
      
      expect(educationalElements).toContain('counting');
      expect(educationalElements).toContain('colors');
      expect(educationalElements).toContain('shapes');
      expect(educationalElements).not.toContain('algebra');
    });

    it('should suggest vocabulary expansions by age', async () => {
      const baseWord = 'big';
      
      const expansions4_6 = await ageManager.suggestVocabularyExpansions(baseWord, '4-6');
      const expansions10_12 = await ageManager.suggestVocabularyExpansions(baseWord, '10-12');
      
      expect(expansions4_6).toContain('huge');
      expect(expansions4_6).toContain('giant');
      
      expect(expansions10_12).toContain('enormous');
      expect(expansions10_12).toContain('colossal');
      expect(expansions10_12).toContain('immense');
    });
  });

  describe('Safety Checks', () => {
    it('should detect and flag inappropriate content', async () => {
      const testCases = [
        { content: 'violent graphic scene', ageGroup: '4-6', shouldFlag: true },
        { content: 'friendly adventure', ageGroup: '4-6', shouldFlag: false },
        { content: 'mild scary moment', ageGroup: '7-9', shouldFlag: false },
        { content: 'explicit content', ageGroup: '13+', shouldFlag: true }
      ];

      for (const testCase of testCases) {
        const result = await ageManager.performSafetyCheck(testCase.content, testCase.ageGroup);
        expect(result.flagged).toBe(testCase.shouldFlag);
      }
    });

    it('should provide content warnings when appropriate', async () => {
      const content = 'The story contains mild suspense and adventure';
      
      const warnings4_6 = await ageManager.generateContentWarnings(content, '4-6');
      const warnings10_12 = await ageManager.generateContentWarnings(content, '10-12');
      
      expect(warnings4_6.length).toBeGreaterThan(0);
      expect(warnings10_12.length).toBe(0);
    });
  });

  describe('Metrics and Scoring', () => {
    it('should calculate age appropriateness score', async () => {
      const story = {
        text: 'A simple story about friendship and sharing',
        themes: ['friendship', 'sharing'],
        vocabulary: ['simple', 'words'],
        sentenceComplexity: 'low'
      };

      const score4_6 = await ageManager.calculateAppropriatenessScore(story, '4-6');
      const score13Plus = await ageManager.calculateAppropriatenessScore(story, '13+');
      
      expect(score4_6).toBeGreaterThan(90);
      expect(score13Plus).toBeLessThan(50); // Too simple for older audience
    });

    it('should track adaptation effectiveness', async () => {
      const originalText = 'Complex philosophical narrative';
      const adaptedText = await ageManager.adaptContent(originalText, '7-9');
      
      const effectiveness = await ageManager.measureAdaptationEffectiveness(
        originalText,
        adaptedText,
        '7-9'
      );
      
      expect(effectiveness.readabilityImprovement).toBeGreaterThan(0);
      expect(effectiveness.ageAppropriatenessScore).toBeGreaterThan(80);
    });
  });
});