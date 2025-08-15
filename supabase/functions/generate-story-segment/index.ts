import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    })
  }

  try {
    const { prompt, age, genre, storyId, parentSegmentId, choiceText, skipImage, characters } = await req.json()

    // Normalize age input into a bucket ("4-6" | "7-9" | "10-12") and a numeric reference (midpoint)
    const resolveAge = (input: unknown): { bucket: '4-6' | '7-9' | '10-12'; numeric: number } => {
      const asString = typeof input === 'string' ? input.trim() : String(input ?? '').trim();
      if (asString === '4-6' || asString === '7-9' || asString === '10-12') {
        const mid = asString === '4-6' ? 5 : asString === '7-9' ? 8 : 11;
        return { bucket: asString as '4-6' | '7-9' | '10-12', numeric: mid };
      }
      const n = typeof input === 'number' ? input : parseInt(asString, 10);
      if (!Number.isNaN(n)) {
        if (n <= 6) return { bucket: '4-6', numeric: n };
        if (n <= 9) return { bucket: '7-9', numeric: n };
        return { bucket: '10-12', numeric: n };
      }
      // Default if missing/invalid
      return { bucket: '7-9', numeric: 8 };
    };
    const { bucket: ageBucket, numeric: ageNumber } = resolveAge(age);

    console.log('🦙 Using Llama 3.3-70B-Instruct for story generation')
    console.log('📝 Request params:', { prompt: prompt?.substring(0, 50), age, ageBucket, ageNumber, genre, storyId })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get OVH AI configuration for Llama
    const ovhToken = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN')
    const ovhEndpoint = 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions'
    const model = 'Meta-Llama-3_3-70B-Instruct'

    if (!ovhToken) {
      throw new Error('OVH_AI_ENDPOINTS_ACCESS_TOKEN not configured')
    }

    // Build context from previous segments if continuing a story
    let storyContext = ''
    if (storyId && parentSegmentId) {
      const { data: previousSegments } = await supabase
        .from('story_segments')
        .select('segment_text, choices')
        .eq('story_id', storyId)
        .order('created_at', { ascending: true })
        .limit(3)

      if (previousSegments && previousSegments.length > 0) {
        storyContext = previousSegments.map((seg: any) => seg.segment_text).join('\n\n')
      }
    }

    // Build character context
    let characterContext = ''
    if (characters && characters.length > 0) {
      characterContext = `\n\nCharacters: ${characters.map((char: any) => `${char.name}: ${char.description}`).join(', ')}`
    }

    // Create the prompt for Llama
    const isFirstSegment = !storyId || !parentSegmentId;
    const openingGuidance = isFirstSegment
      ? `OPENING: Begin like a true story opening (e.g., "Once upon a time", or a classic establishing line). Establish setting, character, and tone. No questions in the narration. End with a natural narrative beat (not a question). 120–180 words.`
      : `CONTINUATION: Continue smoothly from the story so far. 120–160 words. Do not recap more than 1 short sentence. No questions in the narration. End with a natural narrative beat (not a question).`;

    const systemPrompt = `Create an interactive children's story segment.

Age: ${ageNumber} years old (bucket: ${ageBucket})
Genre: ${genre}
${characterContext}

${storyContext ? `Story so far: ${storyContext}\n\n` : ''}
${choiceText ? `Continue from: "${choiceText}"\n\n` : ''}

User request: ${prompt}

STYLE RULES:
- Narration must NOT contain direct questions (avoid lines like "What do you do?" or any sentence ending with '?').
- No second-person questions; no addressing the reader.
- Show, don't tell. Vivid but concise; child-friendly vocabulary for the age bucket.
- ${openingGuidance}

CHOICES:
- Return exactly 3 short options that describe possible next actions.
- Imperative tone (e.g., "Follow the glow", "Open the door").
- Max 6 words each, no question marks.

Respond with JSON only:
{
  "story_text": "polished story text with no questions",
  "choices": ["imperative option 1", "imperative option 2", "imperative option 3"],
  "image_prompt": "detailed visual description for SDXL image generation",
  "is_end": false
}

IMPORTANT for image_prompt (Stable Diffusion XL):
- Include visual specifics (lighting, colors, composition)
- Mention art style (e.g., "digital art", "illustration", "fantasy art")
- Quality enhancers ("highly detailed", "vibrant colors", "professional illustration")
- Keep it child-friendly and match the story's tone
- Example: "A magical forest clearing with golden sunlight filtering through emerald leaves, a young adventurer in colorful clothes standing before an ancient oak tree with glowing runes, fantasy illustration, highly detailed, vibrant colors, digital art"`;

    console.log('🌐 Calling Llama API...')
    const startTime = Date.now()

    // Call Llama via OVH AI Endpoints with timeout
    let aiResponse: Response
    try {
      aiResponse = await fetch(ovhEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ovhToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: systemPrompt }],
          max_tokens: 800,
          temperature: 0.7
        }),
      })
    } catch (error) {
      console.error('❌ Llama API error:', error.message)
      throw new Error(`Story generation failed: ${error.message}`)
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('❌ Llama API error:', aiResponse.status, errorText)
      throw new Error(`Llama API error: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const generatedContent = aiData.choices[0]?.message?.content

    if (!generatedContent) {
      throw new Error('No content generated by Llama')
    }

    console.log('✅ Llama response received, length:', generatedContent.length)

    // Parse the JSON response from Llama
    let parsedResponse: any
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
        console.log('✅ JSON parsed successfully')
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.warn('⚠️ JSON parsing failed, using fallback')
      // Fallback if JSON parsing fails
      parsedResponse = {
        story_text: generatedContent,
        choices: ['Continue the adventure', 'Explore something new', 'Make a different choice'],
        image_prompt: `A ${genre} scene for children aged ${age}`,
        is_end: false
      }
    }

    // Validate and clean up the response
    const storyText = parsedResponse.story_text || generatedContent
    const choices = Array.isArray(parsedResponse.choices) && parsedResponse.choices.length === 3
      ? parsedResponse.choices
      : ['Continue the adventure', 'Explore something new', 'Make a different choice']

    const imagePrompt = parsedResponse.image_prompt || `A ${genre} story scene for children aged ${age}`
    const isEnd = parsedResponse.is_end || false

    // Create or get story ID
    let finalStoryId = storyId
    if (!finalStoryId) {
      // Map age to the correct target_age format
      // Use normalized bucket for story target age
      const targetAge = ageBucket

      const { data: newStory, error: storyError } = await supabase
        .from('stories')
        .insert({
          title: prompt.substring(0, 50) + '...',
          story_mode: genre,
          target_age: targetAge,
          is_public: false
        })
        .select('id')
        .single()

      if (storyError) {
        console.error('❌ Story creation error:', storyError)
        throw storyError
      }
      finalStoryId = newStory.id
      console.log('✅ New story created:', finalStoryId)
    }

    // Save the story segment
    const { data: segment, error: segmentError } = await supabase
      .from('story_segments')
      .insert({
        story_id: finalStoryId,
        parent_segment_id: parentSegmentId,
        segment_text: storyText,
        choices: choices,
        image_prompt: imagePrompt,
        is_end: isEnd
      })
      .select('*')
      .single()

    if (segmentError) {
      console.error('❌ Segment save error:', segmentError)
      throw segmentError
    }

    console.log('✅ Story segment saved with Llama:', segment.id)

    // Trigger image generation ASYNC (don't wait for it)
    let imageGenerationStatus = 'not_started'
    if (!skipImage) {
      console.log('🎨 Triggering async image generation for segment:', segment.id)
      imageGenerationStatus = 'pending'

      // Fire and forget - don't await this
      fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/regenerate-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ segmentId: segment.id })
      }).catch(error => {
        console.warn('⚠️ Error triggering image generation for segment:', segment.id, error.message)
      })
    } else {
      console.log('🚫 Skipping image generation as requested')
      imageGenerationStatus = 'skipped'
    }



    // Return response in expected format
    const response = {
      success: true,
      data: {
        id: segment.id,
        story_id: finalStoryId,
        segment_text: storyText,
        choices: choices,
        image_prompt: imagePrompt,
        is_end: isEnd,
        image_url: segment.image_url || null,
        image_generation_status: imageGenerationStatus,
        model_used: 'Meta-Llama-3_3-70B-Instruct'
      }
    }

    console.log('✅ Returning response:', Object.keys(response))

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('💥 Function error:', error.message)
    console.error('💥 Stack trace:', error.stack)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        model_used: 'Meta-Llama-3_3-70B-Instruct'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
