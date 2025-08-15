import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const StripeElements = ({ priceId }: { priceId: string }) => {
  const [stripe, setStripe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        // Fetch Stripe configuration from Supabase function
        const { data, error } = await supabase.functions.invoke('get-stripe-config');
        
        if (error) {
          throw new Error(`Failed to fetch Stripe configuration: ${error.message}`);
        }
        
        if (!data || !data.publishableKey) {
          throw new Error('Stripe publishable key not found in configuration');
        }
        
        const stripeInstance = await loadStripe(data.publishableKey);
        setStripe(stripeInstance);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load payment options. Please try again later.');
        setLoading(false);
      }
    };
    
    initializeStripe();
  }, []);

  const handleSubscribe = async () => {
    if (!stripe) {
      setError('Payment system not ready');
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      // Create checkout session through our hook
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: { priceId, tier: priceId.includes('pro') ? 'Pro' : priceId.includes('premium') ? 'Premium' : 'Core' }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create checkout session');
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-muted">Loading...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-red-500 text-center text-sm">{error}</div>
        <Button
          onClick={handleSubscribe}
          disabled={processing}
          variant="orange-amber"
          size="lg"
          className="w-full font-bold"
        >
          {processing ? 'Processing...' : 'Subscribe'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleSubscribe}
        disabled={processing}
        variant="orange-amber"
        size="lg"
        className="w-full font-bold"
      >
        {processing ? 'Processing...' : 'Subscribe'}
      </Button>
    </div>
  );
};

export default StripeElements;
