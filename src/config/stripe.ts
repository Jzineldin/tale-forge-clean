/**
 * Centralized Stripe configuration
 * All Stripe-related constants should be defined here to avoid duplication
 * Security: Price IDs are now fetched from backend to avoid hardcoding production credentials
 */

// Stripe configuration interface
export interface StripeConfig {
  priceIds: {
    premium: string;
    pro: string;
    family: string;
    free: string;
  };
  tierNames: Record<string, string>;
  priceToTier: Record<string, string>;
}

// Default empty configuration - will be populated by backend
let stripeConfig: StripeConfig = {
  priceIds: {
    premium: '',
    pro: '',
    family: '',
    free: ''
  },
  tierNames: {},
  priceToTier: {}
};

// Function to initialize Stripe configuration from backend
export function initializeStripeConfig(config: StripeConfig): void {
  stripeConfig = config;
}

// Secure access to price IDs - throws error if not initialized
export function getStripeConfig(): StripeConfig {
  if (!stripeConfig.priceIds.premium) {
    throw new Error('Stripe configuration not initialized. Please fetch configuration from backend first.');
  }
  return stripeConfig;
}

// Legacy compatibility - deprecated, use getStripeConfig() instead
export const STRIPE_PRICE_IDS = {
  get premium() { return getStripeConfig().priceIds.premium; },
  get pro() { return getStripeConfig().priceIds.pro; },
  get family() { return getStripeConfig().priceIds.family; },
  get free() { return getStripeConfig().priceIds.free; }
};

// Dynamic tier names mapping
export const STRIPE_TIER_NAMES = new Proxy({}, {
  get(_target, prop: string) {
    try {
      return getStripeConfig().tierNames[prop];
    } catch {
      return undefined;
    }
  }
});

// Dynamic reverse mapping for tier name to price ID  
export const TIER_TO_PRICE_ID: Record<string, string> = new Proxy({}, {
  get(_target, prop: string) {
    try {
      return getStripeConfig().priceToTier[prop];
    } catch {
      return undefined;
    }
  }
}) as Record<string, string>;

// Stripe public key - only allow publishable keys
export const STRIPE_PUBLISHABLE_KEY = (() => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  if (key && !key.startsWith('pk_')) {
    console.error('Invalid Stripe publishable key format. Must start with pk_');
    return '';
  }
  return key;
})();

// Helper function to get price ID by tier name
export function getPriceIdByTier(tier: string): string | undefined {
  try {
    return getStripeConfig().priceToTier[tier];
  } catch {
    console.error('Stripe configuration not initialized');
    return undefined;
  }
}

// Helper function to get tier name by price ID
export function getTierByPriceId(priceId: string): string | undefined {
  try {
    return getStripeConfig().tierNames[priceId];
  } catch {
    console.error('Stripe configuration not initialized');
    return undefined;
  }
}

// Security: Function to validate price ID format
export function isValidPriceId(priceId: string): boolean {
  return /^price_[a-zA-Z0-9]+$/.test(priceId);
}

// Security: Function to validate all configuration
export function validateStripeConfig(config: StripeConfig): boolean {
  const { priceIds } = config;
  return Object.values(priceIds).every(priceId => isValidPriceId(priceId));
}