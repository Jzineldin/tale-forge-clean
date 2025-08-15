/**
 * Enhanced Story Context Types for Narrative Consistency
 */

export interface Character {
  id: string;
  name: string;
  species?: string;
  role: 'protagonist' | 'sidekick' | 'companion' | 'custom';
  description?: string;
  traits?: string[];
  appearance?: string;
  firstAppeared?: number; // segment number
}

export interface StoryWorld {
  setting: string;
  location: string;
  timeOfDay?: string;
  mood?: string;
  rules?: string[]; // magical rules, world physics, etc.
}

export interface StoryBible {
  storyId: string;
  title?: string;
  genre: string;
  targetAge: string;
  characters: Character[];
  world: StoryWorld;
  plotThreads: string[];
  establishedFacts: string[];
  visualStyle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentContext {
  segmentNumber: number;
  text: string;
  imagePrompt?: string;
  extractedCharacters: Character[];
  extractedSettings: string[];
  extractedFacts: string[];
}

export interface StoryContextSummary {
  characterRegistry: Character[];
  worldState: StoryWorld;
  keyEvents: string[];
  establishedRules: string[];
  narrativeStyle: string;
  totalSegments: number;
}