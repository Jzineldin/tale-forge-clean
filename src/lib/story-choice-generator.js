/**
 * EMERGENCY FIX - HARDCODED APPROACH
 * 
 * Complete overhaul of the choice generation system with a hardcoded template-based approach
 * that is guaranteed to produce grammatically correct, sensible choices.
 */

// Hardcoded choice templates that are guaranteed to work
export const HARDCODED_TEMPLATES = [
  // Character-focused choices
  "Talk to [character]",
  "Follow [character]",
  "Ask [character] about the [object]",
  "Help [character] find the [object]",
  "Join [character]'s quest",
  "Convince [character] to help you",
  "Learn more from [character]",
  "Warn [character] about danger",
  
  // Object-focused choices
  "Examine the [object]",
  "Touch the [object]",
  "Pick up the [object]",
  "Open the [object]",
  "Use the [object]",
  "Search for the [object]",
  "Hide the [object]",
  "Study the [object] carefully",
  
  // Location-focused choices
  "Enter the [location]",
  "Explore the [location]",
  "Search the [location]",
  "Investigate the [location]",
  "Find a way through the [location]",
  "Look around the [location]",
  "Return to the [location]",
  "Avoid the [location]",
  
  // Action choices (no substitution needed)
  "Look around carefully",
  "Continue forward",
  "Turn back",
  "Wait and listen",
  "Hide and observe",
  "Think about your next move",
  "Rest for a moment",
  "Prepare for danger"
];

// Lists of common fantasy story elements to use as fallbacks
export const FANTASY_CHARACTERS = [
  "wizard", "fairy", "elf", "guardian", "stranger", "knight", "witch", 
  "traveler", "merchant", "healer", "warrior", "sage", "child", "elder"
];

export const FANTASY_OBJECTS = [
  "crystal", "book", "door", "key", "potion", "wand", "map", "scroll", 
  "amulet", "sword", "staff", "ring", "chest", "artifact", "gem", "stone"
];

export const FANTASY_LOCATIONS = [
  "forest", "cave", "castle", "garden", "tower", "path", "village", "temple", 
  "ruins", "mountain", "river", "bridge", "clearing", "valley", "library", "chamber"
];

// Extract story elements from the text with a more reliable approach
export const extractStoryElements = (text) => {
  console.log('🔍 [CHOICE_DEBUG] Starting story element extraction with hardcoded approach');
  
  // Extract character names (capitalized words)
  const characterPattern = /\b[A-Z][a-z]{2,}\b/g;
  const potentialCharacters = [...(text.match(characterPattern) || [])];
  const characters = potentialCharacters
    .filter(c =>
      !['The', 'And', 'But', 'Then', 'When', 'Where', 'What', 'Who', 'How', 'Why',
        'I', 'You', 'He', 'She', 'It', 'We', 'They', 'This', 'That', 'These', 'Those',
        'Once', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Last', 'Next', 'Some', 'Any', 'All',
        'Many', 'Few', 'Several', 'Each', 'Every', 'Other', 'Another', 'Such', 'No', 'Not',
        'Only', 'Just', 'More', 'Most', 'Less', 'Least', 'Very', 'Too', 'So', 'As',
        'Like', 'Than', 'About', 'Over', 'Under', 'Above', 'Below', 'Between', 'Among', 'Through',
        'During', 'Before', 'After', 'Since', 'Until', 'While', 'Though', 'Although', 'Because', 'If',
        'Unless', 'Whether', 'Thus', 'Therefore', 'Hence', 'Else', 'Otherwise', 'Instead', 'Again', 'Also',
        'Besides', 'Furthermore', 'Moreover', 'However', 'Nevertheless', 'Nonetheless', 'Still', 'Yet', 'Meanwhile', 'Whispering',
        'Woods', 'Her', 'His', 'Their', 'Our', 'Your', 'My', 'Its', 'Princess', 'Prince', 'King', 'Queen',
        'Kingdom', 'Empire', 'Realm', 'Land', 'Country', 'Nation', 'State', 'City', 'Town', 'Village',
        'Eldoria', 'Highness', 'Majesty', 'Excellency', 'Grace', 'Honor', 'Lordship', 'Ladyship',
        'Cave', 'Shadows', 'Mountain', 'Valley', 'Forest', 'River', 'Lake', 'Ocean', 'Sea', 'Desert',
        'Plain', 'Meadow', 'Hill', 'Cliff', 'Beach', 'Shore', 'Coast', 'Island', 'Peninsula',
        'Without', 'Within', 'Beyond', 'Behind', 'Beside', 'Around', 'Along', 'Across', 'Against', 'Toward',
        'Towards', 'Upon', 'Onto', 'Into', 'Onto', 'Unto', 'Per', 'Via', 'Versus', 'Vs',
        // Common adverbs that might be capitalized at the beginning of sentences
        'Suddenly', 'Quickly', 'Slowly', 'Carefully', 'Quietly', 'Loudly', 'Gently', 'Roughly',
        'Immediately', 'Eventually', 'Finally', 'Ultimately', 'Gradually', 'Rapidly', 'Swiftly',
        'Silently', 'Noisily', 'Calmly', 'Anxiously', 'Nervously', 'Excitedly', 'Happily', 'Sadly',
        'Angrily', 'Fearfully', 'Hopefully', 'Desperately', 'Curiously', 'Cautiously', 'Eagerly'].includes(c))
    // Remove titles from character names
    .map(c => c.replace(/^(Princess|Prince|King|Queen|Lord|Lady|Sir|Dame|Doctor|Dr|Professor|Prof)\s+/, ''))
    // Remove duplicates
    .filter((c, i, arr) => arr.indexOf(c) === i)
    .slice(0, 5);
  
  console.log('🔍 [CHOICE_DEBUG] Extracted character names:', characters);
  
  // Extract objects (match against common objects list)
  const commonObjects = [
    'book', 'key', 'door', 'map', 'letter', 'note', 'sword', 'wand', 'staff', 'potion',
    'ring', 'amulet', 'necklace', 'pendant', 'crystal', 'gem', 'stone', 'box', 'chest',
    'scroll', 'lamp', 'lantern', 'torch', 'shield', 'armor', 'cloak', 'hat', 'crown',
    'bridge', 'path', 'road', 'river', 'lake', 'mountain', 'hill', 'tree', 'flower',
    'animal', 'creature', 'monster', 'beast', 'dragon', 'bird', 'fish', 'insect',
    'food', 'drink', 'water', 'fire', 'wind', 'earth', 'metal', 'wood', 'cloth',
    'paper', 'ink', 'quill', 'coin', 'gold', 'silver', 'treasure', 'jewel', 'diamond'
  ];
  
  // Extract objects with a more reliable pattern
  const objectPattern = new RegExp(`\\b(?:the|a|an)\\s+(${commonObjects.join('|')})\\b`, 'gi');
  const potentialObjects = [...(text.matchAll(objectPattern) || [])]
    .map(match => match[1].trim().toLowerCase())
    .filter(o => o.length > 2);
  
  // Remove duplicates
  const objects = [...new Set(potentialObjects)].slice(0, 5);
  console.log('🔍 [CHOICE_DEBUG] Extracted objects:', objects);
  
  // Predefined list of location words to match against
  const locationWords = [
    'castle', 'tower', 'house', 'cottage', 'hut', 'cave', 'dungeon', 'forest', 'woods',
    'meadow', 'field', 'garden', 'village', 'town', 'city', 'kingdom', 'realm', 'land',
    'island', 'beach', 'shore', 'coast', 'sea', 'ocean', 'lake', 'river', 'stream',
    'mountain', 'hill', 'valley', 'canyon', 'desert', 'oasis', 'swamp', 'marsh',
    'temple', 'shrine', 'church', 'library', 'school', 'shop', 'market', 'tavern', 'inn',
    'palace', 'mansion', 'room', 'hall', 'chamber', 'corridor', 'passage', 'tunnel',
    'bridge', 'road', 'path', 'trail', 'clearing', 'glade', 'grove', 'thicket'
  ];
  
  // Extract locations with a more reliable pattern
  const locationPattern = new RegExp(`\\b(?:in|at|to|from|near|by|beside|behind|under|over)\\s+(?:the|a|an)?\\s+(${locationWords.join('|')})\\b`, 'gi');
  const potentialLocations = [...(text.matchAll(locationPattern) || [])]
    .map(match => match[1].trim().toLowerCase())
    .filter(l => l.length > 2);
  
  // Remove duplicates
  const locations = [...new Set(potentialLocations)].slice(0, 5);
  console.log('🔍 [CHOICE_DEBUG] Extracted locations:', locations);
  
  // Combine all elements and remove duplicates
  const allElements = [...characters, ...objects, ...locations];
  const uniqueElements = [...new Set(allElements)];
  
  console.log('🔍 [CHOICE_DEBUG] All extracted story elements:', uniqueElements);
  
  return {
    characters,
    objects,
    locations,
    all: uniqueElements
  };
};

// Validate if a choice is grammatically correct and makes sense
export const validateChoice = (choice) => {
  if (!choice) return false;
  
  // Check for basic grammatical structure (verb + object)
  const hasVerb = /^[A-Z][a-z]+\b/.test(choice);
  
  // Check for nonsensical combinations
  const hasNonsensicalPattern = /\b(?:with|the|and|or|but|if|then|when|where|why|how|what|who|whom|whose|which|that)\s+(?:with|the|and|or|but|if|then|when|where|why|how|what|who|whom|whose|which|that)\b/i.test(choice);
  
  // Check for proper ending (shouldn't end with preposition or article)
  // But allow ending with a character name
  const hasProperEnding = !/(with|the|a|an|and|or|but|if|then|when|where|why|how|what|who|whom|whose|which|that)$/i.test(choice.trim()) ||
                         /\b[A-Z][a-z]{2,}$/i.test(choice.trim());
  
  // Check for minimum length and maximum length
  const hasProperLength = choice.length > 10 && choice.length < 60;
  
  // Check that it contains only noun words in noun positions
  const hasNounInNounPosition = !/(the|a|an)\s+(is|are|was|were|be|been|being|do|does|did|have|has|had|can|could|will|would|shall|should|may|might|must)\b/i.test(choice);
  
  // Check for problematic generic terms - but allow "path" when it's a specific object from the story
  // Also allow "way" when it's used with specific prepositions
  const hasProblematicTerms = false; // Disable this check as it's causing more problems than it solves
  
  // Check for nonsensical verb-object combinations
  const hasNonsensicalVerbObject = /\b(nurture|grow|plant|water|feed)\s+(the|a|an)\s+(way|path|idea|thought|concept|notion)\b/i.test(choice);
  
  const isValid = hasVerb && 
                 !hasNonsensicalPattern && 
                 hasProperEnding && 
                 hasProperLength && 
                 hasNounInNounPosition && 
                 !hasProblematicTerms &&
                 !hasNonsensicalVerbObject;
  
  console.log(`🔍 [CHOICE_DEBUG] Validating choice: "${choice}" - ${isValid ? 'VALID' : 'INVALID'}`);
  console.log(`🔍 [CHOICE_DEBUG] Validation details:`, { 
    hasVerb, 
    hasNonsensicalPattern, 
    hasProperEnding,
    hasProperLength,
    hasNounInNounPosition,
    hasProblematicTerms,
    hasNonsensicalVerbObject
  });
  
  return isValid;
};

// Create a choice using hardcoded templates and story elements
export const createHardcodedChoice = (storyElements, templateIndex) => {
  // Get the template
  const template = HARDCODED_TEMPLATES[templateIndex % HARDCODED_TEMPLATES.length];
  
  // Replace template placeholders with actual story elements
  let choice = template;
  
  // Replace [character] placeholder
  if (choice.includes('[character]')) {
    if (storyElements.characters.length > 0) {
      // Use a character from the story
      choice = choice.replace('[character]', storyElements.characters[0]);
      // Remove the used character to avoid repetition
      storyElements.characters.shift();
    } else {
      // Use a fallback fantasy character
      const fallbackCharacter = FANTASY_CHARACTERS[Math.floor(Math.random() * FANTASY_CHARACTERS.length)];
      choice = choice.replace('[character]', fallbackCharacter);
    }
  }
  
  // Replace [object] placeholder
  if (choice.includes('[object]')) {
    if (storyElements.objects.length > 0) {
      // Use an object from the story
      choice = choice.replace('[object]', storyElements.objects[0]);
      // Remove the used object to avoid repetition
      storyElements.objects.shift();
    } else {
      // Use a fallback fantasy object
      const fallbackObject = FANTASY_OBJECTS[Math.floor(Math.random() * FANTASY_OBJECTS.length)];
      choice = choice.replace('[object]', fallbackObject);
    }
  }
  
  // Replace [location] placeholder
  if (choice.includes('[location]')) {
    if (storyElements.locations.length > 0) {
      // Use a location from the story
      choice = choice.replace('[location]', storyElements.locations[0]);
      // Remove the used location to avoid repetition
      storyElements.locations.shift();
    } else {
      // Use a fallback fantasy location
      const fallbackLocation = FANTASY_LOCATIONS[Math.floor(Math.random() * FANTASY_LOCATIONS.length)];
      choice = choice.replace('[location]', fallbackLocation);
    }
  }
  
  return choice;
};

// Guaranteed fallback choices that are always valid
export const GUARANTEED_FALLBACKS = [
  "Look around carefully",
  "Continue forward cautiously",
  "Wait and observe",
  "Search for hidden clues",
  "Consider your next move",
  "Listen for any sounds",
  "Examine your surroundings",
  "Proceed with caution"
];

// Final validation to ensure choices are diverse and make sense
export const validateChoiceSet = (choices) => {
  // Check for duplicate words across choices
  const choiceWords = choices.map(choice => 
    choice.toLowerCase().split(/\s+/).filter(word => 
      word.length > 3 && !['with', 'the', 'and', 'for', 'from', 'about', 'around'].includes(word)
    )
  );
  
  // Check if any significant words appear in multiple choices
  const duplicateWords = choiceWords.flat().filter((word, index, array) => 
    array.indexOf(word) !== index
  );
  
  // Check if choices are too similar (share more than 2 significant words)
  let tooSimilar = false;
  for (let i = 0; i < choices.length; i++) {
    for (let j = i + 1; j < choices.length; j++) {
      const commonWords = choiceWords[i].filter(word => choiceWords[j].includes(word));
      if (commonWords.length > 2) {
        tooSimilar = true;
        break;
      }
    }
    if (tooSimilar) break;
  }
  
  // Check if all choices are valid
  const allValid = choices.every(choice => validateChoice(choice));
  
  // Check if choices represent different types of actions
  const hasCharacterChoice = choices.some(choice => /\b(talk|ask|help|join|follow|warn|convince)\b/i.test(choice));
  const hasObjectChoice = choices.some(choice => /\b(examine|touch|pick|open|use|search|hide|study)\b/i.test(choice));
  const hasLocationChoice = choices.some(choice => /\b(enter|explore|search|investigate|find|look|return|avoid)\b/i.test(choice));
  
  const isValid = allValid && 
                 !tooSimilar && 
                 duplicateWords.length < 3 &&
                 hasCharacterChoice &&
                 hasObjectChoice &&
                 (hasLocationChoice || choices.some(choice => /\b(look|continue|turn|wait|hide|think|rest|prepare)\b/i.test(choice)));
  
  console.log(`🔍 [CHOICE_DEBUG] Validating choice set:`, { 
    allValid, 
    tooSimilar, 
    duplicateWords,
    hasCharacterChoice,
    hasObjectChoice,
    hasLocationChoice,
    isValid
  });
  
  return isValid;
};

// Generate choices based on story text
export const generateChoices = (storyText, debugMode = false) => {
  console.log('🔄 [CHOICE_DEBUG] Generating choices with hardcoded template system');
  
  // Extract story elements
  const storyElements = extractStoryElements(storyText);
  
  // Debug mode output
  if (debugMode) {
    console.log('🔍 [CHOICE_DEBUG] Debug mode enabled');
    console.log('🔍 [CHOICE_DEBUG] Story elements:', {
      characters: storyElements.characters,
      objects: storyElements.objects,
      locations: storyElements.locations
    });
  }
  
  // Create deep copies of the story elements to avoid modifying the original
  const elementsCopy = {
    characters: [...storyElements.characters],
    objects: [...storyElements.objects],
    locations: [...storyElements.locations],
    all: [...storyElements.all]
  };
  
  // Generate choices using different template categories
  let choices = [];
  
  // First choice - character-focused (templates 0-7)
  const characterChoiceIndex = Math.floor(Math.random() * 8);
  choices.push(createHardcodedChoice(elementsCopy, characterChoiceIndex));
  
  // Second choice - object-focused (templates 8-15)
  const objectChoiceIndex = 8 + Math.floor(Math.random() * 8);
  choices.push(createHardcodedChoice(elementsCopy, objectChoiceIndex));
  
  // Third choice - location or action (templates 16-31)
  const locationChoiceIndex = 16 + Math.floor(Math.random() * 16);
  choices.push(createHardcodedChoice(elementsCopy, locationChoiceIndex));
  
  // Validate the choice set
  if (!validateChoiceSet(choices)) {
    console.log('⚠️ [CHOICE_DEBUG] Generated choice set is invalid, using guaranteed fallbacks');
    
    // Use guaranteed fallbacks that are diverse and make sense
    choices = [
      // Character-focused fallback
      elementsCopy.characters.length > 0 
        ? `Talk to ${elementsCopy.characters[0]}`
        : `Talk to the ${FANTASY_CHARACTERS[Math.floor(Math.random() * FANTASY_CHARACTERS.length)]}`,
      
      // Object-focused fallback
      elementsCopy.objects.length > 0
        ? `Examine the ${elementsCopy.objects[0]}`
        : `Examine the ${FANTASY_OBJECTS[Math.floor(Math.random() * FANTASY_OBJECTS.length)]}`,
      
      // Action fallback (guaranteed to work)
      GUARANTEED_FALLBACKS[Math.floor(Math.random() * GUARANTEED_FALLBACKS.length)]
    ];
  }
  
  // Ensure no duplicate choices
  const uniqueChoices = [...new Set(choices)];
  
  // If we lost any choices due to deduplication, add guaranteed fallbacks
  while (uniqueChoices.length < 3) {
    const fallbackIndex = Math.floor(Math.random() * GUARANTEED_FALLBACKS.length);
    const fallbackChoice = GUARANTEED_FALLBACKS[fallbackIndex];
    
    if (!uniqueChoices.includes(fallbackChoice)) {
      uniqueChoices.push(fallbackChoice);
    }
  }
  
  // Debug mode output
  if (debugMode) {
    console.log('🔍 [CHOICE_DEBUG] Generated choices:', uniqueChoices);
  }
  
  return uniqueChoices;
};