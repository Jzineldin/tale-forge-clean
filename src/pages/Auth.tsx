
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signed in successfully!');
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        // Assign founder status if user was created successfully
        if (data.user) {
          try {
            const response = await supabase.functions.invoke('assign-founder-status', {
              body: { userId: data.user.id }
            });
            
            if (response.error) {
              console.error('Failed to assign founder status:', response.error);
            } else {
              toast.success('Welcome, Founder! Check your email for the confirmation link.');
            }
          } catch (founderError) {
            console.error('Error assigning founder status:', founderError);
            toast.info('Check your email for the confirmation link.');
          }
        } else {
          toast.info('Check your email for the confirmation link.');
        }
      }
    } catch (signupError) {
      console.error('Signup error:', signupError);
      toast.error('An error occurred during signup. Please try again.');
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      toast.error(error.message);
      setGoogleLoading(false);
    }
    // Don't set loading to false here as the user will be redirected
  };

  return (
    <div className="auth-page">
      <div className="scene-bg"></div>
      <div className="auth-container">
        <div className="auth-card">
          <div className="text-center mb-8">
            <div className="cosmic-branding mb-6">
              <div className="cosmic-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                </svg>
              </div>
              <h1 className="cosmic-title fantasy-heading">TALE FORGE</h1>
            </div>
            <h2 className="auth-title">Create Your Account</h2>
            <p className="auth-subtitle">
              Join the first 200 founders and start your storytelling journey
            </p>
          </div>

          {/* Social Auth Buttons */}
          <button 
            className="auth-button google-button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </button>
          
          <div className="divider">or continue with email</div>

          <Tabs defaultValue="signin" className="auth-tabs">
            <TabsList className="auth-tabs-list">
              <TabsTrigger value="signin" className="auth-tab">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="auth-tab">🚀 Become a Founder</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="auth-button signin-button"
                  disabled={loading || googleLoading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <div className="founder-info mb-4">
                <p className="text-amber-300 text-sm">
                  Join our exclusive founder program and unlock lifetime benefits!
                </p>
              </div>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="auth-button signup-button"
                  disabled={loading || googleLoading}
                >
                  {loading ? 'Creating Account...' : '🚀 Become a Founder'}
                </button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
