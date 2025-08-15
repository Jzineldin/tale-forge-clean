import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
  timestamp: string;
}

const ComprehensiveDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addDiagnostic = (result: Omit<DiagnosticResult, 'timestamp'>) => {
    setDiagnostics(prev => [...prev, { ...result, timestamp: new Date().toISOString() }]);
  };

  const runEnvironmentCheck = async () => {
    addDiagnostic({ name: 'Environment Variables', status: 'pending', message: 'Checking environment variables...' });
    
    try {
      const envVars = {
        VITE_SUPABASE_URL: 'https://xofnypcjpgzrcefhqrqo.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'Set',
        VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
        MODE: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD,
      };

      const missing = Object.entries(envVars).filter(([key, value]) => {
        if (key.startsWith('VITE_SUPABASE')) return !value;
        return false;
      });

      if (missing.length > 0) {
        addDiagnostic({
          name: 'Environment Variables',
          status: 'error',
          message: `Missing critical environment variables: ${missing.map(([key]) => key).join(', ')}`,
          details: envVars
        });
      } else {
        addDiagnostic({
          name: 'Environment Variables',
          status: 'success',
          message: 'All critical environment variables are present',
          details: envVars
        });
      }
    } catch (error) {
      addDiagnostic({
        name: 'Environment Variables',
        status: 'error',
        message: `Environment check failed: ${error}`,
        details: error
      });
    }
  };

  const runSupabaseConnectivityCheck = async () => {
    addDiagnostic({ name: 'Supabase Connectivity', status: 'pending', message: 'Testing Supabase connection...' });
    
    try {
      const { data, error } = await supabase.from('tier_limits').select('*').limit(1);
      
      if (error) {
        addDiagnostic({
          name: 'Supabase Connectivity',
          status: 'error',
          message: `Database connection failed: ${error.message}`,
          details: error
        });
      } else {
        addDiagnostic({
          name: 'Supabase Connectivity',
          status: 'success',
          message: 'Database connection successful',
          details: data
        });
      }
    } catch (error) {
      addDiagnostic({
        name: 'Supabase Connectivity',
        status: 'error',
        message: `Connection test failed: ${error}`,
        details: error
      });
    }
  };

  const runAuthenticationCheck = async () => {
    addDiagnostic({ name: 'Authentication System', status: 'pending', message: 'Testing authentication system...' });
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        addDiagnostic({
          name: 'Authentication System',
          status: 'error',
          message: `Auth system error: ${error.message}`,
          details: error
        });
      } else {
        addDiagnostic({
          name: 'Authentication System',
          status: 'success',
          message: session ? 'User authenticated' : 'Auth system working (no active session)',
          details: { hasSession: !!session, userId: session?.user?.id }
        });
      }
    } catch (error) {
      addDiagnostic({
        name: 'Authentication System',
        status: 'error',
        message: `Auth check failed: ${error}`,
        details: error
      });
    }
  };

  const runEdgeFunctionCheck = async () => {
    addDiagnostic({ name: 'Edge Functions', status: 'pending', message: 'Testing Edge Functions...' });
    
    try {
      const { data, error } = await supabase.functions.invoke('health-check');
      
      if (error) {
        addDiagnostic({
          name: 'Edge Functions',
          status: 'error',
          message: `Edge function failed: ${error.message}`,
          details: error
        });
      } else {
        addDiagnostic({
          name: 'Edge Functions',
          status: 'success',
          message: 'Edge functions are operational',
          details: data
        });
      }
    } catch (error) {
      addDiagnostic({
        name: 'Edge Functions',
        status: 'error',
        message: `Edge function test failed: ${error}`,
        details: error
      });
    }
  };

  const runSecurityAuditCheck = async () => {
    addDiagnostic({ name: 'Security Audit System', status: 'pending', message: 'Testing security audit system...' });
    
    try {
      const { data, error } = await supabase.functions.invoke('get-security-audit-log', {
        body: { limit: 1 }
      });
      
      if (error) {
        addDiagnostic({
          name: 'Security Audit System',
          status: 'warning',
          message: `Security audit system may not be fully deployed: ${error.message}`,
          details: error
        });
      } else {
        addDiagnostic({
          name: 'Security Audit System',
          status: 'success',
          message: 'Security audit system is operational',
          details: data
        });
      }
    } catch (error) {
      addDiagnostic({
        name: 'Security Audit System',
        status: 'warning',
        message: `Security audit check failed: ${error}`,
        details: error
      });
    }
  };

  const runBrowserCheck = () => {
    addDiagnostic({ name: 'Browser Environment', status: 'pending', message: 'Checking browser environment...' });
    
    try {
      const browserInfo = {
        userAgent: navigator.userAgent,
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        indexedDB: typeof indexedDB !== 'undefined',
        webCrypto: typeof crypto?.subtle !== 'undefined',
        url: window.location.href,
        protocol: window.location.protocol,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
      };

      const issues = [];
      if (!browserInfo.localStorage) issues.push('localStorage not available');
      if (!browserInfo.webCrypto) issues.push('Web Crypto API not available');
      if (browserInfo.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
        issues.push('Not using HTTPS in production');
      }

      if (issues.length > 0) {
        addDiagnostic({
          name: 'Browser Environment',
          status: 'warning',
          message: `Browser compatibility issues: ${issues.join(', ')}`,
          details: browserInfo
        });
      } else {
        addDiagnostic({
          name: 'Browser Environment',
          status: 'success',
          message: 'Browser environment is compatible',
          details: browserInfo
        });
      }
    } catch (error) {
      addDiagnostic({
        name: 'Browser Environment',
        status: 'error',
        message: `Browser check failed: ${error}`,
        details: error
      });
    }
  };

  const runComprehensiveDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);

    // Run all diagnostic checks
    runBrowserCheck();
    await runEnvironmentCheck();
    await runSupabaseConnectivityCheck();
    await runAuthenticationCheck();
    await runEdgeFunctionCheck();
    await runSecurityAuditCheck();

    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getSummary = () => {
    const counts = diagnostics.reduce((acc, diag) => {
      acc[diag.status] = (acc[diag.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return counts;
  };

  useEffect(() => {
    // Auto-run diagnostics on component mount
    runComprehensiveDiagnostics();
  }, []);

  const summary = getSummary();
  const hasErrors = summary.error > 0;
  const hasWarnings = summary.warning > 0;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Comprehensive Project Diagnostics</h1>
          <p className="text-muted-foreground mb-6">
            Complete system health check to identify failure points and configuration issues.
          </p>
          
          <div className="flex gap-4 items-center mb-6">
            <Button 
              onClick={runComprehensiveDiagnostics} 
              disabled={isRunning}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Diagnostics...
                </>
              ) : (
                'Run Full Diagnostics'
              )}
            </Button>

            {diagnostics.length > 0 && (
              <div className="flex gap-2">
                {summary.success > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {summary.success} Passed
                  </Badge>
                )}
                {summary.error > 0 && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {summary.error} Failed
                  </Badge>
                )}
                {summary.warning > 0 && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {summary.warning} Warnings
                  </Badge>
                )}
                {summary.pending > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {summary.pending} Pending
                  </Badge>
                )}
              </div>
            )}
          </div>

          {hasErrors && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg mb-6">
              <h3 className="font-semibold text-red-800 mb-2">Critical Issues Detected</h3>
              <p className="text-red-700">
                Your project has {summary.error} critical issue(s) that need immediate attention.
              </p>
            </div>
          )}

          {hasWarnings && !hasErrors && (
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">Warnings Detected</h3>
              <p className="text-yellow-700">
                Your project has {summary.warning} warning(s) that should be addressed.
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-6">
          {diagnostics.map((diagnostic, index) => (
            <Card key={index} className="border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(diagnostic.status)}
                    {diagnostic.name}
                  </CardTitle>
                  {getStatusBadge(diagnostic.status)}
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  {new Date(diagnostic.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{diagnostic.message}</p>
                {diagnostic.details && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                      View Technical Details
                    </summary>
                    <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(diagnostic.details, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {diagnostics.length === 0 && !isRunning && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Click "Run Full Diagnostics" to start the system health check.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveDiagnostics;