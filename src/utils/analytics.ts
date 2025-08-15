/**
 * Analytics Utility
 * 
 * This utility provides functions for tracking events and user behavior.
 * It can be configured to work with various analytics services like Google Analytics,
 * Mixpanel, Amplitude, etc.
 */

// Define event properties type
type EventProperties = Record<string, any>;

// Define user properties type
type UserProperties = Record<string, any>;

/**
 * Track an event with optional properties
 * 
 * @param eventName The name of the event to track
 * @param properties Optional properties associated with the event
 */
export function logEvent(eventName: string, properties: EventProperties = {}): void {
  // Log to console in development
  if (!import.meta.env.PROD && typeof console !== 'undefined' && console.log) {
    console.log('[Analytics Event]', eventName, properties);
  }

  // In a real implementation, this would send the event to your analytics service
  // Example with Google Analytics:
  // gtag('event', eventName, properties);
  
  // Example with Mixpanel:
  // mixpanel.track(eventName, properties);
  
  // For now, we'll just log it
  try {
    const eventData = {
      event: eventName,
      properties,
      timestamp: new Date().toISOString()
    };
    
    // In production, this would send to your analytics service
    if (import.meta.env.PROD) {
      // Example implementation:
      // sendToAnalytics(eventData);
      if (typeof console !== 'undefined' && console.info) {
        console.info('[Analytics] Event tracked:', eventData);
      }
    }
  } catch (error) {
    // Fallback if analytics tracking fails
    if (typeof console !== 'undefined' && console.error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  }
}

/**
 * Identify a user and set their properties
 * 
 * @param userId The unique identifier for the user
 * @param properties User properties to set
 */
export function identifyUser(userId: string, properties: UserProperties = {}): void {
  // Log to console in development
  if (!import.meta.env.PROD && typeof console !== 'undefined' && console.log) {
    console.log('[Analytics Identify]', userId, properties);
  }
  
  // In a real implementation, this would identify the user in your analytics service
  // Example with Mixpanel:
  // mixpanel.identify(userId);
  // mixpanel.people.set(properties);
  
  // For now, we'll just log it
  try {
    const userData = {
      userId,
      properties,
      timestamp: new Date().toISOString()
    };
    
    // In production, this would send to your analytics service
    if (import.meta.env.PROD) {
      // Example implementation:
      // identifyUserInAnalytics(userData);
      if (typeof console !== 'undefined' && console.info) {
        console.info('[Analytics] User identified:', userData);
      }
    }
  } catch (error) {
    // Fallback if user identification fails
    if (typeof console !== 'undefined' && console.error) {
      console.error('[Analytics] Failed to identify user:', error);
    }
  }
}

/**
 * Track a page view
 * 
 * @param pageName The name of the page
 * @param properties Additional properties for the page view
 */
export function trackPageView(pageName: string, properties: EventProperties = {}): void {
  // Log to console in development
  if (!import.meta.env.PROD && typeof console !== 'undefined' && console.log) {
    console.log('[Analytics Page View]', pageName, properties);
  }
  
  // In a real implementation, this would track a page view in your analytics service
  // Example with Google Analytics:
  // gtag('config', 'GA_MEASUREMENT_ID', {
  //   page_title: pageName,
  //   page_path: window.location.pathname,
  //   ...properties
  // });
  
  // For now, we'll just log it
  try {
    const pageData = {
      page: pageName,
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      properties,
      timestamp: new Date().toISOString()
    };
    
    // In production, this would send to your analytics service
    if (import.meta.env.PROD) {
      // Example implementation:
      // trackPageViewInAnalytics(pageData);
      if (typeof console !== 'undefined' && console.info) {
        console.info('[Analytics] Page view tracked:', pageData);
      }
    }
  } catch (error) {
    // Fallback if page view tracking fails
    if (typeof console !== 'undefined' && console.error) {
      console.error('[Analytics] Failed to track page view:', error);
    }
  }
}

/**
 * Track a conversion event (e.g., signup, purchase)
 * 
 * @param conversionType The type of conversion
 * @param value The monetary value of the conversion (if applicable)
 * @param properties Additional properties for the conversion
 */
export function trackConversion(
  conversionType: string,
  value?: number,
  properties: EventProperties = {}
): void {
  // Combine properties
  const conversionProperties = {
    ...properties,
    ...(value !== undefined ? { value } : {})
  };
  
  // Track as a regular event with conversion type
  logEvent(`conversion_${conversionType}`, conversionProperties);
  
  // In a real implementation, you might have additional conversion tracking
  // Example with Google Analytics:
  // gtag('event', 'conversion', {
  //   send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
  //   value: value,
  //   currency: 'USD',
  //   ...properties
  // });
}

/**
 * Initialize the analytics system
 * 
 * @param config Configuration options
 */
export function initAnalytics(config: {
  apiKey?: string;
  trackingId?: string;
  debug?: boolean;
} = {}): void {
  // In a real implementation, this would initialize your analytics service
  // Example with Mixpanel:
  // mixpanel.init(config.apiKey, { debug: config.debug });
  
  if (typeof console !== 'undefined' && console.info) {
    console.info('[Analytics] Initialized with config:', config);
  }
}

/**
 * Track Stripe-specific events
 */
export const stripeAnalytics = {
  /**
   * Track when a user views the pricing page
   */
  trackPricingPageView: (properties: EventProperties = {}) => {
    logEvent('pricing_page_view', properties);
  },
  
  /**
   * Track when a user starts the checkout process
   */
  trackCheckoutStarted: (tier: string, priceId: string, properties: EventProperties = {}) => {
    logEvent('checkout_started', {
      tier,
      price_id: priceId,
      ...properties
    });
  },
  
  /**
   * Track when a checkout is completed successfully
   */
  trackCheckoutCompleted: (
    tier: string,
    priceId: string,
    amount: number,
    sessionId: string,
    properties: EventProperties = {}
  ) => {
    logEvent('checkout_completed', {
      tier,
      price_id: priceId,
      amount,
      session_id: sessionId,
      ...properties
    });
    
    // Also track as a conversion
    trackConversion('subscription', amount, {
      tier,
      price_id: priceId,
      session_id: sessionId,
      ...properties
    });
  },
  
  /**
   * Track when a checkout is abandoned
   */
  trackCheckoutAbandoned: (
    tier: string,
    priceId: string,
    sessionId: string,
    properties: EventProperties = {}
  ) => {
    logEvent('checkout_abandoned', {
      tier,
      price_id: priceId,
      session_id: sessionId,
      ...properties
    });
  },
  
  /**
   * Track when a subscription is cancelled
   */
  trackSubscriptionCancelled: (
    tier: string,
    reason?: string,
    properties: EventProperties = {}
  ) => {
    logEvent('subscription_cancelled', {
      tier,
      reason,
      ...properties
    });
  },
  
  /**
   * Track when a subscription is upgraded
   */
  trackSubscriptionUpgraded: (
    fromTier: string,
    toTier: string,
    properties: EventProperties = {}
  ) => {
    logEvent('subscription_upgraded', {
      from_tier: fromTier,
      to_tier: toTier,
      ...properties
    });
  },
  
  /**
   * Track when a subscription is downgraded
   */
  trackSubscriptionDowngraded: (
    fromTier: string,
    toTier: string,
    properties: EventProperties = {}
  ) => {
    logEvent('subscription_downgraded', {
      from_tier: fromTier,
      to_tier: toTier,
      ...properties
    });
  }
};

/**
 * Track when a user signs up with a wallet
 *
 * @param userId The unique identifier for the user
 * @param properties Optional properties associated with the signup
 */
export function trackWalletSignup(userId: string, properties: Record<string, any> = {}): void {
  // Log to console in development
  if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined' && console.log) {
    console.log('[Analytics Wallet Signup]', userId, properties);
  }
  
  // Track as a regular event
  logEvent('wallet_signup', {
    user_id: userId,
    ...properties,
    timestamp: new Date().toISOString()
  });
}

/**
 * Track when a user signs up for the waitlist
 *
 * @param email The email address of the user
 * @param properties Optional properties associated with the signup
 */
export function trackWaitlistSignup(email: string, properties: Record<string, any> = {}): void {
  // Log to console in development
  if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined' && console.log) {
    console.log('[Analytics Waitlist Signup]', email, properties);
  }
  
  // Track as a regular event
  logEvent('waitlist_signup', {
    email,
    ...properties,
    timestamp: new Date().toISOString()
  });
}