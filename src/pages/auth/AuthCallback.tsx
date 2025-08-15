import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { OneRingLoader } from '@/components/ui/OneRingLoader';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('[AUTH_CALLBACK] Starting auth callback processing');
      console.log('[AUTH_CALLBACK] Current URL:', window.location.href);
      console.log('[AUTH_CALLBACK] Hash:', window.location.hash);
      
      try {
        // Extract tokens from URL hash
        const hash = window.location.hash.substring(1);
        console.log('[AUTH_CALLBACK] Processing hash:', hash);
        
        const params = new URLSearchParams(hash);
        
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresAt = params.get('expires_at');
        const tokenType = params.get('token_type');
        
        console.log('[AUTH_CALLBACK] Extracted tokens:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          expiresAt,
          tokenType,
          accessTokenLength: accessToken?.length
        });
        
        if (accessToken && refreshToken && expiresAt) {
          console.log('[AUTH_CALLBACK] Setting session with extracted tokens');
          
          // Set the session using the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          console.log('[AUTH_CALLBACK] setSession result:', { 
            user: data?.user?.id, 
            session: !!data?.session,
            error: error?.message 
          });

          if (error) {
            console.error('[AUTH_CALLBACK] setSession error:', error);
            setError(`Authentication failed: ${error.message}`);
            toast.error('Authentication failed');
            setTimeout(() => navigate('/auth/signin', { replace: true }), 2000);
            return;
          }

          if (data.user && data.session) {
            console.log('[AUTH_CALLBACK] User authenticated successfully:', data.user.id);
            
            // Check if this is a new user and send welcome email
            const isNewUser = data.user.created_at && 
              new Date(data.user.created_at).getTime() > Date.now() - 60000; // Created in last minute
            
            if (isNewUser) {
              console.log('[AUTH_CALLBACK] New user detected, sending welcome email');
              try {
                await supabase.functions.invoke('send-welcome-email', {
                  body: {
                    userId: data.user.id,
                    email: data.user.email,
                    fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
                    isNewUser: true,
                    signupMethod: 'google'
                  }
                });
                console.log('[AUTH_CALLBACK] Welcome email sent successfully');
              } catch (emailError) {
                console.error('[AUTH_CALLBACK] Failed to send welcome email:', emailError);
                // Don't block user flow if email fails
              }
            }
            
            toast.success('Successfully signed in!');
            
            // Small delay to ensure session is fully established
            setTimeout(() => {
              const redirectTo = searchParams.get('redirect') || '/';
              console.log('[AUTH_CALLBACK] Redirecting to:', redirectTo);
              navigate(redirectTo, { replace: true });
            }, 500);
          } else {
            console.error('[AUTH_CALLBACK] No user data received despite successful setSession');
            setError('Authentication completed but no user data received');
            setTimeout(() => navigate('/auth/signin', { replace: true }), 2000);
          }
        } else {
          // Check for error parameters in hash
          const errorParam = params.get('error');
          const errorDescription = params.get('error_description');
          
          if (errorParam) {
            console.error('[AUTH_CALLBACK] OAuth error:', errorParam, errorDescription);
            setError(`OAuth error: ${errorDescription || errorParam}`);
            toast.error(`Authentication failed: ${errorDescription || errorParam}`);
          } else {
            console.log('[AUTH_CALLBACK] No auth tokens found in callback, checking current session');
            
            // Check if user is already signed in
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              console.log('[AUTH_CALLBACK] User already authenticated, redirecting');
              const redirectTo = searchParams.get('redirect') || '/';
              navigate(redirectTo, { replace: true });
              return;
            }
            
            console.log('[AUTH_CALLBACK] No tokens and no existing session, redirecting to signin');
            setError('No authentication tokens received');
          }
          
          setTimeout(() => navigate('/auth/signin', { replace: true }), 2000);
        }
      } catch (error) {
        console.error('[AUTH_CALLBACK] Processing error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(`Authentication processing failed: ${errorMessage}`);
        toast.error('Authentication failed');
        setTimeout(() => navigate('/auth/signin', { replace: true }), 2000);
      } finally {
        setProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  if (processing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <OneRingLoader />
          <p className="text-white/80 mt-4">Completing authentication...</p>
          {error && (
            <p className="text-red-400 mt-4 max-w-md mx-auto text-sm">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-bold mb-4">Authentication Error</h2>
          <p className="text-red-400 mb-6 text-sm">{error}</p>
          <p className="text-white/60 text-sm">Redirecting to sign in page...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;