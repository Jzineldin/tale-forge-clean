// src/lib/voices.ts

export interface Voice {
  id: string;
  name: string;
  description: string;
  gender: 'Male' | 'Female';
  accent?: string;
  testAudio?: string; // Base64 encoded test audio
}

// Temporary placeholder audio - we'll replace this with real generated audio
// For now, we'll use a fallback approach since the placeholder isn't working

// THIS IS NOW THE SINGLE SOURCE OF TRUTH FOR ALL VOICES IN THE APP
export const STORYTELLER_VOICES: Voice[] = [
  {
    id: 'A9evEp8yGjv4c3WsIKuY',
    name: 'Kevin - Founder',
    gender: 'Male',
    description: 'Warm, friendly voice perfect for storytelling',
  },
  {
    id: 'fCxG8OHm4STbIsWe4aT9',
    name: 'Rachel',
    gender: 'Female',
    description: 'Clear, expressive voice ideal for children\'s stories',
  },
  {
    id: 'pFQStpMdprGFILRDrWR2',
    name: 'Domi',
    gender: 'Female',
    description: 'Confident, engaging voice for adventure stories',
  },
  {
    id: '8quEMRkSpwEaWBzHvTLv',
    name: 'Bella',
    gender: 'Female',
    description: 'Gentle, soothing voice perfect for bedtime stories',
  },
  {
    id: 'XXphLKNRxvJ1Qa95KBhX',
    name: 'Antoni',
    gender: 'Male',
    description: 'Warm, deep voice perfect for dramatic storytelling',
  },
  {
    id: 'IsEXLHzSvLH9UMB6SLHj',
    name: 'Arnold',
    gender: 'Male',
    description: 'Strong, confident voice ideal for action stories',
  },
  {
    id: 'FWipwLM0YqCuwisLprpU',
    name: 'Adam',
    gender: 'Male',
    description: 'Clear, versatile voice suitable for any story type',
  },
  {
    id: 'LfjSv1XCdZ96k4B1jNJl',
    name: 'Sam',
    gender: 'Male',
    description: 'Friendly, engaging voice perfect for children\'s content',
  }
];

// Function to play test audio without API calls
export const playVoiceTest = (voice: Voice): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!voice.testAudio) {
      // For now, show a message that test audio isn't available yet
      console.log(`🎵 No test audio available for ${voice.name} yet`);
      reject(new Error('Test audio not yet generated. Use the "Generate Voice Narration" button to hear this voice.'));
      return;
    }

    try {
      const audio = new Audio(voice.testAudio);
      audio.volume = 0.8;
      
      audio.addEventListener('canplay', () => {
        console.log(`🎵 Playing test audio for ${voice.name}`);
      });
      
      audio.addEventListener('ended', () => {
        console.log(`🎵 Test audio finished for ${voice.name}`);
        resolve();
      });
      
      audio.addEventListener('error', (e) => {
        console.error(`🎵 Audio error for ${voice.name}:`, e);
        reject(new Error('Audio playback failed'));
      });
      
      audio.play().catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}; 