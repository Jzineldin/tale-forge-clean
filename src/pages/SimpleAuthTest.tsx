import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SimpleAuthTest: React.FC = () => {
  const [email, setEmail] = useState('jzineldin@gmail.com');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string>('Ready');
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const checkSession = async () => {
    setStatus('Checking session...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSessionInfo({ session, error });
      setStatus(error ? 'Session error' : 'Session checked');
    } catch (error) {
      setSessionInfo({ error });
      setStatus('Session check failed');
    }
  };

  const signIn = async () => {
    setStatus('Signing in...');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setStatus(`Sign in failed: ${error.message}`);
      } else {
        setStatus('Sign in successful!');
        await checkSession();
      }
    } catch (error: any) {
      setStatus(`Sign in error: ${error.message}`);
    }
  };

  const signOut = async () => {
    setStatus('Signing out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setStatus(`Sign out failed: ${error.message}`);
      } else {
        setStatus('Sign out successful!');
        setSessionInfo(null);
      }
    } catch (error: any) {
      setStatus(`Sign out error: ${error.message}`);
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Simple Auth Test</h1>
        
        <div className="bg-white p-6 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={signIn}
              disabled={!email || !password}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Sign In
            </button>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Sign Out
            </button>
            <button
              onClick={checkSession}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Check Session
            </button>
            <button
              onClick={reloadPage}
              className="px-4 py-2 bg-purple-500 text-white rounded"
            >
              Reload Page
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Status: {status}</h3>
            
            {sessionInfo && (
              <div className="text-sm">
                <h4 className="font-medium mb-1">Session Info:</h4>
                <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(sessionInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-4 bg-yellow-100 rounded">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Enter your password</li>
              <li>Click "Sign In"</li>
              <li>Check if session is created</li>
              <li>Click "Reload Page"</li>
              <li>Click "Check Session" to see if it persists</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAuthTest; 