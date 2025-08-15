import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ?  -  : '';
  console.log([STRIPE-WEBHOOK] );
};

console.info('Stripe Webhook function started');

serve(async (req) => {
  console.log([STRIPE-WEBHOOK]  request);
  
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    logStep("Webhook received");
    
    // Verify environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    if (!supabaseUrl) throw new Error("SUPABASE_URL is not set");
    if (!supabaseServiceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    
    // Initialize clients
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }
    
    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { eventType: event.type });
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response("Webhook signature verification failed", { status: 400 });
    }
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { sessionId: session.id });
        
        if (session.mode === 'subscription' && session.subscription) {
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const customerId = session.customer as string;
          const userId = session.metadata?.user_id;
          const tier = session.metadata?.tier || 'Core';
          
          if (!userId) {
            logStep("No user_id in session metadata", { sessionId: session.id });
            break;
          }
          
          // Update subscriber record
          const { error: updateError } = await supabaseClient
            .from('subscribers')
            .update({
              subscribed: true,
              is_active: subscription.status === 'active',
              subscription_tier: tier,
              subscription_start: new Date(subscription.current_period_start * 1000).toISOString(),
              subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
              stripe_customer_id: customerId
            })
            .eq('user_id', userId);
            
          if (updateError) {
            logStep("Error updating subscriber", { error: updateError, userId });
          } else {
            logStep("Subscriber updated successfully", { userId, tier });
          }
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        logStep("Subscription updated", { 
          subscriptionId: subscription.id, 
          status: subscription.status 
        });
        
        // Find user by customer ID
        const { data: subscriber, error: findError } = await supabaseClient
          .from('subscribers')
          .select('user_id, subscription_tier')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();
          
        if (findError || !subscriber) {
          logStep("Could not find subscriber", { customerId, error: findError });
          break;
        }
        
        // Update subscription status
        const { error: updateError } = await supabaseClient
          .from('subscribers')
          .update({
            is_active: subscription.status === 'active',
            subscription_start: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
            subscribed: ['active', 'trialing'].includes(subscription.status)
          })
          .eq('stripe_customer_id', customerId);
          
        if (updateError) {
          logStep("Error updating subscription", { error: updateError, customerId });
        } else {
          logStep("Subscription updated successfully", { customerId, status: subscription.status });
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        logStep("Subscription cancelled", { subscriptionId: subscription.id });
        
        // Update subscriber to free tier
        const { error: updateError } = await supabaseClient
          .from('subscribers')
          .update({
            subscribed: false,
            is_active: false,
            subscription_tier: 'Free',
            subscription_end: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);
          
        if (updateError) {
          logStep("Error updating cancelled subscription", { error: updateError, customerId });
        } else {
          logStep("Subscription cancelled successfully", { customerId });
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        logStep("Payment failed", { invoiceId: invoice.id });
        
        // Optionally handle payment failures (e.g., send notification)
        // For now, just log it
        break;
      }
      
      default:
        logStep("Unhandled event type", { eventType: event.type });
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
});
