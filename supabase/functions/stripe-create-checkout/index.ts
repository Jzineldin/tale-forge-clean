import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:8082',
  'https://tale-forge.io'
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ?  -  : '';
  console.log([STRIPE-CHECKOUT] );
};

console.info('Stripe Checkout function started');

serve(async (req) => {
  console.log([STRIPE-CHECKOUT]  request from origin: );
  
  // Handle CORS
  const origin = req.headers.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  }

  if (req.method === "OPTIONS") {
    console.log('[STRIPE-CHECKOUT] Handling OPTIONS preflight request');
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
    
    const { priceId, tier } = await req.json();
    
    if (!priceId || !tier) {
      throw new Error("Missing required parameters: priceId and tier");
    }
    
    logStep("Request parameters", { priceId, tier });

    // Verify Stripe environment
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    // Verify Supabase environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl) throw new Error("SUPABASE_URL is not set");
    if (!supabaseServiceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    
    logStep("Environment verified");

    // Initialize clients
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(Authentication error: );
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if customer already exists
    let customerId: string;
    
    // First check our database
    const { data: subscriberData, error: dbError } = await supabaseClient
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (dbError) {
      logStep("Database lookup error", { error: dbError });
    }

    if (subscriberData?.stripe_customer_id) {
      customerId = subscriberData.stripe_customer_id;
      logStep("Found existing customer in database", { customerId });
    } else {
      // Check Stripe for existing customer by email
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer in Stripe", { customerId });
        
        // Update our database with the customer ID
        await supabaseClient
          .from('subscribers')
          .upsert({
            user_id: user.id,
            email: user.email,
            stripe_customer_id: customerId,
            subscribed: false,
            subscription_tier: 'Free'
          });
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            user_id: user.id
          }
        });
        
        customerId = customer.id;
        logStep("Created new customer", { customerId });
        
        // Save to database
        await supabaseClient
          .from('subscribers')
          .upsert({
            user_id: user.id,
            email: user.email,
            stripe_customer_id: customerId,
            subscribed: false,
            subscription_tier: 'Free'
          });
      }
    }

    // Determine return URL based on origin
    const returnOrigin = origin && allowedOrigins.includes(origin) ? origin : 'https://tale-forge.io';
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: ${returnOrigin}/payment-success?session_id={CHECKOUT_SESSION_ID},
      cancel_url: ${returnOrigin}/pricing,
      metadata: {
        user_id: user.id,
        tier: tier
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          tier: tier
        }
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({
      url: session.url,
      sessionId: session.id
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-create-checkout", { message: errorMessage });
    
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
