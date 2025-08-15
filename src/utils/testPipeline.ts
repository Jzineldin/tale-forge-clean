// tiny, removable helpers for end-to-end pipeline verification
export const probe = (step: string, data: Record<string, any>) => {
  const log = {
    step,
    ts: new Date().toISOString(),
    ...data,
  };
  console.table([log]);
};

export const assert = (condition: boolean, msg: string) => {
  if (!condition) {
    const error = new Error(`❌ ASSERT: ${msg}`);
    console.error(error);
    // In development, throw to break the flow and make issues visible
    if (import.meta.env.DEV) {
      throw error;
    }
  }
};

// Pipeline verification helpers
export const verifyPipelineStep = (step: string, expected: Record<string, any>, actual: Record<string, any>) => {
  console.group(`🔍 Pipeline Step: ${step}`);
  console.log('Expected:', expected);
  console.log('Actual:', actual);
  
  const mismatches = Object.keys(expected).filter(key => expected[key] !== actual[key]);
  
  if (mismatches.length > 0) {
    console.error(`❌ Mismatches in ${step}:`, mismatches);
    mismatches.forEach(key => {
      console.error(`  ${key}: expected "${expected[key]}" got "${actual[key]}"`);
    });
  } else {
    console.log('✅ All values match');
  }
  
  console.groupEnd();
  return mismatches.length === 0;
};

// Age-specific validation
export const validateAgeAppropriateness = (age: string, content: string) => {
  const ageGuidelines = {
    '4-6': {
      maxWords: 50,
      forbiddenWords: ['scary', 'frightening', 'dangerous', 'violent'],
      requiredElements: ['friendly', 'gentle', 'safe']
    },
    '7-9': {
      maxWords: 100,
      forbiddenWords: ['terrifying', 'horror', 'blood'],
      requiredElements: ['adventure', 'discovery']
    },
    '10-12': {
      maxWords: 150,
      forbiddenWords: ['inappropriate'],
      requiredElements: ['complexity', 'problem-solving']
    }
  };
  
  const guidelines = ageGuidelines[age as keyof typeof ageGuidelines];
  if (!guidelines) return true; // Unknown age, skip validation
  
  const wordCount = content.split(' ').length;
  const hasForbiddenWords = guidelines.forbiddenWords.some(word => 
    content.toLowerCase().includes(word)
  );
  const hasRequiredElements = guidelines.requiredElements.some(element => 
    content.toLowerCase().includes(element)
  );
  
  return {
    isValid: wordCount <= guidelines.maxWords && !hasForbiddenWords,
    wordCount,
    hasForbiddenWords,
    hasRequiredElements,
    guidelines
  };
}; 