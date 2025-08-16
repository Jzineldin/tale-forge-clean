import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface CachedSubscriptionData {
  subscribed: boolean;
  subscription_tier: string;
  subscription_end?: string | null;
  is_active?: boolean;
  timestamp: number;
}

// Cache duration: 30 seconds for subscription data
const CACHE_DURATION = 30 * 1000;
const subscriptionCache = new Map<string, CachedSubscriptionData>();

export const useOptimizedSubscription = () => {
  const { user, subscription: authSubscription, subscriptionLoading } = useAuth();
  const [optimizedSubscription, setOptimizedSubscription] = useState(authSubscription);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCachedSubscription = (userId: string): CachedSubscriptionData | null => {
    const cached = subscriptionCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached;
    }
    return null;
  };

  const setCachedSubscription = (userId: string, data: CachedSubscriptionData) => {
    subscriptionCache.set(userId, { ...data, timestamp: Date.now() });
  };

  const fetchOptimizedSubscription = async (userId: string) => {
    // Check cache first
    const cached = getCachedSubscription(userId);
    if (cached) {
      setOptimizedSubscription({
        subscribed: cached.subscribed,
        subscription_tier: cached.subscription_tier,
        subscription_end: cached.subscription_end,
      });
      return;
    }

    // Prevent multiple simultaneous requests
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) {
      return;
    }
    lastFetchRef.current = now;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      // Use RPC function for better performance
      const { data, error } = await supabase
        .rpc('get_effective_tier', { user_id: userId })
        .abortSignal(abortControllerRef.current.signal);

      if (error) {
        console.warn('Failed to fetch optimized subscription:', error);
        // Fallback to auth subscription
        setOptimizedSubscription(authSubscription);
        return;
      }

      const subscriptionData = {
        subscribed: data?.tier !== 'Free',
        subscription_tier: data?.tier || 'Free',
        subscription_end: data?.subscription_end || null,
      };

      // Cache the result
      setCachedSubscription(userId, {
        ...subscriptionData,
        timestamp: Date.now(),
      });

      setOptimizedSubscription(subscriptionData);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.warn('Error fetching optimized subscription:', error);
        setOptimizedSubscription(authSubscription);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchOptimizedSubscription(user.id);
    } else {
      setOptimizedSubscription({
        subscribed: false,
        subscription_tier: 'Free',
        subscription_end: null,
      });
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user?.id]);

  // Sync with auth subscription when it changes
  useEffect(() => {
    if (!isLoading && !subscriptionLoading) {
      setOptimizedSubscription(authSubscription);
    }
  }, [authSubscription, isLoading, subscriptionLoading]);

  return {
    subscription: optimizedSubscription,
    isLoading: isLoading || subscriptionLoading,
    refresh: () => user?.id && fetchOptimizedSubscription(user.id),
  };
};
