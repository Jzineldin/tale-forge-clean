
// EMERGENCY FIX - Complete overhaul of the choice generation system
import { supabase } from "@/integrations/supabase/client";
import { normalizeAgeInput } from "@/utils/ageUtils";
import { generateChoices } from "./story-choice-generator";
// CHOICE-INTEGRITY: Client-side validation helpers and diagnostics
const CHOICE_SOURCE_SERVER = 'server';
const CHOICE_SOURCE_CLIENT_PATCH = 'client-template-patched';

type ChoiceFlow = {
  timestamp: string;
  segmentId: string | undefined;
  source: string;
  engineVersion: string | undefined;
  originalChoices: string[] | null | undefined;
  finalChoices: string[] | null | undefined;
  validationPassed: boolean;
};

declare global {
  interface Window {
    __CHOICE_FLOWS__?: ChoiceFlow[];
    __CHOICE_META__?: Record<string, { source: string; engineVersion?: string; choices: string[] }>;
  }
}

function extractStoryElementsForChoices(text: string) {
  const characters = Array.from(new Set((text.match(/\b[A-Z][a-z]{2,}\b/g) || [])
    .filter(w => !['The','And','But','Then','When','Where','What','Who','How','Why'].includes(w))
  ));
  const objects = Array.from(new Set(
    (text.match(/\b(?:the|a|an)\s+([a-z]{3,})\b/gi) || [])
      .map(m => m.replace(/^(?:the|a|an)\s+/i, '').toLowerCase())
  ));
  const locationWords = ['castle','tower','house','cottage','cave','forest','woods','meadow','field','garden','village','town','city','kingdom','room','hall','chamber','bridge','road','path','trail','clearing','glade','grove','river','lake','mountain','valley'];
  const locations = Array.from(new Set(
    (text.match(new RegExp(`\\b(?:in|at|to|from|near|by|behind|under|over)\\s+(?:the|a|an)?\\s+(${locationWords.join('|')})\\b`, 'gi')) || [])
      .map(m => m.replace(/^(?:in|at|to|from|near|by|behind|under|over)\s+(?:the|a|an)?\s+/i, '').toLowerCase())
  ));
  return { characters, objects, locations };
}

function isSingleVerbOrGenericTwoWord(choice: string): boolean {
  const c = String(choice || '').replace(/[.!?]$/,'').trim();
  const words = c.split(/\s+/);
  if (words.length === 1) return true;
  if (words.length <= 3) {
    const genericVerbs = ['explore','investigate','follow','continue','go','look','search','enter','proceed','walk','run','discover'];
    const genericNouns = ['path','way','clue','guide'];
    const first = words[0].toLowerCase();
    const last = words[words.length-1].toLowerCase();
    if (genericVerbs.includes(first) && genericNouns.includes(last)) return true;
    if (genericVerbs.includes(first) && words.slice(1).join(' ').toLowerCase().match(/^(?:the\s+)?(path|way|clue|guide)$/)) return true;
  }
  return false;
}

function containsForbiddenGenericTerms(choice: string, storyText: string): boolean {
  const lower = choice.toLowerCase();
  const hasGeneric = /(path|way|clue|guide)\b/.test(lower);
  if (!hasGeneric) return false;
  if (/\bGuide\b/.test(choice) && !/\bthe Guide\b/i.test(choice)) return false; // allow proper-name Guide

  const elements = extractStoryElementsForChoices(storyText);
  const tokens = new Set(
    [...elements.characters, ...elements.objects, ...elements.locations].map(s => s.toLowerCase())
  );
  const words = lower.split(/\s+/);
  const bound = words.some(w => tokens.has(w));
  return !bound;
}

function validateChoiceSetContract(storyText: string, choices: string[] | null | undefined): boolean {
  if (!Array.isArray(choices) || choices.length !== 3) return false;
  for (const ch of choices) {
    if (!ch || typeof ch !== 'string') return false;
    if (isSingleVerbOrGenericTwoWord(ch)) return false;
    if (containsForbiddenGenericTerms(ch, storyText)) return false;
  }
  return true;
}

function recordChoiceFlow(args: ChoiceFlow) {
  if (typeof window === 'undefined') return;
  window.__CHOICE_FLOWS__ = window.__CHOICE_FLOWS__ || [];
  window.__CHOICE_FLOWS__!.unshift(args);
  window.__CHOICE_FLOWS__ = window.__CHOICE_FLOWS__!.slice(0, 3);

  if (args.segmentId) {
    window.__CHOICE_META__ = window.__CHOICE_META__ || {};
    const meta: { source: string; choices: string[]; engineVersion?: string } = {
      source: args.source,
      choices: args.finalChoices || []
    };
    if (args.engineVersion) {
      meta.engineVersion = args.engineVersion;
    }
    window.__CHOICE_META__![args.segmentId] = meta;
  }
}

interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'sidekick' | 'companion' | 'custom';
  description?: string;
  traits?: string[];
}

export async function generateStorySegment(p: {
  prompt: string;
  age: string;
  genre: string;
  storyId?: string;
  parentSegmentId?: string;
  choiceText?: string;
  skipImage?: boolean;
  characters?: Character[];
}) {
  console.log('🌐 [AI_API] Calling generate-story-segment with params:', {
    promptLength: p.prompt?.length || 0,
    age: p.age,
    genre: p.genre,
    storyId: p.storyId,
    parentSegmentId: p.parentSegmentId,
    choiceText: p.choiceText,
    skipImage: p.skipImage,
    charactersCount: p.characters?.length || 0
  });
  
  console.log('🎭 [AI_API] Detailed character data:', JSON.stringify(p.characters, null, 2));
  console.log('🔄 [CHOICE_TRACE] Starting story generation request with context:', {
    hasExistingStory: !!p.storyId,
    isContinuation: !!p.parentSegmentId && !!p.choiceText,
    selectedChoice: p.choiceText || 'N/A'
  });
  
  // Add timestamp to track request flow
  const requestTimestamp = new Date().toISOString();
  console.log(`🕒 [CHOICE_TRACE] Request started at ${requestTimestamp}`);

  const { data, error } = await supabase.functions.invoke(
    "generate-story-segment",
    { body: { ...p, age: normalizeAgeInput(p.age) || p.age } }
  );

  console.log('🌐 [AI_API] Supabase function response:', {
    hasData: !!data,
    hasError: !!error,
    error: error?.message,
    dataKeys: data ? Object.keys(data) : []
  });
  
  // Log the raw choices from the edge function for debugging
  if (data?.data?.choices) {
    console.log('🔄 [CHOICE_TRACE] Raw choices from edge function:', data.data.choices);
    console.log('🔍 [CHOICE_TRACE] Raw choices data type:', typeof data.data.choices, Array.isArray(data.data.choices));
  } else if (data?.choices) {
    console.log('🔄 [CHOICE_TRACE] Raw choices from edge function (direct format):', data.choices);
    console.log('🔍 [CHOICE_TRACE] Raw choices data type:', typeof data.choices, Array.isArray(data.choices));
  } else {
    console.log('⚠️ [CHOICE_TRACE] No choices found in edge function response');
    console.log('🔍 [CHOICE_TRACE] Full edge function response:', JSON.stringify(data, null, 2));
  }

  if (error) {
    console.error('❌ [AI_API] Supabase function invocation failed:', error);
    throw new Error(`Story generation failed: ${error.message}`);
  }

  if (!data) {
    console.error('❌ [AI_API] No data returned from function');
    throw new Error('No data returned from story generation service');
  }

  // Handle the response format (Supabase client unwraps our {success: true, data: {...}} response)
  let storyData;
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    console.log('🔄 [AI_API] Processing structured response format');
    if (!data.success) {
      const errorMessage = data.error || 'Story generation failed';
      console.error('❌ [AI_API] Function returned error:', errorMessage);
      throw new Error(errorMessage);
    }

    if (!data.data) {
      console.error('❌ [AI_API] No story data in successful response');
      throw new Error('No story data returned from generation');
    }

    storyData = data.data;
  } else {
    // Direct response format (Supabase client has already unwrapped the response)
    console.log('🔄 [AI_API] Processing direct response format (unwrapped by Supabase client)');
    storyData = data;
  }

  // CHOICE-INTEGRITY: capture engine version from server (if provided)
  const serverEngineVersion: string | undefined =
    (data && typeof data === 'object' && 'success' in data && (data as any).data?.choice_engine_version) ||
    (storyData && (storyData as any).choice_engine_version) ||
    undefined;

  // Validate we have the required story text
  if (!storyData?.text && !storyData?.segment_text) {
    console.error('❌ [AI_API] No story text found in response:', storyData);
    throw new Error('No story text generated');
  }

  // Normalize the response format
  const normalizedData = {
    id: storyData.id,
    story_id: storyData.story_id,
    text: storyData.text || storyData.segment_text,
    choices: storyData.choices || null, // Will be set below after text extraction
    is_end: storyData.is_end || false,
    image_url: storyData.image_url || '/placeholder.svg',
    image_generation_status: storyData.image_generation_status || 'pending'
  };
  
  // Additional client-side cleanup of story text
  if (normalizedData.text) {
    console.log('🧹 [AI_API] Performing client-side text cleanup');
    
    // Store original text for comparison
    const originalText = normalizedData.text;
    
    // Remove "what happens next?" and similar phrases
    const whatNextPatterns = [
      /what happens next\??/gi,
      /what will happen next\??/gi,
      /what would you do next\??/gi,
      /what would happen next\??/gi,
      /what do you think happens next\??/gi,
      /what will you do next\??/gi,
      /what should happen next\??/gi,
      /what will they do next\??/gi,
      /what should they do next\??/gi,
      /what would they do next\??/gi,
      /what do you think they should do next\??/gi
    ];
    
    whatNextPatterns.forEach(pattern => {
      if (normalizedData.text.match(pattern)) {
        console.log(`🧹 [AI_API] Removing "${pattern.toString()}" phrase from text`);
        normalizedData.text = normalizedData.text.replace(pattern, '');
      }
    });
    
    // Remove choice-like text from story
    const choicePatterns = [
      /(?:you can|you could|you may)(?:\s+(?:choose|decide|pick|select|opt))(?:\s+to)?(?:\s+(?:either|between))?\s*:/gi,
      /(?:choose|decide|pick|select)\s+(?:between|from|one of)(?:\s+these)?\s+(?:options|choices|paths|alternatives)\s*:/gi,
      /(?:here are|these are)\s+(?:your|the)\s+(?:options|choices|paths|alternatives)\s*:/gi,
      /(?:the choice is yours|make your choice|what will you choose|what would you do)\s*[.!?]/gi,
      /(?:option|choice)\s+(?:1|one|a|first)\s*:/gi,
      /(?:option|choice)\s+(?:2|two|b|second)\s*:/gi,
      /(?:option|choice)\s+(?:3|three|c|third)\s*:/gi
    ];
    
    choicePatterns.forEach(pattern => {
      if (normalizedData.text.match(pattern)) {
        console.log(`🧹 [AI_API] Removing choice-like text matching: ${pattern.toString()}`);
        normalizedData.text = normalizedData.text.replace(pattern, '');
      }
    });
    
    // Remove any text after "CHOICES:" if it somehow got into the story text
    if (normalizedData.text.includes("CHOICES:")) {
      console.log(`🧹 [AI_API] Removing "CHOICES:" section from story text`);
      normalizedData.text = normalizedData.text.split("CHOICES:")[0].trim();
    }
    
    // Clean up any trailing punctuation that might look odd after removals
    normalizedData.text = normalizedData.text.replace(/[,;:]\s*$/, '.').trim();
    
    // Ensure the text ends with proper punctuation
    if (!normalizedData.text.match(/[.!?]$/)) {
      normalizedData.text += '.';
    }
    
    // Log if changes were made
    if (originalText !== normalizedData.text) {
      console.log(`🧹 [AI_API] Text was cleaned up. Original length: ${originalText.length}, New length: ${normalizedData.text.length}`);
    } else {
      console.log(`🧹 [AI_API] No client-side cleanup needed for this story text`);
    }
  }

  // Debug mode flag - can be enabled to show detailed choice generation info
  const debugMode = false;

  // Generate choices using the new template-based system
  if (!normalizedData.choices || !Array.isArray(normalizedData.choices) || normalizedData.choices.length !== 3) {
    console.warn('⚠️ [AI_API] Invalid choices structure, using template-based generation system');
    
    // Generate new choices and diagnostics using our template system
    const { choices, diagnostics } = generateChoices(normalizedData.text, debugMode);
    normalizedData.choices = choices;
    if (debugMode) {
      (normalizedData as any).diagnostics = diagnostics;
    }
    
    console.log('✅ [CHOICE_DEBUG] Generated new choices:', normalizedData.choices);
  } else {
    // Check if the choices from the AI are valid
    console.log('🔍 [CHOICE_DEBUG] Validating AI-generated choices');
    
    // Store original choices for comparison
    const originalChoices = [...normalizedData.choices];
    
    // Generate new choices using our template system
    const templateChoices = generateChoices(normalizedData.text, debugMode);
    
    // Replace any problematic choices with our template-generated ones
    let choicesReplaced = false;
    
    // Check for nonsensical choices like "Talk to With"
    const nonsensicalPattern = /\b(?:with|the|and|or|but|if|then|when|where|why|how|what|who|whom|whose|which|that)\s+(?:with|the|and|or|but|if|then|when|where|why|how|what|who|whom|whose|which|that)\b/i;
    
    normalizedData.choices = normalizedData.choices.map((choice, index) => {
      // Check for various issues
      const hasNonsensicalPattern = nonsensicalPattern.test(choice);
      const isTooShort = choice.length < 10;
      const isGenericVerb = /^(?:explore|continue|follow|investigate|discover|solve|imagine)\s+(?:the|a|an)?\s*$/i.test(choice);
      
      if (hasNonsensicalPattern || isTooShort || isGenericVerb) {
        console.warn(`⚠️ [CHOICE_DEBUG] Replacing problematic choice: "${choice}"`);
        choicesReplaced = true;
        return templateChoices[index];
      }
      
      return choice;
    });
    
    // If we replaced any choices, log the before and after
    if (choicesReplaced) {
      console.log('📊 [CHOICE_DEBUG] Choice replacement summary:', {
        original: originalChoices,
        replaced: normalizedData.choices,
        changed: originalChoices.map((choice, i) => choice !== normalizedData.choices[i])
      });
    } else {
      console.log('✅ [CHOICE_DEBUG] All AI-generated choices are valid');
    }
  }

  // CHOICE-INTEGRITY: validate original server choices; if invalid, patch DB with template and mark source
  const serverChoicesRaw: string[] | null | undefined =
    (data && typeof data === 'object' && 'success' in data ? (data as any).data?.choices : (data as any)?.choices) ?? storyData.choices ?? null;

  let choiceSource = CHOICE_SOURCE_SERVER;
  const serverValid = validateChoiceSetContract(normalizedData.text, serverChoicesRaw);
  if (!serverValid) {
    console.warn('[CHOICE-INTEGRITY] Client validation rejected server choices. Generating template choices and patching segment.');
    const patchedChoices = generateChoices(normalizedData.text, false);
    normalizedData.choices = patchedChoices;
    choiceSource = CHOICE_SOURCE_CLIENT_PATCH;

    // Persist corrected choices so realtime emits the fix
    if (normalizedData.id) {
      try {
        const { error: patchErr } = await supabase
          .from('story_segments')
          .update({ choices: patchedChoices })
          .eq('id', normalizedData.id);
        if (patchErr) {
          console.warn('[CHOICE-INTEGRITY] Failed to patch segment with corrected choices:', patchErr);
        } else {
          console.log('[CHOICE-INTEGRITY] Patched segment with corrected choices');
        }
      } catch (e) {
        console.warn('[CHOICE-INTEGRITY] Unexpected error while patching segment choices:', e);
      }
    }

    // Record diagnostics
    recordChoiceFlow({
      timestamp: new Date().toISOString(),
      segmentId: normalizedData.id,
      source: choiceSource,
      engineVersion: serverEngineVersion,
      originalChoices: serverChoicesRaw || [],
      finalChoices: normalizedData.choices,
      validationPassed: false
    });
  } else {
    // Record server-provided path
    recordChoiceFlow({
      timestamp: new Date().toISOString(),
      segmentId: normalizedData.id,
      source: choiceSource,
      engineVersion: serverEngineVersion,
      originalChoices: serverChoicesRaw || [],
      finalChoices: normalizedData.choices,
      validationPassed: true
    });
  }
  console.info('[CHOICE-INTEGRITY]', { CHOICE_SOURCE: choiceSource, CHOICE_ENGINE_VERSION: serverEngineVersion });

  // Log the final choices being returned to the UI
  console.log('✅ [AI_API] Returning normalized data:', {
    id: normalizedData.id,
    story_id: normalizedData.story_id,
    textLength: normalizedData.text?.length || 0,
    choicesCount: normalizedData.choices?.length || 0,
    choices: normalizedData.choices,
    imageUrl: normalizedData.image_url,
    isEnd: normalizedData.is_end
  });
  
  console.log('🔄 [CHOICE_TRACE] Final choices after all processing:', normalizedData.choices);
  console.log(`🕒 [CHOICE_TRACE] Request completed at ${new Date().toISOString()}, started at ${requestTimestamp}`);
  
  return normalizedData;
}
