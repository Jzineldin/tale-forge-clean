import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import { migrateAnonymousStories, hasAnonymousStories } from '@/utils/anonymousStoryMigration';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end?: string | null;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  subscription: SubscriptionData;
  subscriptionLoading: boolean;
  refreshSubscription: () => Promise<void>;
  initialized: boolean;
  initializationError: Error | null;
}

// Context safety guard
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return safe defaults instead of throwing to prevent initialization errors
    console.warn('useAuth called outside of AuthProvider context, returning defaults');
    return {
      user: null,
      session: null,
      loading: true,
      isAuthenticated: false,
      subscription: { subscribed: false, subscription_tier: null },
      subscriptionLoading: false,
      signIn: async (): Promise<void> => { throw new Error('Auth not initialized') },
      signUp: async (): Promise<void> => { throw new Error('Auth not initialized') },
      signOut: async (): Promise<void> => { throw new Error('Auth not initialized') },
      refreshSubscription: async (): Promise<void> => {},
      initialized: false,
      initializationError: null
    };
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<Error | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: 'Free',
    subscription_end: null,
  });
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const authSubscriptionRef = useRef<any>(null);
  const isAuthenticated = !!user;

  const refreshSubscription = async (userOverride?: User | null): Promise<void> => {
    const currentUser = userOverride || user;
    
    if (!currentUser) {
      console.log('AuthProvider: No user, setting subscription to Free');
      setSubscription({
        subscribed: false,
        subscription_tier: 'Free',
        subscription_end: null,
      });
      return;
    }

    setSubscriptionLoading(true);
    try {
      console.log('AuthProvider: Fetching subscription data for user:', currentUser.id, 'email:', currentUser.email);
      
      // Add timeout to prevent hanging queries
      // Try direct query first with shorter timeout
      const queryPromise = supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 5000) // Reduced to 5 seconds
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.log('AuthProvider: No subscription data found by user_id, trying by email...', error.message);
        
        // Try fallback by email with timeout
        const emailQueryPromise = supabase
          .from('subscribers')
          .select('*')
          .eq('email', currentUser.email || '')
          .single();
          
        const emailTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email query timeout')), 10000)
        );
          
        const { data: emailData, error: emailError } = await Promise.race([emailQueryPromise, emailTimeoutPromise]) as any;
          
        if (emailError) {
          console.log('AuthProvider: No subscription data found by email either:', emailError.message);
          setSubscription({
            subscribed: false,
            subscription_tier: 'Free',
            subscription_end: null,
          });
          return;
        }
        
        console.log('AuthProvider: Found subscription by email, but user_id mismatch!', emailData);
        console.log('AuthProvider: Expected user_id:', currentUser.id, 'Found user_id:', emailData.user_id);
        
        // Use the data we found by email
        setSubscription({
          ...emailData,
          subscribed: emailData.subscribed || false,
          subscription_tier: emailData.subscription_tier || 'Free',
          subscription_end: emailData.subscription_end || null,
        });
        return;
      }

      console.log('AuthProvider: Subscription data loaded successfully:', data);
      console.log('AuthProvider: Setting subscription state:', {
        subscribed: data.subscribed,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end
      });

      setSubscription({
        ...data,
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || 'Free',
        subscription_end: data.subscription_end || null,
      });

    } catch (error) {
      console.error('AuthProvider: Error fetching subscription data:', error);
      setSubscription({
        subscribed: false,
        subscription_tier: 'Free',
        subscription_end: null,
      });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const initializeAuth = async (): Promise<void> => {
    try {
      console.log('AuthProvider: Authentication initialized successfully!');
      
      // Set up auth state listener
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);
          
          // Only set loading to false after initial setup
          if (loading) {
            setLoading(false);
          }
          
          // Refresh subscription when user logs in
          if (session?.user && event === 'SIGNED_IN') {
            console.log('User signed in, refreshing subscription...');
            await refreshSubscription(session.user);
            
            // Migrate anonymous stories when user logs in
            if (hasAnonymousStories()) {
              setTimeout(() => {
                migrateAnonymousStories(session.user.id)
                  .catch(error => {
                    console.error('Failed to migrate anonymous stories:', error);
                  });
              }, 1500); // Slightly longer delay to ensure auth is fully established
            }
          } else if (!session?.user) {
            console.log('User signed out, resetting subscription...');
            // Reset subscription when user logs out
            setSubscription({
              subscribed: false,
              subscription_tier: 'Free',
              subscription_end: null,
            });
          }
        }
      );
      
      // Store the subscription reference for cleanup
      authSubscriptionRef.current = authSubscription;

      // Check for existing session
      console.log('AuthProvider: Checking for existing session...');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      console.log('AuthProvider: Initial session check result:', data.session?.user?.email);
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      // Refresh subscription if user is already logged in
      if (data.session?.user) {
        console.log('AuthProvider: User already logged in, refreshing subscription...');
        await refreshSubscription(data.session.user);
      }
      
      setInitialized(true);
      setLoading(false);
      
    } catch (error) {
      console.error('AuthProvider: Error initializing auth:', error);
      setInitializationError(error as Error);
      setLoading(false);
      
      // Even if there's an error, mark as initialized so the app can show recovery UI
      setInitialized(true);
    }
  };

  // Initialize auth immediately since Supabase client is pre-configured
  useEffect(() => {
    console.log('AuthProvider: Preparing to initialize auth');
    
    // Properly handle async function in useEffect
    const initialize = async () => {
      await initializeAuth();
    };
    
    initialize();
    
    return () => {
      // Clean up any existing subscription
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      console.log('AuthProvider: Attempting to sign in user:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log('AuthProvider: Sign in successful');
      
      // Let the auth state change handler take care of setting user state
      // and refreshing subscription data
      
    } catch (error: any) {
      console.error('AuthProvider: Sign in error:', error);
      throw new Error(error.message || 'Sign in failed');
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      console.log('AuthProvider: Attempting to sign up user:', email);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        throw error;
      }

      console.log('AuthProvider: Sign up successful, confirmation email sent');
      
      // Show success message
      toast.success('Account created! Please check your email to confirm your account.');
      
    } catch (error: any) {
      console.error('AuthProvider: Sign up error:', error);
      throw new Error(error.message || 'Sign up failed');
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      console.log('AuthProvider: Attempting to sign out');
      
      // Add timeout to prevent hanging
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign out timeout')), 5000)
      );
      
      const { error } = await Promise.race([signOutPromise, timeoutPromise]) as any;
      
      if (error) {
        console.warn('AuthProvider: Sign out error (continuing anyway):', error.message);
      } else {
        console.log('AuthProvider: Sign out successful');
      }
      
      // Reset all state regardless of sign out result
      setUser(null);
      setSession(null);
      setSubscription({
        subscribed: false,
        subscription_tier: 'Free',
        subscription_end: null,
      });
      
    } catch (error: any) {
      console.error('AuthProvider: Sign out error:', error);
      throw new Error(error.message || 'Sign out failed');
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
    subscription,
    subscriptionLoading,
    refreshSubscription,
    initialized,
    initializationError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
