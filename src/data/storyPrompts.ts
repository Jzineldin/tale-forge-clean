// Story prompts organized by child-friendly genres
export const storyPrompts: Record<string, string[]> = {
  'bedtime-stories': [
    "A sleepy little bunny finds a magical star that grants one gentle wish before bedtime.",
    "A cozy teddy bear comes to life to help a child who can't fall asleep.",
    "The moon decides to visit Earth for one special night to help children have sweet dreams.",
    "A gentle firefly guides lost baby animals safely back to their families.",
    "A kind cloud discovers it can make the softest, warmest blankets for sleeping children."
  ],
  'fantasy-magic': [
    "A young apprentice wizard accidentally turns all the vegetables in the garden into friendly creatures.",
    "A magical library where books come alive and help children solve problems with kindness.",
    "A friendly dragon who loves to bake cookies teams up with a child to open a magical bakery.",
    "A unicorn loses its rainbow mane and needs help from woodland friends to find it.",
    "A magic paintbrush creates anything you draw, but only things that make others happy."
  ],
  'adventure-exploration': [
    "A treasure map leads to a playground where every piece of equipment holds a fun surprise.",
    "Explorers discover an island where all the animals are friendly and love to play games.",
    "A hot air balloon adventure takes children around the world to help animals in need.",
    "Young adventurers find a secret cave filled with crystals that sing beautiful melodies.",
    "A group of friends build a treehouse that becomes a portal to amazing places."
  ],
  'mystery-detective': [
    "The case of the missing cookies from the school bake sale - who could have taken them?",
    "A young detective solves the mystery of why all the library books keep rearranging themselves.",
    "Someone has been leaving beautiful drawings around town, but who is this secret artist?",
    "The puzzle of the singing flowers in the school garden - what makes them so musical?",
    "A child detective helps find a lost pet using clever clues and helpful neighbors."
  ],
  'science-space': [
    "A friendly alien visits Earth to learn about friendship and kindness from children.",
    "Young space explorers discover a planet where everything is made of crystals and music.",
    "A robot learns about emotions by spending a day at a school with curious students.",
    "Children build a rocket ship in their backyard and journey to a planet of gentle giants.",
    "A space station for animals needs help from Earth kids to solve problems with teamwork."
  ],
  'educational-stories': [
    "A time-traveling adventure teaches children about different cultures around the world.",
    "A magical number garden where math problems bloom into beautiful flowers when solved.",
    "Animals in the zoo teach children about their habitats through fun games and songs.",
    "A young scientist discovers that kindness is the most powerful force in nature.",
    "A library adventure where children learn history by meeting friendly characters from the past."
  ],
  'values-lessons': [
    "A child learns the importance of honesty when they find someone's lost wallet.",
    "Two friends who are very different discover that their differences make them stronger together.",
    "A young helper learns that small acts of kindness can make a big difference in their community.",
    "A child who feels left out discovers their unique talents when they help organize a school event.",
    "A story about patience as a child learns to grow their own garden and care for it daily."
  ],
  'silly-humor': [
    "A giraffe tries to hide from its friends but keeps getting its head stuck in funny places.",
    "The day all the zoo animals decided to switch jobs and chaos (but fun) ensued.",
    "A clumsy superhero whose powers always work backwards but saves the day anyway.",
    "A talking sandwich that keeps trying to escape being eaten by telling terrible jokes.",
    "A family of penguins moves to the desert and hilarious misadventures begin."
  ]
};

// Context-aware AI prompting instructions for each genre
export const genreContextInstructions: Record<string, string> = {
  'bedtime-stories': `Create a gentle, soothing story with:
    - Calm, peaceful tone and language
    - Simple vocabulary appropriate for ages 4-8
    - Reassuring themes that promote feelings of safety and comfort
    - Soft imagery and cozy settings
    - Happy, peaceful endings that help children feel relaxed
    - No scary or exciting elements that might keep children awake`,

  'fantasy-magic': `Create an enchanting fantasy story with:
    - Kid-friendly magic that solves problems through kindness
    - Whimsical characters and magical creatures that are friendly
    - Vocabulary appropriate for ages 5-12
    - Moral lessons woven naturally into the adventure
    - Colorful, imaginative settings that spark creativity
    - Magic used for helping others, not for conflict`,

  'adventure-exploration': `Create an exciting adventure story with:
    - Age-appropriate thrills and discoveries
    - Positive role models who solve problems through teamwork
    - Educational elements about different places or cultures
    - Vocabulary suitable for ages 6-12
    - Emphasis on curiosity, bravery, and friendship
    - Safe adventures with positive outcomes`,

  'mystery-detective': `Create a child-friendly mystery with:
    - Gentle puzzles and clues appropriate for young minds
    - No scary or dangerous elements
    - Problem-solving through observation and logical thinking
    - Vocabulary accessible to ages 7-12
    - Mysteries that teach important lessons about truth and justice
    - Satisfying solutions that children can understand`,

  'science-space': `Create an educational sci-fi story with:
    - Simple STEM concepts explained through story
    - Friendly technology and space elements
    - Vocabulary that introduces scientific terms appropriately for ages 6-12
    - Positive portrayal of science and learning
    - Characters who solve problems through curiosity and experimentation
    - Inspiring wonder about science and space exploration`,

  'educational-stories': `Create a learning-focused story with:
    - Clear educational content woven into an engaging narrative
    - Facts and concepts appropriate for the intended age group (5-12)
    - Interactive elements that encourage participation
    - Real-world applications of the learning concepts
    - Vocabulary that teaches while entertaining
    - Encouragement of curiosity and continued learning`,

  'values-lessons': `Create a character-building story with:
    - Clear moral lessons demonstrated through character actions
    - Relatable situations children might face in real life
    - Positive role models who make good choices
    - Vocabulary appropriate for ages 4-12
    - Emphasis on empathy, kindness, honesty, and other important values
    - Natural consequences that help children understand right from wrong`,

  'silly-humor': `Create a funny, lighthearted story with:
    - Age-appropriate humor that children find genuinely funny
    - Silly situations and characters that make children laugh
    - Simple vocabulary with playful language and wordplay
    - Physical comedy and absurd situations
    - Positive humor that doesn't make fun of others
    - Upbeat, energetic tone that brings joy and laughter`
};

// Helper function to get random prompt for a genre
export const getRandomPrompt = (genreId: string): string => {
  const prompts = storyPrompts[genreId];
  if (!prompts || prompts.length === 0) {
    return "Create a wonderful story that brings joy and learning to children.";
  }
  return prompts[Math.floor(Math.random() * prompts.length)];
};

// Helper function to get context instructions for a genre
export const getGenreInstructions = (genreId: string): string => {
  return genreContextInstructions[genreId] || "Create an age-appropriate story that entertains and educates children.";
};

// Helper function to get prompts for a specific story mode
export const getPromptsForStoryMode = (storyMode: string): string[] => {
  return storyPrompts[storyMode] || [];
};
