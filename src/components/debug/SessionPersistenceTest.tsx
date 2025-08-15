import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw, Loader2 } from 'lucide-react';

const SessionPersistenceTest: React.FC = () => {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkSession = async () => {
    setLoading(true);
    setLastCheck(new Date());
    
    try {
      const debugData: any = {};
      
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      debugData.session = session;
      debugData.sessionError = sessionError;
      
      // Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      debugData.user = user;
      debugData.userError = userError;
      
      // Check localStorage directly
      try {
        const supabaseAuthToken = localStorage.getItem('sb-' + 'https://xofnypcjpgzrcefhqrqo.supabase.co'.replace(/[^a-zA-Z0-9]/g, '') + '-auth-token');
        debugData.localStorageToken = supabaseAuthToken ? 'Present' : 'Missing';
        debugData.localStorageTokenLength = supabaseAuthToken?.length || 0;
      } catch (error) {
        debugData.localStorageError = error;
      }
      
      // Check all localStorage keys
      try {
        const allKeys = Object.keys(localStorage);
        const supabaseKeys = allKeys.filter(key => key.includes('supabase') || key.includes('sb-'));
        debugData.allLocalStorageKeys = allKeys;
        debugData.supabaseKeys = supabaseKeys;
      } catch (error) {
        debugData.localStorageKeysError = error;
      }
      
      setSessionInfo(debugData);
    } catch (error: any) {
      console.error('Session check failed:', error);
      setSessionInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const clearSession = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      // Also clear localStorage manually
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      setSessionInfo(null);
    } catch (error) {
      console.error('Error clearing session:', error);
    } finally {
      setLoading(false);
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    checkSession();
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
          Session Persistence Test
          <div className="flex gap-2">
            <Button onClick={checkSession} size="sm" variant="outline" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
            <Button onClick={reloadPage} size="sm" variant="outline">
              Reload Page
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-400">
          Last checked: {lastCheck.toLocaleTimeString()}
        </div>

        {sessionInfo && (
          <div className="space-y-4">
            {/* Session Status */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Session Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Active Session:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(!!sessionInfo.session)}
                    {getStatusBadge(!!sessionInfo.session, "Active", "No Session")}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>User Logged In:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(!!sessionInfo.user)}
                    {getStatusBadge(!!sessionInfo.user, "Yes", "No")}
                  </div>
                </div>
                
                {sessionInfo.user && (
                  <div className="text-sm text-gray-600">
                    User: {sessionInfo.user.email}
                  </div>
                )}
                
                {sessionInfo.sessionError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Session Error: {sessionInfo.sessionError.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* LocalStorage Status */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">LocalStorage Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Auth Token:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(sessionInfo.localStorageToken === 'Present')}
                    {getStatusBadge(sessionInfo.localStorageToken === 'Present', "Present", "Missing")}
                  </div>
                </div>
                
                {sessionInfo.localStorageTokenLength > 0 && (
                  <div className="text-sm text-gray-600">
                    Token Length: {sessionInfo.localStorageTokenLength} characters
                  </div>
                )}
                
                {sessionInfo.supabaseKeys && sessionInfo.supabaseKeys.length > 0 && (
                  <div className="text-sm">
                    <strong>Supabase Keys in localStorage:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {sessionInfo.supabaseKeys.map((key: string, index: number) => (
                        <li key={index} className="text-xs">{key}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {sessionInfo.localStorageError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      LocalStorage Error: {sessionInfo.localStorageError.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={clearSession} variant="outline" size="sm">
                Clear Session
              </Button>
            </div>

            {/* Instructions */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="text-blue-800 font-semibold mb-2">Test Instructions:</h3>
              <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                <li>Check the session status above</li>
                <li>Click "Reload Page" to test persistence</li>
                <li>After reload, check if session is still active</li>
                <li>If session is lost, localStorage is not working properly</li>
                <li>Try logging in again and repeat the test</li>
              </ol>
            </div>
          </div>
        )}

        {sessionInfo?.error && (
          <Alert variant="destructive">
            <AlertDescription>
              Error: {sessionInfo.error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionPersistenceTest; 