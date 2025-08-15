
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CheckoutParams {
  priceId: string;
  tier: string;
}

const createCheckoutSession = async ({ priceId, tier }: CheckoutParams) => {
  const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
    body: { priceId, tier },
  });

  if (error) {
    console.error('Supabase function error:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }

  if (!data) {
    throw new Error('No response from checkout service');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
};

export const useStripeCheckout = () => {
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      console.log('Checkout success:', data);
      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        toast.error('No checkout URL received');
      }
    },
    onError: (error: Error) => {
      console.error('Checkout error:', error);
      
      // Show specific error messages
      if (error.message.includes('placeholder price IDs')) {
        toast.error('Demo environment detected. Please configure real Stripe products to enable checkout.');
      } else if (error.message.includes('Invalid price ID')) {
        toast.error('Invalid pricing configuration. Please check your Stripe setup.');
      } else {
        toast.error(`Checkout failed: ${error.message}`);
      }
    },
  });
};
