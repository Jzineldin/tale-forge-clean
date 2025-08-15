import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Mail, Send, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface DiagnosticResult {
  component: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

interface EmailTestResult {
  success: boolean;
  emailId?: string;
  error?: string;
  timestamp: string;
}

export const EmailSystemDiagnostic: React.FC = () => {
  const { user } = useAuth();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [emailTest, setEmailTest] = useState<EmailTestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    try {
      // Test 1: Check if edge function exists and is accessible
      try {
        const response = await fetch(`https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/send-welcome-email`, {
          method: 'OPTIONS',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg`,
          },
        });
        
        if (response.ok || response.status === 204) {
          results.push({
            component: 'Edge Function',
            status: 'success',
            message: 'Welcome email edge function is accessible',
            details: `Status: ${response.status}`
          });
        } else {
          results.push({
            component: 'Edge Function',
            status: 'error',
            message: 'Edge function not accessible',
            details: `Status: ${response.status}`
          });
        }
      } catch (error) {
        results.push({
          component: 'Edge Function',
          status: 'error',
          message: 'Failed to reach edge function',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 2: Check profiles table structure
      try {
        const { error } = await supabase
          .from('profiles')
          .select('id, email, welcome_email_sent, welcome_email_sent_at')
          .limit(1);

        if (error) throw error;
        
        results.push({
          component: 'Database Schema',
          status: 'success',
          message: 'Profiles table has required welcome email fields',
          details: 'welcome_email_sent and welcome_email_sent_at columns exist'
        });
      } catch (error) {
        results.push({
          component: 'Database Schema',
          status: 'error',
          message: 'Missing required fields in profiles table',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 3: Check current user profile
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          if (profile) {
            results.push({
              component: 'User Profile',
              status: 'success',
              message: 'User profile exists in database',
              details: `Welcome email sent: ${profile.welcome_email_sent ? 'Yes' : 'No'}`
            });
          } else {
            results.push({
              component: 'User Profile',
              status: 'warning',
              message: 'User profile not found',
              details: 'Profile may need to be created'
            });
          }
        } catch (error) {
          results.push({
            component: 'User Profile',
            status: 'error',
            message: 'Failed to check user profile',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Test 4: Check recent email activity
      try {
        const { data: recentProfiles, error } = await supabase
          .from('profiles')
          .select('id, email, welcome_email_sent_at')
          .not('welcome_email_sent_at', 'is', null)
          .order('welcome_email_sent_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        results.push({
          component: 'Email Activity',
          status: 'success',
          message: `Found ${recentProfiles?.length || 0} recent welcome emails`,
          details: recentProfiles?.length ? `Latest: ${recentProfiles[0].welcome_email_sent_at}` : 'No recent activity'
        });
      } catch (error) {
        results.push({
          component: 'Email Activity',
          status: 'error',
          message: 'Failed to check email activity',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 5: Check authentication flow integration
      const authCallbackExists = document.querySelector('script[src*="AuthCallback"]') !== null;
      results.push({
        component: 'Auth Integration',
        status: authCallbackExists ? 'success' : 'warning',
        message: 'Authentication callback integration',
        details: 'Welcome email should trigger on new user signup'
      });

      setDiagnostics(results);
    } catch (error) {
      toast.error('Diagnostic failed');
      console.error('Diagnostic error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const testEmailFunction = async () => {
    if (!user) {
      toast.error('Must be logged in to test email function');
      return;
    }

    setIsTestingEmail(true);
    try {
      const response = await supabase.functions.invoke('send-welcome-email', {
        body: {
          userId: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || 'Test User',
          isNewUser: false, // Test email, not for new user
          signupMethod: 'email'
        }
      });

      if (response.error) {
        setEmailTest({
          success: false,
          error: response.error.message,
          timestamp: new Date().toISOString()
        });
        toast.error(`Email test failed: ${response.error.message}`);
      } else {
        setEmailTest({
          success: true,
          emailId: response.data?.emailId,
          timestamp: new Date().toISOString()
        });
        toast.success('Test email sent successfully!');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setEmailTest({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      toast.error(`Email test failed: ${errorMessage}`);
    } finally {
      setIsTestingEmail(false);
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'bg-green-500/20 text-green-400 border-green-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      error: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    return <Badge variant="outline" className={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Welcome Email System Diagnostics
          </CardTitle>
          <CardDescription>
            Comprehensive testing of the welcome email system components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {isRunning ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
            </Button>
            
            <Button 
              onClick={testEmailFunction}
              disabled={isTestingEmail || !user}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isTestingEmail ? 'Sending Test Email...' : 'Test Email Function'}
            </Button>
          </div>

          {diagnostics.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Diagnostic Results</h3>
              <div className="space-y-3">
                {diagnostics.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{result.component}</span>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-slate-300">{result.message}</p>
                      {result.details && (
                        <p className="text-xs text-slate-400 mt-1">{result.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {emailTest && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Email Function Test Result</h3>
              <div className={`p-4 rounded-lg border ${
                emailTest.success 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {emailTest.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {emailTest.success ? 'Email sent successfully' : 'Email sending failed'}
                  </span>
                </div>
                {emailTest.emailId && (
                  <p className="text-sm text-slate-300">Email ID: {emailTest.emailId}</p>
                )}
                {emailTest.error && (
                  <p className="text-sm text-red-400">Error: {emailTest.error}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Tested at: {new Date(emailTest.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};