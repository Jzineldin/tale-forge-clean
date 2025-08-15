import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create a minimal Supabase client for testing
const supabaseUrl = 'https://xofnypcjpgzrcefhqrqo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZm55cGNqcGd6cmNlZmhxcnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1Mjg5ODEsImV4cCI6MjA1MDEwNDk4MX0.Tc6qmRMOaomKDIqGhqW3sZfJz5-P_v03JnkUm-PvG0k';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

const MinimalAuthTest: React.FC = () => {
  const [email, setEmail] = useState('jzineldin@gmail.com');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string>('Ready');
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [localStorageInfo, setLocalStorageInfo] = useState<any>(null);

  const checkSession = async () => {
    setStatus('Checking session...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSessionInfo({ session, error });
      
      // Also check localStorage directly
      const allKeys = Object.keys(localStorage);
      const supabaseKeys = allKeys.filter(key => key.includes('supabase') || key.includes('sb-'));
      setLocalStorageInfo({
        allKeys,
        supabaseKeys,
        supabaseKeyCount: supabaseKeys.length
      });
      
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
        setLocalStorageInfo(null);
      }
    } catch (error: any) {
      setStatus(`Sign out error: ${error.message}`);
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  const clearLocalStorage = () => {
    try {
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      setStatus('LocalStorage cleared');
      setLocalStorageInfo(null);
    } catch (error) {
      setStatus('Error clearing localStorage');
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Minimal Auth Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Auth Controls */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-white">Authentication</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={signIn}
                disabled={!email || !password}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-600 disabled:text-gray-400 hover:bg-blue-700 focus:outline-none"
              >
                Sign In
              </button>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none"
              >
                Sign Out
              </button>
              <button
                onClick={checkSession}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none"
              >
                Check Session
              </button>
              <button
                onClick={reloadPage}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none"
              >
                Reload Page
              </button>
              <button
                onClick={clearLocalStorage}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 focus:outline-none"
              >
                Clear Storage
              </button>
            </div>
            
            <div className="mt-4 p-4 bg-gray-700 rounded border border-gray-600">
              <h3 className="font-semibold mb-2 text-white">Status: {status}</h3>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-white">Session Information</h2>
            
            {sessionInfo && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-300">Session Data:</h4>
                <pre className="bg-gray-900 p-3 rounded text-xs overflow-auto max-h-40 border border-gray-600 text-gray-200">
                  {JSON.stringify(sessionInfo, null, 2)}
                </pre>
              </div>
            )}

            {localStorageInfo && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-300">LocalStorage Info:</h4>
                <div className="text-sm text-gray-300">
                  <p><strong>Supabase Keys:</strong> {localStorageInfo.supabaseKeyCount}</p>
                  <p><strong>Total Keys:</strong> {localStorageInfo.allKeys.length}</p>
                  {localStorageInfo.supabaseKeys.length > 0 && (
                    <div>
                      <strong>Supabase Keys:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {localStorageInfo.supabaseKeys.map((key: string, index: number) => (
                          <li key={index} className="text-xs text-gray-400">{key}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-900/30 border border-blue-600 rounded-lg">
          <h3 className="text-blue-300 font-semibold mb-2">Test Instructions:</h3>
          <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
            <li>Enter your password</li>
            <li>Click "Sign In"</li>
            <li>Check if session is created and localStorage has Supabase keys</li>
            <li>Click "Reload Page"</li>
            <li>Click "Check Session" to see if it persists</li>
            <li>If session is lost, check if localStorage keys are still there</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default MinimalAuthTest; 