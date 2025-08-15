import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

const AuthProviderTest: React.FC = () => {
  const { user, session, loading, isAuthenticated } = useAuth();
  const [directSession, setDirectSession] = useState<any>(null);
  const [directUser, setDirectUser] = useState<any>(null);
  const [localStorageKeys, setLocalStorageKeys] = useState<string[]>([]);

  const checkDirectSupabase = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      setDirectSession(session);
      setDirectUser(user);
      
      // Check localStorage
      const allKeys = Object.keys(localStorage);
      const supabaseKeys = allKeys.filter(key => key.includes('supabase') || key.includes('sb-'));
      setLocalStorageKeys(supabaseKeys);
      
      return { session, user, error, userError, supabaseKeys };
    } catch (error) {
      console.error('Error checking direct Supabase:', error);
      return { error };
    }
  };

  useEffect(() => {
    // Only check once on mount, no intervals
    checkDirectSupabase();
  }, []);

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">AuthProvider vs Direct Supabase Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AuthProvider State */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">AuthProvider Context</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Loading:</span>
                <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
                  {loading ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Is Authenticated:</span>
                <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">User:</span>
                <span className="text-blue-400">
                  {user ? user.email : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Session:</span>
                <span className="text-blue-400">
                  {session ? 'Active' : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Direct Supabase State */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Direct Supabase Check</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">User:</span>
                <span className="text-blue-400">
                  {directUser ? directUser.email : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Session:</span>
                <span className="text-blue-400">
                  {directSession ? 'Active' : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">LocalStorage Keys:</span>
                <span className="text-blue-400">
                  {localStorageKeys.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={checkDirectSupabase}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Check Direct Supabase
          </button>
          <button
            onClick={reloadPage}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Reload Page
          </button>
        </div>

        {/* Comparison */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Comparison</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">User Match:</span>
              <span className={user?.email === directUser?.email ? 'text-green-400' : 'text-red-400'}>
                {user?.email === directUser?.email ? 'Match' : 'Mismatch'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Session Match:</span>
              <span className={!!session === !!directSession ? 'text-green-400' : 'text-red-400'}>
                {!!session === !!directSession ? 'Match' : 'Mismatch'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">AuthProvider Loading:</span>
              <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
                {loading ? 'Still Loading' : 'Done Loading'}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-900/30 border border-blue-600 rounded-lg">
          <h3 className="text-blue-300 font-semibold mb-2">Instructions:</h3>
          <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
            <li>First sign in to your main app</li>
            <li>Then come to this page</li>
            <li>Check if AuthProvider and Direct Supabase match</li>
            <li>Click "Reload Page" to test session persistence</li>
            <li>If they don't match, there's an AuthProvider issue</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AuthProviderTest; 