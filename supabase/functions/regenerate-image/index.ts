import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { segmentId, prompt, testMode } = await req.json()

    console.log('🎨 Starting optimized image generation:', { segmentId, testMode, promptLength: prompt?.length })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    let imagePrompt = prompt
    let segmentData = null

    // Get segment data if segmentId provided
    if (segmentId && !testMode) {
      const { data: segment, error: segmentError } = await supabase
        .from('story_segments')
        .select('image_prompt, story_id')
        .eq('id', segmentId)
        .single()

      if (segmentError) {
        console.error('❌ Error fetching segment:', segmentError)
        throw new Error('Segment not found')
      }

      segmentData = segment
      imagePrompt = segment.image_prompt
      console.log('📝 Using segment image prompt:', imagePrompt?.substring(0, 100))
    }

    if (!imagePrompt) {
      throw new Error('No image prompt provided')
    }

    // Enhanced prompt optimization for SDXL
    const optimizedPrompt = enhancePromptForSDXL(imagePrompt)
    console.log('✨ Enhanced prompt:', optimizedPrompt.substring(0, 150))

    // Get OVH AI configuration for Stable Diffusion XL
    const ovhToken = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN')
    const sdxlEndpoint = 'https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image'

    if (!ovhToken) {
      throw new Error('OVH_AI_ENDPOINTS_ACCESS_TOKEN not configured')
    }

    console.log('🎨 Calling Stable Diffusion XL with optimized settings...')

    // Call SDXL with optimized parameters
    const imageResponse = await fetch(sdxlEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ovhToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: optimizedPrompt,
        negative_prompt: "ugly, blurry, low quality, distorted, deformed, disfigured, bad anatomy, wrong proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, bad proportions, extra fingers, long neck, cross-eyed, mutated, bad body, bad hands, bad fingers, text, watermark, signature",
        width: 1024,
        height: 1024,
        steps: 30,
        guidance_scale: 7.5,
        scheduler: "DPMSolverMultistepScheduler",
        seed: Math.floor(Math.random() * 1000000),
        num_inference_steps: 30,
        safety_checker: true
      }),
    })

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text()
      console.error('❌ SDXL API error:', imageResponse.status, errorText)
      throw new Error(`Image generation failed: ${imageResponse.status}`)
    }

    // SDXL returns raw image data, not JSON
    const imageBuffer = new Uint8Array(await imageResponse.arrayBuffer())
    console.log('✅ SDXL response received, image size:', imageBuffer.length)

    const fileName = `story-images/${segmentId || 'test'}-${Date.now()}.png`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('story-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      throw new Error('Failed to upload image')
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('story-images')
      .getPublicUrl(fileName)

    const imageUrl = urlData.publicUrl
    console.log('✅ Image uploaded:', imageUrl)

    // Update segment with image URL if not test mode
    if (segmentId && !testMode) {
      const { error: updateError } = await supabase
        .from('story_segments')
        .update({
          image_url: imageUrl,
          image_generation_status: 'completed'
        })
        .eq('id', segmentId)

      if (updateError) {
        console.error('❌ Error updating segment:', updateError)
        throw new Error('Failed to update segment with image')
      }

      console.log('✅ Segment updated with image URL')
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: imageUrl,
        message: testMode ? 'Test image generated successfully' : 'Image generated and saved',
        optimizedPrompt: optimizedPrompt
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('💥 Image generation error:', error.message)
    console.error('💥 Stack trace:', error.stack)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

// Enhanced prompt optimization function for SDXL
function enhancePromptForSDXL(originalPrompt: string): string {
  // Remove any existing quality modifiers to avoid duplication
  let cleanPrompt = originalPrompt
    .replace(/\b(highly detailed|high quality|professional|digital art|illustration)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Add SDXL-optimized quality enhancers
  const qualityEnhancers = [
    "highly detailed",
    "professional illustration",
    "vibrant colors",
    "sharp focus",
    "digital art",
    "masterpiece",
    "best quality",
    "8k resolution"
  ]

  // Add style modifiers for children's content
  const styleModifiers = [
    "children's book illustration style",
    "friendly and colorful",
    "warm lighting"
  ]

  // Combine everything
  const enhancedPrompt = [
    cleanPrompt,
    ...styleModifiers,
    ...qualityEnhancers
  ].join(', ')

  return enhancedPrompt
}