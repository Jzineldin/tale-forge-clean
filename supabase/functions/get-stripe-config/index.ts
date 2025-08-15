import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ?  -  : '';
  console.log([GET-STRIPE-CONFIG] );
};

console.info('Get Stripe Config function started');

serve(async (req) => {
  console.log([GET-STRIPE-CONFIG]  request);
  
  // Handle CORS
  if (req.method === "OPTIONS") {
    console.log('[GET-STRIPE-CONFIG] Handling OPTIONS preflight request');
    return new Response(null, {
      headers: {
        ...corsHeaders,
        "Access-Control-Max-Age": "86400"
      },
      status: 200
    });
  }

  try {
    logStep("Function started");
    
    // Get Stripe publishable key from environment
    const publishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");
    if (!publishableKey) {
      throw new Error("STRIPE_PUBLISHABLE_KEY is not set");
    }
    
    // Validate that it's actually a publishable key
    if (!publishableKey.startsWith('pk_')) {
      throw new Error("Invalid Stripe publishable key format");
    }
    
    logStep("Stripe publishable key verified", {
      keyPrefix: publishableKey.substring(0, 7),
      keyLength: publishableKey.length
    });

    // Define price IDs and tier mappings
    const priceIds = {
      free: 'price_free', // Free tier doesn't need a real price ID
      core: 'price_1RvIkAK8ILu7UAIcMGAtbWnS', // Core .99/month
      pro: 'price_1RvIknK8ILu7UAIclUEYX3oz'   // Pro .99/month
    };

    // Create tier name mappings
    const tierNames: Record<string, string> = {};
    const priceToTier: Record<string, string> = {};
    
    // Map price IDs to tier names
    Object.entries(priceIds).forEach(([tier, priceId]) => {
      tierNames[priceId] = tier.charAt(0).toUpperCase() + tier.slice(1);
      priceToTier[tier] = priceId;
    });

    const config = {
      publishableKey,
      priceIds,
      tierNames,
      priceToTier
    };

    logStep("Configuration prepared", {
      priceIdsCount: Object.keys(priceIds).length,
      tierNamesCount: Object.keys(tierNames).length
    });

    return new Response(JSON.stringify(config), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in get-stripe-config", { message: errorMessage });
    
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
