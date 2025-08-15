/**
 * Story Context Manager - Handles narrative consistency across story segments
 */

import { StoryBible, Character, StoryWorld, SegmentContext, StoryContextSummary } from '@/types/storyContext';
import { StorySegmentRow } from '@/types/stories';
import { supabase } from '@/integrations/supabase/client';

export class StoryContextManager {
  /**
   * Extract characters, settings, and key facts from story text
   */
  static extractStoryElements(text: string, segmentNumber: number): SegmentContext {
    // Simple regex-based extraction (could be enhanced with NLP)
    const characterMatches = text.match(/[A-Z][a-z]+ (the [a-z]+|[A-Z][a-z]+)/g) || [];
    const settingMatches = text.match(/(at the|in the|near the) ([a-z ]+)/gi) || [];
    
    const extractedCharacters: Character[] = characterMatches.slice(0, 3).map((match, index) => ({
      id: `char_${segmentNumber}_${index}`,
      name: match.split(' ')[0],
      species: match.includes(' the ') ? match.split(' the ')[1] : 'human',
      role: index === 0 ? 'protagonist' : 'companion',
      firstAppeared: segmentNumber
    }));

    const extractedSettings = settingMatches.map(match => 
      match.replace(/(at the|in the|near the)/i, '').trim()
    );

    // Extract key facts (things that happen, rules established)
    const factPatterns = [
      /can [a-z ]+/gi,
      /cannot [a-z ]+/gi,
      /always [a-z ]+/gi,
      /never [a-z ]+/gi,
      /is [a-z ]+ (magical|special|powerful)/gi
    ];
    
    const extractedFacts: string[] = [];
    factPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      extractedFacts.push(...matches.slice(0, 2)); // Limit to avoid noise
    });

    return {
      segmentNumber,
      text,
      extractedCharacters,
      extractedSettings,
      extractedFacts
    };
  }

  /**
   * Create a comprehensive story bible from all segments
   */
  static async createStoryBible(storyId: string, segments: StorySegmentRow[]): Promise<StoryBible> {
    console.log('[StoryContextManager] Creating story bible for:', storyId);
    
    const allCharacters: Character[] = [];
    const allSettings: string[] = [];
    const allFacts: string[] = [];
    
    // Process each segment
    segments.forEach((segment, index) => {
      const context = this.extractStoryElements(segment.segment_text, index + 1);
      
      // Merge characters (avoid duplicates by name)
      context.extractedCharacters.forEach(char => {
        const existing = allCharacters.find(c => 
          c.name.toLowerCase() === char.name.toLowerCase()
        );
        if (!existing) {
          allCharacters.push(char);
        } else {
          // Merge traits if same character appears again
          if (char.traits && existing.traits) {
            existing.traits = [...new Set([...existing.traits, ...char.traits])];
          }
        }
      });
      
      allSettings.push(...context.extractedSettings);
      allFacts.push(...context.extractedFacts);
    });

    // Determine primary setting
    const settingCounts: { [key: string]: number } = {};
    allSettings.forEach(setting => {
      const normalized = setting.toLowerCase().trim();
      settingCounts[normalized] = (settingCounts[normalized] || 0) + 1;
    });
    
    const primarySetting = Object.keys(settingCounts).reduce((a, b) => 
      settingCounts[a] > settingCounts[b] ? a : b
    ) || 'unknown location';

    // Get story metadata
    const { data: storyData } = await supabase
      .from('stories')
      .select('story_mode, target_age, title')
      .eq('id', storyId)
      .single();

    const storyBible: StoryBible = {
      storyId,
      title: storyData?.title || 'Untitled Story',
      genre: storyData?.story_mode || 'fantasy',
      targetAge: storyData?.target_age || '7-9',
      characters: allCharacters,
      world: {
        setting: primarySetting,
        location: primarySetting,
        rules: [...new Set(allFacts)].slice(0, 5) // Keep top 5 unique facts
      },
      plotThreads: segments.map(s => s.segment_text.substring(0, 100) + '...'),
      establishedFacts: [...new Set(allFacts)],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('[StoryContextManager] Story bible created:', {
      charactersCount: storyBible.characters.length,
      setting: storyBible.world.setting,
      factsCount: storyBible.establishedFacts.length
    });

    return storyBible;
  }

  /**
   * Generate a concise context summary for AI prompting
   */
  static generateContextSummary(storyBible: StoryBible, recentSegments: StorySegmentRow[]): StoryContextSummary {
    const summary: StoryContextSummary = {
      characterRegistry: storyBible.characters,
      worldState: storyBible.world,
      keyEvents: recentSegments.slice(-3).map(s => s.segment_text.substring(0, 150)),
      establishedRules: storyBible.establishedFacts.slice(0, 3),
      narrativeStyle: `${storyBible.genre} story for age ${storyBible.targetAge}`,
      totalSegments: recentSegments.length
    };

    return summary;
  }

  /**
   * Build enhanced AI prompt with consistency instructions
   */
  static buildConsistencyPrompt(
    basePrompt: string, 
    contextSummary: StoryContextSummary,
    choiceText?: string
  ): string {
    let enhancedPrompt = basePrompt;

    // Add character consistency instructions
    if (contextSummary.characterRegistry.length > 0) {
      enhancedPrompt += `\n\n=== CHARACTER REGISTRY (MAINTAIN CONSISTENCY) ===`;
      contextSummary.characterRegistry.forEach(char => {
        enhancedPrompt += `\n• ${char.name}`;
        if (char.species && char.species !== 'human') {
          enhancedPrompt += ` (${char.species})`;
        }
        if (char.role) {
          enhancedPrompt += ` - ${char.role}`;
        }
        if (char.description) {
          enhancedPrompt += ` - ${char.description}`;
        }
      });
      
      enhancedPrompt += `\n\nCRITICAL: These characters MUST remain consistent throughout the story. Never change their species, core traits, or names.`;
    }

    // Add world consistency instructions
    if (contextSummary.worldState.setting) {
      enhancedPrompt += `\n\n=== WORLD CONSISTENCY ===`;
      enhancedPrompt += `\nSetting: ${contextSummary.worldState.setting}`;
      enhancedPrompt += `\nLocation: ${contextSummary.worldState.location}`;
      
      if (contextSummary.worldState.rules && contextSummary.worldState.rules.length > 0) {
        enhancedPrompt += `\nEstablished Rules:`;
        contextSummary.worldState.rules.forEach(rule => {
          enhancedPrompt += `\n• ${rule}`;
        });
      }
      
      enhancedPrompt += `\n\nCRITICAL: Maintain the established setting and world rules. Do not suddenly change locations without narrative justification.`;
    }

    // Add recent context
    if (contextSummary.keyEvents.length > 0) {
      enhancedPrompt += `\n\n=== RECENT STORY CONTEXT ===`;
      contextSummary.keyEvents.forEach((event, index) => {
        enhancedPrompt += `\nSegment ${contextSummary.totalSegments - contextSummary.keyEvents.length + index + 1}: ${event}`;
      });
    }

    // Add choice context
    if (choiceText) {
      enhancedPrompt += `\n\n=== STORY CONTINUATION ===`;
      enhancedPrompt += `\nContinue from the previous segment based on this choice: "${choiceText}"`;
      enhancedPrompt += `\nMaintain narrative flow and character consistency.`;
    }

    // Add consistency validation rules
    enhancedPrompt += `\n\n=== CONSISTENCY RULES (MANDATORY) ===`;
    enhancedPrompt += `\n1. NEVER change established character names, species, or core traits`;
    enhancedPrompt += `\n2. NEVER randomly change the story setting or location`;
    enhancedPrompt += `\n3. ALWAYS maintain established world rules and logic`;
    enhancedPrompt += `\n4. IF unsure about a detail, maintain consistency with previous descriptions`;
    enhancedPrompt += `\n5. Characters who are animals must REMAIN animals, humans must REMAIN humans`;
    enhancedPrompt += `\n6. The setting established in earlier segments must continue unless plot demands a justified change`;

    return enhancedPrompt;
  }

  /**
   * Store story bible in database for persistence
   */
  static async saveStoryBible(storyBible: StoryBible): Promise<void> {
    try {
      const { error } = await supabase
        .from('story_visual_state')
        .upsert({
          story_id: storyBible.storyId,
          character_descriptions: {
            characters: storyBible.characters,
            world: storyBible.world,
            establishedFacts: storyBible.establishedFacts
          },
          style_hint: storyBible.visualStyle || 'consistent character design',
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('[StoryContextManager] Failed to save story bible:', error);
      } else {
        console.log('[StoryContextManager] Story bible saved successfully');
      }
    } catch (error) {
      console.error('[StoryContextManager] Error saving story bible:', error);
    }
  }

  /**
   * Load existing story bible from database
   */
  static async loadStoryBible(storyId: string): Promise<StoryBible | null> {
    try {
      const { data } = await supabase
        .from('story_visual_state')
        .select('character_descriptions, style_hint')
        .eq('story_id', storyId)
        .single();

      if (data?.character_descriptions) {
        // Reconstruct story bible from stored data
        const storedData = data.character_descriptions as any;
        return {
          storyId,
          title: 'Loaded Story',
          genre: 'fantasy',
          targetAge: '7-9',
          characters: storedData.characters || [],
          world: storedData.world || { setting: '', location: '' },
          plotThreads: [],
          establishedFacts: storedData.establishedFacts || [],
          visualStyle: data.style_hint,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('[StoryContextManager] Error loading story bible:', error);
    }
    
    return null;
  }
}