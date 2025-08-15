export type SeedList = string[];

export function askSeeds(
  age: string,
  genre: string,
  count = 3
): SeedList {
  // Use fallback seeds - no API call needed
  const seeds = getFallbackSeeds(age, genre, count);
  
  console.log('🌱 Live seeds generated:', { age, genre, seeds });
  return seeds;
}

// Fallback seeds in case API is unavailable
function getFallbackSeeds(_age: string, genre: string, count: number): SeedList {
  const fallbacks: Record<string, string[]> = {
    'bedtime-stories': [
      'A magical moonbeam visits your bedroom',
      'Your stuffed animals come to life at midnight',
      'A friendly cloud floats down to your window'
    ],
    'fantasy-and-magic': [
      'A magical door appears in your bedroom wall',
      'You discover your pet can talk',
      'An ancient book opens by itself'
    ],
    'adventure-and-exploration': [
      'Your grandfather\'s compass points to treasure',
      'You find a map in the attic',
      'A mysterious invitation arrives'
    ],
    'mystery-and-detective': [
      'Every library book contains a hidden message',
      'Your toys are arranged differently each morning',
      'A friendly ghost needs help solving a mystery'
    ],
    'science-fiction-and-space': [
      'Your smartphone receives messages from the future',
      'You wake up on a friendly space station',
      'A tiny alien crash-lands in your backyard'
    ],
    'educational-stories': [
      'You shrink down to explore the human body',
      'A time machine takes you to ancient Egypt',
      'You become friends with a teaching robot'
    ],
    'values-and-life-lessons': [
      'You meet a sad new student at school',
      'You find a wallet full of money',
      'Your words have the power to help others'
    ],
    'silly-and-humorous': [
      'Your pet goldfish becomes a comedian',
      'Gravity works backwards in your house',
      'Your shadow has a mind of its own'
    ]
  };

  const genreSeeds = fallbacks[genre] || fallbacks['fantasy-and-magic'];
  return genreSeeds.slice(0, count);
} 