import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AuthDebugger: React.FC = () => {
  const { user, session, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);

  const runAuthDebug = async () => {
    setDebugLoading(true);
    
    try {
      const debugData: any = {};
      
      // Check current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      debugData.currentSession = currentSession;
      debugData.sessionError = sessionError;
      
      // Check current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      debugData.currentUser = currentUser;
      debugData.userError = userError;
      
      // Check if we can access cookies
      try {
        const testCookie = document.cookie;
        debugData.cookiesAccessible = testCookie !== undefined;
        debugData.cookieCount = testCookie.split(';').length;
      } catch (error) {
        debugData.cookiesAccessible = false;
        debugData.cookieError = error;
      }
      
      // Check localStorage as fallback
      try {
        const testLocalStorage = localStorage.getItem('test');
        debugData.localStorageAccessible = testLocalStorage !== null || testLocalStorage === null;
      } catch (error) {
        debugData.localStorageAccessible = false;
        debugData.localStorageError = error;
      }
      
      setDebugInfo(debugData);
    } catch (error: any) {
      console.error('Auth debug failed:', error);
    } finally {
      setDebugLoading(false);
    }
  };

  useEffect(() => {
    runAuthDebug();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => {
    return (
      <Badge variant={condition ? "default" : "destructive"}>
        {condition ? trueText : falseText}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Authentication Debugger
          <Button onClick={runAuthDebug} size="sm" variant="outline" disabled={debugLoading}>
            {debugLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Context State */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Auth Context State</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Loading:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(loading)}
                {getStatusBadge(loading, "Loading", "Not Loading")}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>User from Context:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(!!user)}
                {getStatusBadge(!!user, "Logged In", "Not Logged In")}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Session from Context:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(!!session)}
                {getStatusBadge(!!session, "Active", "No Session")}
              </div>
            </div>
            
            {user && (
              <div className="text-sm text-gray-600">
                User Email: {user.email}
              </div>
            )}
          </div>
        </div>

        {/* Direct Supabase Checks */}
        {debugInfo && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Direct Supabase Checks</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Current Session:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(!!debugInfo.currentSession)}
                    {getStatusBadge(!!debugInfo.currentSession, "Found", "Not Found")}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Current User:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(!!debugInfo.currentUser)}
                    {getStatusBadge(!!debugInfo.currentUser, "Found", "Not Found")}
                  </div>
                </div>
                
                {debugInfo.sessionError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Session Error: {debugInfo.sessionError.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                {debugInfo.userError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      User Error: {debugInfo.userError.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Storage Access */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Storage Access</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Cookies Accessible:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(debugInfo.cookiesAccessible)}
                    {getStatusBadge(debugInfo.cookiesAccessible, "Yes", "No")}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>LocalStorage Accessible:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(debugInfo.localStorageAccessible)}
                    {getStatusBadge(debugInfo.localStorageAccessible, "Yes", "No")}
                  </div>
                </div>
                
                {debugInfo.cookieCount !== undefined && (
                  <div className="text-sm text-gray-600">
                    Cookie Count: {debugInfo.cookieCount}
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold mb-2 text-blue-800">Recommendations</h3>
              <div className="space-y-2 text-sm text-blue-700">
                {!debugInfo.cookiesAccessible && (
                  <p>• Cookies are not accessible. This will break authentication.</p>
                )}
                
                {!debugInfo.currentSession && !debugInfo.currentUser && (
                  <p>• No active session found. Try logging in again.</p>
                )}
                
                {debugInfo.sessionError && (
                  <p>• Session error detected. Check Supabase configuration.</p>
                )}
                
                {user && !debugInfo.currentUser && (
                  <p>• Context has user but Supabase doesn't. Session sync issue.</p>
                )}
                
                {!user && debugInfo.currentUser && (
                  <p>• Supabase has user but context doesn't. Context sync issue.</p>
                )}
                
                {user && debugInfo.currentUser && (
                  <p>• Authentication appears to be working correctly.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDebugger; 