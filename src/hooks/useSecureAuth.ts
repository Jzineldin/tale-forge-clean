
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { validateInput } from '@/utils/security';
import { toast } from 'sonner';
import type { User, Session } from '@supabase/supabase-js';



export const useSecureAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Note: Session storage would go here if secureStorage was available
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInSecurely = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Validate inputs
      const validatedEmail = validateInput.email(email);
      
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Clear any existing auth state would go here
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedEmail,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Successfully signed in!');
        // Force page reload for clean state
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('Secure sign in failed:', error);
      toast.error(error.message || 'Sign in failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpSecurely = async (email: string, password: string): Promise<any> => {
    try {
      setLoading(true);
      
      // Validate inputs
      const validatedEmail = validateInput.email(email);
      
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Clear any existing auth state would go here
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: validatedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      if (data.user) {
        // Send welcome email for new user
        try {
          console.log('[SIGNUP] Sending welcome email for new user:', data.user.id);
          await supabase.functions.invoke('send-welcome-email', {
            body: {
              userId: data.user.id,
              email: data.user.email,
              fullName: data.user.user_metadata?.full_name,
              isNewUser: true,
              signupMethod: 'email'
            }
          });
          console.log('[SIGNUP] Welcome email sent successfully');
        } catch (emailError) {
          console.error('[SIGNUP] Failed to send welcome email:', emailError);
          // Don't block user flow if email fails
        }
        
        toast.success('Account created successfully! Please check your email to verify your account and welcome message.');
        return data;
      }
    } catch (error: any) {
      console.error('Secure sign up failed:', error);
      toast.error(error.message || 'Sign up failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOutSecurely = async () => {
    try {
      setLoading(true);
      
      // Clear secure storage would go here
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore errors
      }
      
      toast.success('Successfully signed out!');
      
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Secure sign out failed:', error);
      toast.error('Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    signIn: signInSecurely,
    signUp: signUpSecurely,
    signOut: signOutSecurely
  };
};
