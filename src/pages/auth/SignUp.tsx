import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SignUp = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const getStrengthText = (strength: number) => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordStrength < 50) {
      toast.error('Password is too weak. Please choose a stronger password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.fullName
          }
        }
      });

      if (error) throw error;

      // If user was created, assign founder status and send welcome email
      if (data.user) {
        try {
          // Assign founder status
          const { data: founderData } = await supabase.functions.invoke('assign-founder-status', {
            body: { userId: data.user.id }
          });

          // Send welcome email for new user
          try {
            await supabase.functions.invoke('send-welcome-email', {
              body: {
                userId: data.user.id,
                email: data.user.email,
                fullName: formData.fullName,
                isNewUser: true,
                signupMethod: 'email'
              }
            });
            console.log('Welcome email sent successfully');
          } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
            // Don't block user flow if email fails
          }

          if (founderData?.isFounder) {
            toast.success(`🎉 ${founderData.message}! Check your email to verify your account and get started.`);
          } else {
            toast.success('Account created! Please check your email to verify your account and get started.');
          }
        } catch (founderError) {
          console.error('Error assigning founder status:', founderError);
          toast.success('Account created! Please check your email to verify your account.');
        }
      }
      
      setEmailSent(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      
      toast.success('Confirmation email resent! Please check your inbox and spam folder.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend confirmation email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Google sign up failed');
      setGoogleLoading(false);
    }
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
            <h2 className="auth-title">🚀 Become a Founder</h2>
            <p className="auth-subtitle">
              Join the first 200 founders with exclusive lifetime benefits
            </p>
          </div>
          {/* Social Auth Buttons */}
          <button 
            className="auth-button google-button"
            onClick={handleGoogleSignUp}
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
          
          <div className="divider"><span>or continue with email</span></div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-input pr-10" 
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="text-xs text-white/60 mb-1">Password strength: {getStrengthText(passwordStrength)}</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength >= 75 ? 'bg-green-500' : 
                        passwordStrength >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox 
                id="terms" 
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                className="border-white/30"
              />
              <label htmlFor="terms" className="text-sm text-white/80">
                I agree to the{' '}
                <Link to="/terms" className="text-amber-300 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-amber-300 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            
            <button 
              type="submit" 
              className="auth-button signup-button"
              disabled={loading || googleLoading}
            >
              {loading ? 'Creating Account...' : '🚀 Become a Founder'}
            </button>

            {/* Show resend email button if email was sent */}
            {emailSent && (
              <div className="mt-4 p-4 bg-black/30 rounded-lg border border-amber-300/30">
                <div className="text-center text-white mb-3">
                  <Mail className="h-5 w-5 inline mr-2" />
                  Didn't receive the email?
                </div>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                  className="auth-button w-full"
                  style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                >
                  {resendLoading ? 'Sending...' : 'Resend Confirmation Email'}
                </button>
                <div className="text-xs text-white/60 mt-2 text-center">
                  Check your spam/junk folder first
                </div>
              </div>
            )}
          </form>

          <div className="signin-footer">
            Already have an account? <Link to="/auth/signin">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
