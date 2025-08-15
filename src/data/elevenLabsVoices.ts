// ElevenLabs Voice Mappings for TaleForge
// This file now serves as a template and fallback for voice categorization
// Actual voices are fetched dynamically from the ElevenLabs API

export interface ElevenLabsVoice {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'free' | 'premium' | 'professional';
  gender: 'male' | 'female' | 'neutral';
  age: 'young' | 'middle' | 'mature';
  accent: string;
  suitableFor: string[];
  cost: 'included' | 'standard' | 'premium';
  costNote?: string;
}

// Template voices for categorization - these are examples and may not exist in your account
// The actual voices will be fetched dynamically from ElevenLabs API
export const storytellingVoices: ElevenLabsVoice[] = [
  // FREE TIER - Included in all plans (example voices)
  {
    id: 'example-free-1',
    name: 'Example Free Voice 1',
    displayName: 'Example Free Voice 1 (Storyteller)',
    description: 'Example free voice for storytelling',
    category: 'free',
    gender: 'male',
    age: 'young',
    accent: 'American',
    suitableFor: ['adventure', 'action', 'fantasy', 'sci-fi'],
    cost: 'included'
  },
  {
    id: 'example-free-2',
    name: 'Example Free Voice 2',
    displayName: 'Example Free Voice 2 (Narrator)',
    description: 'Example free voice for narration',
    category: 'free',
    gender: 'female',
    age: 'young',
    accent: 'American',
    suitableFor: ['children', 'romance', 'drama', 'educational'],
    cost: 'included'
  },

  // PREMIUM TIER - Standard pricing (example voices)
  {
    id: 'example-premium-1',
    name: 'Example Premium Voice 1',
    displayName: 'Example Premium Voice 1 (Professional)',
    description: 'Example premium voice for professional content',
    category: 'premium',
    gender: 'male',
    age: 'middle',
    accent: 'British',
    suitableFor: ['historical', 'mystery', 'fantasy', 'classic literature'],
    cost: 'standard'
  },
  {
    id: 'example-premium-2',
    name: 'Example Premium Voice 2',
    displayName: 'Example Premium Voice 2 (Expressive)',
    description: 'Example premium voice for expressive content',
    category: 'premium',
    gender: 'female',
    age: 'young',
    accent: 'American',
    suitableFor: ['inspirational', 'children', 'educational', 'motivational'],
    cost: 'standard'
  },

  // PROFESSIONAL TIER - Higher quality (example voice)
  {
    id: 'example-professional-1',
    name: 'Example Professional Voice 1',
    displayName: 'Example Professional Voice 1 (Character)',
    description: 'Example professional voice for unique storytelling',
    category: 'professional',
    gender: 'male',
    age: 'mature',
    accent: 'American',
    suitableFor: ['character-driven', 'comedy', 'unique', 'experimental'],
    cost: 'premium',
    costNote: 'Professional voice - may incur additional costs'
  }
];

// Legacy voice mapping for backwards compatibility
// This will be populated with actual voice IDs from your ElevenLabs account
export const legacyVoiceMapping: Record<string, string> = {
  // These will be dynamically populated based on your actual ElevenLabs voices
  'fable': 'default-voice-id',
  'alloy': 'default-voice-id',
  'echo': 'default-voice-id',
  'onyx': 'default-voice-id',
  'nova': 'default-voice-id',
  'shimmer': 'default-voice-id'
};

// Get voice by ID
export const getVoiceById = (voiceId: string): ElevenLabsVoice | undefined => {
  return storytellingVoices.find(voice => voice.id === voiceId);
};

// Get voices by category
export const getVoicesByCategory = (category: 'free' | 'premium' | 'professional'): ElevenLabsVoice[] => {
  return storytellingVoices.filter(voice => voice.category === category);
};

// Get voices suitable for specific story types
export const getVoicesForStoryType = (storyType: string): ElevenLabsVoice[] => {
  return storytellingVoices.filter(voice => 
    voice.suitableFor.includes(storyType) || voice.suitableFor.includes('general')
  );
};

// Default voice for new users (will be set dynamically)
export const defaultVoice = storytellingVoices[0];

// Function to update legacy voice mapping with actual voice IDs
export const updateLegacyVoiceMapping = (actualVoices: any[]) => {
  // This function can be called to update the legacy mapping with real voice IDs
  // when voices are fetched from ElevenLabs API
  console.log('Updating legacy voice mapping with actual voices:', actualVoices);
};

// Function to categorize actual voices from ElevenLabs API
export const categorizeActualVoices = (voices: any[]): ElevenLabsVoice[] => {
  return voices.map((voice) => ({
    id: voice.voice_id,
    name: voice.name,
    displayName: `${voice.name} (${voice.category})`,
    description: voice.description || `Voice from your ElevenLabs account`,
    category: voice.category === 'premade' ? 'free' : 
              voice.category === 'professional' ? 'professional' : 'premium',
    gender: 'neutral', // Would need to be determined from voice characteristics
    age: 'middle', // Would need to be determined from voice characteristics
    accent: 'Unknown', // Would need to be determined from voice characteristics
    suitableFor: ['general'], // Would need to be determined from voice characteristics
    cost: voice.category === 'premade' ? 'included' : 
          voice.category === 'professional' ? 'premium' : 'standard'
  }));
}; 