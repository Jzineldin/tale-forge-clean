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
const logStep = (step, details)=>{
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};
console.info('Customer Portal function started');

serve(async (req) => {
  console.log(`[CUSTOMER-PORTAL] ${req.method} request from origin: ${req.headers.get('origin')}`);

  // Handle CORS
  const origin = req.headers.get('origin');
  // Set proper CORS origin if it's in our allowed list
  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  }

  if (req.method === "OPTIONS") {
    console.log('[CUSTOMER-PORTAL] Handling OPTIONS preflight request');
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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified", {
      keyLength: stripeKey.length,
      keyPrefix: stripeKey.substring(0, 7)
    });
    // Verify Supabase environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl) throw new Error("SUPABASE_URL is not set");
    if (!supabaseServiceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    logStep("Supabase environment verified");
    // Initialize Supabase client with service role key for database access
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", {
      userId: user.id,
      email: user.email
    });
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16"
    });
    // Find customer by email first
    let customerId;
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });
    if (customers.data.length === 0) {
      // Try to find customer in our database
      logStep("Looking up customer in database", {
        userId: user.id
      });
      const { data: subscriberData, error: dbError } = await supabaseClient.from('subscribers').select('stripe_customer_id').eq('user_id', user.id).single();
      if (dbError) {
        logStep("Database lookup error", {
          error: dbError
        });
        throw new Error(`Database error: ${dbError.message}`);
      }
      if (subscriberData?.stripe_customer_id) {
        customerId = subscriberData.stripe_customer_id;
        logStep("Found Stripe customer from database", {
          customerId
        });
      } else {
        logStep("No customer found in database", {
          subscriberData
        });
        throw new Error(`No Stripe customer found for email: ${user.email}. Please contact support.`);
      }
    } else {
      customerId = customers.data[0].id;
      logStep("Found Stripe customer by email", {
        customerId
      });
    }
    // Use the origin from request headers or fallback to allowed origins
    const returnOrigin = origin && allowedOrigins.includes(origin) ? origin : 'https://tale-forge.io';
    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${returnOrigin}/pricing`
    });
    logStep("Customer portal session created", {
      sessionId: portalSession.id,
      url: portalSession.url
    });
    return new Response(JSON.stringify({
      url: portalSession.url
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", {
      message: errorMessage
    });
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
})
