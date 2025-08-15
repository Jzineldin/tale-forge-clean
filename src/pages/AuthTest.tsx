import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AuthTest: React.FC = () => {
  const [email, setEmail] = useState('jzineldin@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testAuth = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Test sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      setResult({
        success: !error,
        data,
        error,
        client: 'Default (localStorage)'
      });
      
      if (!error && data.user) {
        // Test getting session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        setResult((prev: any) => ({
          ...prev,
          sessionData,
          sessionError
        }));
      }
      
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Unknown error',
        client: 'Default (localStorage)'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setResult(null);
    } catch (error) {
      console.error('Error clearing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Authentication Test</h1>
          <p className="text-gray-400">
            Test authentication with default localStorage storage
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={testAuth} 
                disabled={loading || !email || !password}
                className="flex-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test Login'}
              </Button>
              <Button 
                onClick={clearAuth} 
                variant="outline"
                disabled={loading}
              >
                Clear Auth
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {result && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                Test Result ({result.client})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-2">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Authentication successful! User: {result.data?.user?.email}
                    </AlertDescription>
                  </Alert>
                  
                  {result.sessionData && (
                    <div className="text-sm">
                      <strong>Session:</strong> {result.sessionData.session ? 'Active' : 'None'}
                    </div>
                  )}
                </div>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Authentication failed: {result.error?.message || result.error}
                  </AlertDescription>
                </Alert>
              )}
              
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-400">
                  View Full Response
                </summary>
                <pre className="mt-2 text-xs bg-gray-800 p-2 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}
        
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
          <h3 className="text-blue-400 font-semibold mb-2">Instructions:</h3>
          <ol className="text-blue-300 text-sm space-y-1 list-decimal list-inside">
            <li>Enter your admin credentials (jzineldin@gmail.com)</li>
            <li>Click "Test Login" to authenticate</li>
            <li>Check the results to see if authentication works</li>
            <li>If successful, try accessing the admin panel</li>
            <li>Use "Clear Auth" to sign out</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AuthTest; 