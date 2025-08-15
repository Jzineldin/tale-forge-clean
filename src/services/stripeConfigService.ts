/**
 * Secure Stripe Configuration Service
 * Fetches Stripe configuration from backend to avoid hardcoded credentials
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { initializeStripeConfig, type StripeConfig } from '@/config/stripe';

let configInitialized = false;
let configPromise: Promise<StripeConfig> | null = null;

/**
 * Fetch Stripe configuration from backend securely
 */
export async function fetchStripeConfig(): Promise<StripeConfig> {
  if (configInitialized) {
    return Promise.resolve({} as StripeConfig); // Already initialized
  }

  if (configPromise) {
    return configPromise; // Return existing promise to avoid duplicate requests
  }

  configPromise = (async () => {
    try {
      console.log('Fetching Stripe configuration from backend...');
      
      const { data, error } = await supabase.functions.invoke('get-stripe-config');
      
      if (error) {
        console.error('Failed to fetch Stripe config:', error);
        
        // Show user-friendly error message for CORS issues
        if (error.message?.includes('CORS') || error.message?.includes('Access-Control-Allow-Origin')) {
          toast.error('Configuration error: Unable to connect to payment service. Please try again later or contact support.');
          throw new Error('CORS configuration error - payment service unavailable');
        }
        
        // Show user-friendly error for other network issues
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          toast.error('Network error: Please check your connection and try again.');
          throw new Error(`Network error: ${error.message}`);
        }
        
        toast.error('Payment configuration error. Please contact support if this persists.');
        throw new Error(`Failed to fetch Stripe configuration: ${error.message}`);
      }

      if (!data || !data.priceIds) {
        throw new Error('Invalid Stripe configuration received from backend');
      }

      const config: StripeConfig = {
        priceIds: data.priceIds,
        tierNames: {},
        priceToTier: {}
      };

      // Build reverse mappings
      Object.entries(data.priceIds).forEach(([tier, priceId]) => {
        if (priceId && typeof priceId === 'string') {
          const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
          config.tierNames[priceId as string] = tierName;
          config.priceToTier[tierName] = priceId as string;
        }
      });

      // Initialize the configuration
      initializeStripeConfig(config);
      configInitialized = true;
      
      console.log('Stripe configuration initialized successfully');
      return config;
    } catch (error) {
      configPromise = null; // Reset promise on error to allow retry
      throw error;
    }
  })();

  return configPromise;
}

/**
 * Ensure Stripe configuration is loaded before use
 */
export async function ensureStripeConfig(): Promise<void> {
  if (!configInitialized) {
    await fetchStripeConfig();
  }
}

/**
 * Reset configuration (for testing or re-initialization)
 */
export function resetStripeConfig(): void {
  configInitialized = false;
  configPromise = null;
}