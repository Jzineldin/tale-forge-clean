import { faker } from '@faker-js/faker';

export interface TestStory {
  id: string;
  title: string;
  prompt: string;
  ageGroup: '4-6' | '7-9' | '10-12' | '13+';
  genre: string[];
  characters: TestCharacter[];
  segments: TestSegment[];
  choices: TestChoice[];
  expectedOutcomes: ExpectedOutcomes;
}

export interface TestCharacter {
  id: string;
  name: string;
  type: string;
  appearance: string;
  personality: string[];
  abilities: string[];
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
}

export interface TestSegment {
  id: string;
  segmentNumber: number;
  text: string;
  choices: TestChoice[];
  imagePrompt: string;
  audioText: string;
  themes: string[];
  emotionalTone: string;
}

export interface TestChoice {
  id: string;
  text: string;
  type: 'action' | 'dialogue' | 'exploration' | 'puzzle' | 'moral';
  consequence: string;
  leadTo: string;
}

export interface ExpectedOutcomes {
  minCoherenceScore: number;
  minCharacterConsistency: number;
  minChoiceDiversity: number;
  minAgeAppropriateness: number;
  requiredThemes: string[];
  forbiddenContent: string[];
}

export class TestDataGenerator {
  private readonly ageGroupConfigs = {
    '4-6': {
      vocabularyLevel: 'simple',
      sentenceLength: { min: 3, max: 8 },
      themes: ['friendship', 'sharing', 'kindness', 'adventure', 'discovery'],
      forbiddenThemes: ['violence', 'death', 'romance', 'horror'],
      choiceComplexity: 'simple',
      storyLength: { min: 3, max: 5 }
    },
    '7-9': {
      vocabularyLevel: 'intermediate',
      sentenceLength: { min: 5, max: 12 },
      themes: ['courage', 'problem-solving', 'teamwork', 'mystery', 'growth'],
      forbiddenThemes: ['graphic violence', 'horror', 'complex romance'],
      choiceComplexity: 'moderate',
      storyLength: { min: 4, max: 7 }
    },
    '10-12': {
      vocabularyLevel: 'advanced',
      sentenceLength: { min: 7, max: 15 },
      themes: ['identity', 'justice', 'complex friendships', 'moral dilemmas', 'adventure'],
      forbiddenThemes: ['explicit content', 'extreme violence'],
      choiceComplexity: 'complex',
      storyLength: { min: 5, max: 10 }
    },
    '13+': {
      vocabularyLevel: 'sophisticated',
      sentenceLength: { min: 8, max: 20 },
      themes: ['coming of age', 'moral ambiguity', 'relationships', 'social issues', 'philosophy'],
      forbiddenThemes: ['explicit adult content'],
      choiceComplexity: 'nuanced',
      storyLength: { min: 7, max: 12 }
    }
  };

  private readonly genreTemplates = {
    fantasy: {
      elements: ['magic', 'quest', 'mythical creatures', 'prophecy', 'ancient artifacts'],
      settings: ['enchanted forest', 'magical kingdom', 'dragon lair', 'wizard tower'],
      characterTypes: ['wizard', 'knight', 'elf', 'dragon', 'fairy']
    },
    mystery: {
      elements: ['clues', 'suspects', 'investigation', 'red herrings', 'revelation'],
      settings: ['mansion', 'library', 'detective office', 'crime scene'],
      characterTypes: ['detective', 'suspect', 'witness', 'victim', 'informant']
    },
    adventure: {
      elements: ['journey', 'treasure', 'danger', 'exploration', 'discovery'],
      settings: ['jungle', 'ancient ruins', 'mountain', 'ocean', 'desert'],
      characterTypes: ['explorer', 'guide', 'rival', 'mentor', 'companion']
    },
    'sci-fi': {
      elements: ['technology', 'space', 'aliens', 'time travel', 'AI'],
      settings: ['spaceship', 'alien planet', 'space station', 'future city'],
      characterTypes: ['astronaut', 'scientist', 'alien', 'robot', 'engineer']
    },
    educational: {
      elements: ['learning', 'discovery', 'problem-solving', 'facts', 'experiments'],
      settings: ['school', 'museum', 'laboratory', 'nature'],
      characterTypes: ['teacher', 'student', 'scientist', 'explorer']
    }
  };

  /**
   * Generate a complete test story with all components
   */
  generateTestStory(
    ageGroup: '4-6' | '7-9' | '10-12' | '13+',
    genres: string[],
    segmentCount: number = 5
  ): TestStory {
    const storyId = faker.string.uuid();
    const config = this.ageGroupConfigs[ageGroup];
    
    // Generate characters
    const characters = this.generateCharacters(genres, ageGroup);
    
    // Generate segments with choices
    const segments = this.generateSegments(segmentCount, ageGroup, genres, characters);
    
    // Extract all choices
    const allChoices = segments.flatMap(s => s.choices);
    
    return {
      id: storyId,
      title: this.generateTitle(genres, ageGroup),
      prompt: this.generatePrompt(genres, ageGroup, characters[0]),
      ageGroup,
      genre: genres,
      characters,
      segments,
      choices: allChoices,
      expectedOutcomes: this.generateExpectedOutcomes(ageGroup, genres)
    };
  }

  /**
   * Generate test characters
   */
  generateCharacters(genres: string[], ageGroup: string): TestCharacter[] {
    const characters: TestCharacter[] = [];
    const characterCount = ageGroup === '4-6' ? 2 : ageGroup === '13+' ? 5 : 3;
    
    for (let i = 0; i < characterCount; i++) {
      const role = i === 0 ? 'protagonist' : 
                   i === 1 ? 'antagonist' : 
                   faker.helpers.arrayElement(['supporting', 'minor']);
      
      characters.push(this.generateCharacter(genres[0], ageGroup, role));
    }
    
    return characters;
  }

  /**
   * Generate a single character
   */
  generateCharacter(
    genre: string,
    ageGroup: string,
    role: 'protagonist' | 'antagonist' | 'supporting' | 'minor'
  ): TestCharacter {
    const genreTemplate = this.genreTemplates[genre as keyof typeof this.genreTemplates];
    const characterType = faker.helpers.arrayElement(genreTemplate?.characterTypes || ['person']);
    
    return {
      id: faker.string.uuid(),
      name: this.generateCharacterName(ageGroup),
      type: characterType,
      appearance: this.generateAppearance(characterType, ageGroup),
      personality: this.generatePersonalityTraits(role, ageGroup),
      abilities: this.generateAbilities(characterType, genre),
      role
    };
  }

  /**
   * Generate character name appropriate for age group
   */
  private generateCharacterName(ageGroup: string): string {
    if (ageGroup === '4-6') {
      return faker.helpers.arrayElement([
        'Lily', 'Max', 'Luna', 'Sam', 'Sunny', 'Pip', 'Rosie', 'Ben'
      ]);
    } else if (ageGroup === '7-9') {
      return faker.helpers.arrayElement([
        'Alex', 'Emma', 'Oliver', 'Sophia', 'Jack', 'Mia', 'Lucas', 'Zoe'
      ]);
    } else {
      return faker.person.firstName();
    }
  }

  /**
   * Generate character appearance
   */
  private generateAppearance(characterType: string, ageGroup: string): string {
    const hairColor = faker.helpers.arrayElement(['brown', 'blonde', 'black', 'red']);
    const eyeColor = faker.helpers.arrayElement(['blue', 'green', 'brown', 'hazel']);
    
    if (ageGroup === '4-6') {
      return `${hairColor} hair, ${eyeColor} eyes, friendly smile`;
    } else if (characterType === 'wizard') {
      return `long ${hairColor} beard, ${eyeColor} eyes, pointed hat, flowing robes`;
    } else if (characterType === 'robot') {
      return `metallic body, glowing ${eyeColor} sensors, sleek design`;
    } else {
      const clothing = faker.helpers.arrayElement(['jacket', 'dress', 'uniform', 'cloak']);
      return `${hairColor} hair, ${eyeColor} eyes, wearing ${clothing}`;
    }
  }

  /**
   * Generate personality traits
   */
  private generatePersonalityTraits(role: string, ageGroup: string): string[] {
    const traits: Record<string, string[]> = {
      protagonist: ['brave', 'kind', 'curious', 'determined', 'loyal'],
      antagonist: ['cunning', 'ambitious', 'mysterious', 'powerful', 'clever'],
      supporting: ['helpful', 'wise', 'funny', 'caring', 'resourceful'],
      minor: ['friendly', 'observant', 'quiet', 'cheerful', 'cautious']
    };
    
    const ageAdjustedTraits = ageGroup === '4-6' 
      ? traits[role].filter(t => !['cunning', 'ambitious', 'mysterious'].includes(t))
      : traits[role];
    
    return faker.helpers.arrayElements(ageAdjustedTraits, 3);
  }

  /**
   * Generate character abilities
   */
  private generateAbilities(characterType: string, genre: string): string[] {
    const abilities: Record<string, string[]> = {
      wizard: ['magic spells', 'potion making', 'telepathy'],
      knight: ['swordfighting', 'horseback riding', 'leadership'],
      detective: ['deduction', 'observation', 'interrogation'],
      scientist: ['analysis', 'invention', 'problem-solving'],
      explorer: ['navigation', 'survival', 'climbing'],
      robot: ['computation', 'strength', 'data analysis']
    };
    
    return abilities[characterType] || ['problem-solving', 'communication'];
  }

  /**
   * Generate story segments
   */
  generateSegments(
    count: number,
    ageGroup: string,
    genres: string[],
    characters: TestCharacter[]
  ): TestSegment[] {
    const segments: TestSegment[] = [];
    const config = this.ageGroupConfigs[ageGroup as keyof typeof this.ageGroupConfigs];
    
    for (let i = 0; i < count; i++) {
      segments.push({
        id: faker.string.uuid(),
        segmentNumber: i + 1,
        text: this.generateSegmentText(i, count, ageGroup, genres, characters),
        choices: this.generateChoices(ageGroup, i === count - 1),
        imagePrompt: this.generateImagePrompt(genres, characters, i),
        audioText: this.generateAudioText(ageGroup),
        themes: faker.helpers.arrayElements(config.themes, 2),
        emotionalTone: this.generateEmotionalTone(i, count)
      });
    }
    
    return segments;
  }

  /**
   * Generate segment text
   */
  private generateSegmentText(
    segmentIndex: number,
    totalSegments: number,
    ageGroup: string,
    genres: string[],
    characters: TestCharacter[]
  ): string {
    const protagonist = characters.find(c => c.role === 'protagonist');
    const config = this.ageGroupConfigs[ageGroup as keyof typeof this.ageGroupConfigs];
    
    // Generate sentences based on age group
    const sentenceCount = faker.number.int({ 
      min: 3, 
      max: ageGroup === '4-6' ? 5 : ageGroup === '13+' ? 10 : 7 
    });
    
    const sentences: string[] = [];
    for (let i = 0; i < sentenceCount; i++) {
      const wordCount = faker.number.int(config.sentenceLength);
      const words = faker.lorem.words(wordCount);
      sentences.push(words.charAt(0).toUpperCase() + words.slice(1) + '.');
    }
    
    // Add character name to make it more realistic
    if (protagonist) {
      sentences[0] = sentences[0].replace(/^\w+/, protagonist.name);
    }
    
    return sentences.join(' ');
  }

  /**
   * Generate choices for a segment
   */
  generateChoices(ageGroup: string, isFinal: boolean = false): TestChoice[] {
    const choiceCount = ageGroup === '4-6' ? 2 : 3;
    const choices: TestChoice[] = [];
    
    const choiceTypes: Array<'action' | 'dialogue' | 'exploration' | 'puzzle' | 'moral'> = 
      ageGroup === '4-6' ? ['action', 'exploration'] :
      ageGroup === '13+' ? ['action', 'dialogue', 'moral', 'puzzle'] :
      ['action', 'dialogue', 'exploration'];
    
    for (let i = 0; i < choiceCount; i++) {
      const type = faker.helpers.arrayElement(choiceTypes);
      choices.push({
        id: faker.string.uuid(),
        text: this.generateChoiceText(type, ageGroup),
        type,
        consequence: this.generateConsequence(type),
        leadTo: isFinal ? 'ending' : faker.string.uuid()
      });
    }
    
    return choices;
  }

  /**
   * Generate choice text
   */
  private generateChoiceText(type: string, ageGroup: string): string {
    const templates: Record<string, string[]> = {
      action: [
        'Run towards the sound',
        'Hide behind the tree',
        'Climb the wall',
        'Jump across the gap'
      ],
      dialogue: [
        'Ask about the mystery',
        'Tell the truth',
        'Make a joke',
        'Stay silent'
      ],
      exploration: [
        'Explore the cave',
        'Follow the path',
        'Check the door',
        'Look around'
      ],
      puzzle: [
        'Solve the riddle',
        'Try a different approach',
        'Ask for a hint',
        'Study the pattern'
      ],
      moral: [
        'Help the stranger',
        'Keep the secret',
        'Share the reward',
        'Take responsibility'
      ]
    };
    
    const options = templates[type] || templates.action;
    let choice = faker.helpers.arrayElement(options);
    
    // Simplify for younger age groups
    if (ageGroup === '4-6') {
      choice = choice.split(' ').slice(0, 4).join(' ');
    }
    
    return choice;
  }

  /**
   * Generate consequence for a choice
   */
  private generateConsequence(type: string): string {
    const consequences: Record<string, string[]> = {
      action: ['reveals hidden path', 'triggers event', 'changes location'],
      dialogue: ['gains information', 'improves relationship', 'creates conflict'],
      exploration: ['discovers item', 'finds clue', 'encounters character'],
      puzzle: ['unlocks door', 'reveals secret', 'gains reward'],
      moral: ['affects reputation', 'changes story', 'influences ending']
    };
    
    return faker.helpers.arrayElement(consequences[type] || ['continues story']);
  }

  /**
   * Generate image prompt
   */
  private generateImagePrompt(genres: string[], characters: TestCharacter[], segmentIndex: number): string {
    const protagonist = characters.find(c => c.role === 'protagonist');
    const genre = genres[0];
    const genreTemplate = this.genreTemplates[genre as keyof typeof this.genreTemplates];
    const setting = faker.helpers.arrayElement(genreTemplate?.settings || ['landscape']);
    
    return `${protagonist?.name || 'Character'} in ${setting}, ${genre} style, colorful illustration`;
  }

  /**
   * Generate audio text
   */
  private generateAudioText(ageGroup: string): string {
    const pace = ageGroup === '4-6' ? 'slow and clear' : 
                 ageGroup === '13+' ? 'natural pace' : 
                 'moderate pace';
    
    return `Read with ${pace}, expressive voice`;
  }

  /**
   * Generate emotional tone
   */
  private generateEmotionalTone(segmentIndex: number, totalSegments: number): string {
    if (segmentIndex === 0) {
      return 'curious';
    } else if (segmentIndex === totalSegments - 1) {
      return 'resolved';
    } else if (segmentIndex > totalSegments / 2) {
      return faker.helpers.arrayElement(['tense', 'exciting', 'dramatic']);
    } else {
      return faker.helpers.arrayElement(['adventurous', 'mysterious', 'hopeful']);
    }
  }

  /**
   * Generate title
   */
  private generateTitle(genres: string[], ageGroup: string): string {
    const genre = genres[0];
    const templates: Record<string, string[]> = {
      fantasy: ['The Magic', 'Quest for', 'Dragon\'s', 'Enchanted'],
      mystery: ['Mystery of', 'Case of', 'Secret of', 'Clue to'],
      adventure: ['Journey to', 'Adventure in', 'Search for', 'Discovery of'],
      'sci-fi': ['Space', 'Future', 'Robot', 'Time'],
      educational: ['Learning about', 'Discovering', 'Understanding', 'Exploring']
    };
    
    const prefix = faker.helpers.arrayElement(templates[genre] || ['Story of']);
    const noun = faker.helpers.arrayElement(['Crystal', 'Forest', 'Kingdom', 'Secret', 'Treasure']);
    
    return `${prefix} the ${noun}`;
  }

  /**
   * Generate prompt
   */
  private generatePrompt(genres: string[], ageGroup: string, protagonist: TestCharacter): string {
    const genre = genres.join(' and ');
    return `Create a ${genre} story for ${ageGroup} year olds about ${protagonist.name}, a ${protagonist.type} who ${faker.helpers.arrayElement(protagonist.personality)} and must ${faker.helpers.arrayElement(['save the day', 'solve a mystery', 'find their way home', 'help a friend'])}`;
  }

  /**
   * Generate expected outcomes
   */
  private generateExpectedOutcomes(ageGroup: string, genres: string[]): ExpectedOutcomes {
    const config = this.ageGroupConfigs[ageGroup as keyof typeof this.ageGroupConfigs];
    
    return {
      minCoherenceScore: ageGroup === '4-6' ? 75 : 85,
      minCharacterConsistency: 90,
      minChoiceDiversity: ageGroup === '4-6' ? 60 : 75,
      minAgeAppropriateness: 95,
      requiredThemes: faker.helpers.arrayElements(config.themes, 2),
      forbiddenContent: config.forbiddenThemes
    };
  }

  /**
   * Generate batch of test stories
   */
  generateTestBatch(count: number = 10): TestStory[] {
    const stories: TestStory[] = [];
    const ageGroups: Array<'4-6' | '7-9' | '10-12' | '13+'> = ['4-6', '7-9', '10-12', '13+'];
    const genreCombinations = [
      ['fantasy'],
      ['mystery'],
      ['adventure'],
      ['sci-fi'],
      ['fantasy', 'adventure'],
      ['mystery', 'adventure'],
      ['sci-fi', 'adventure'],
      ['educational', 'adventure']
    ];
    
    for (let i = 0; i < count; i++) {
      const ageGroup = faker.helpers.arrayElement(ageGroups);
      const genres = faker.helpers.arrayElement(genreCombinations);
      const segmentCount = faker.number.int({ min: 3, max: 7 });
      
      stories.push(this.generateTestStory(ageGroup, genres, segmentCount));
    }
    
    return stories;
  }

  /**
   * Generate edge case scenarios
   */
  generateEdgeCases(): TestStory[] {
    const edgeCases: TestStory[] = [];
    
    // Very short story
    edgeCases.push(this.generateTestStory('4-6', ['fantasy'], 2));
    
    // Very long story
    edgeCases.push(this.generateTestStory('13+', ['mystery', 'sci-fi'], 15));
    
    // Multiple genres
    edgeCases.push(this.generateTestStory('10-12', ['fantasy', 'mystery', 'adventure'], 7));
    
    // Minimal characters
    const minimalCharStory = this.generateTestStory('7-9', ['adventure'], 5);
    minimalCharStory.characters = [minimalCharStory.characters[0]];
    edgeCases.push(minimalCharStory);
    
    // Maximum characters
    const maxCharStory = this.generateTestStory('13+', ['fantasy'], 8);
    for (let i = 0; i < 7; i++) {
      maxCharStory.characters.push(
        this.generateCharacter('fantasy', '13+', 'supporting')
      );
    }
    edgeCases.push(maxCharStory);
    
    return edgeCases;
  }

  /**
   * Generate multilingual test cases
   */
  generateMultilingualTests(): Array<{ language: string; story: TestStory }> {
    const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja'];
    const multilingualTests: Array<{ language: string; story: TestStory }> = [];
    
    for (const language of languages) {
      const story = this.generateTestStory('10-12', ['adventure'], 5);
      // Add language-specific modifications
      story.prompt = `[${language}] ${story.prompt}`;
      multilingualTests.push({ language, story });
    }
    
    return multilingualTests;
  }

  /**
   * Validate test story against expected outcomes
   */
  validateTestStory(story: TestStory, actualScores: any): {
    passed: boolean;
    failures: string[];
  } {
    const failures: string[] = [];
    const expected = story.expectedOutcomes;
    
    if (actualScores.storyCoherence < expected.minCoherenceScore) {
      failures.push(`Coherence score ${actualScores.storyCoherence} below minimum ${expected.minCoherenceScore}`);
    }
    
    if (actualScores.characterConsistency < expected.minCharacterConsistency) {
      failures.push(`Character consistency ${actualScores.characterConsistency} below minimum ${expected.minCharacterConsistency}`);
    }
    
    if (actualScores.choiceDiversity < expected.minChoiceDiversity) {
      failures.push(`Choice diversity ${actualScores.choiceDiversity} below minimum ${expected.minChoiceDiversity}`);
    }
    
    if (actualScores.ageAppropriateness < expected.minAgeAppropriateness) {
      failures.push(`Age appropriateness ${actualScores.ageAppropriateness} below minimum ${expected.minAgeAppropriateness}`);
    }
    
    // Check for forbidden content
    const storyText = story.segments.map(s => s.text).join(' ').toLowerCase();
    for (const forbidden of expected.forbiddenContent) {
      if (storyText.includes(forbidden.toLowerCase())) {
        failures.push(`Found forbidden content: ${forbidden}`);
      }
    }
    
    // Check for required themes
    const foundThemes = story.segments.flatMap(s => s.themes);
    for (const required of expected.requiredThemes) {
      if (!foundThemes.includes(required)) {
        failures.push(`Missing required theme: ${required}`);
      }
    }
    
    return {
      passed: failures.length === 0,
      failures
    };
  }
}

// Export singleton instance
export const testDataGenerator = new TestDataGenerator();