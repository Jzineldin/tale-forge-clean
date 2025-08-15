import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { areEnvVariablesAvailable } from '@/utils/envUtils';

/**
 * RecoveryScreen component
 * 
 * This component detects blank screen conditions and provides recovery options.
 * It's designed to handle cases where the application might fail to initialize
 * properly, especially after Cursor restarts when environment variables might
 * not be immediately available.
 */
const RecoveryScreen: React.FC = () => {
  const { initialized, initializationError, loading } = useAuth();
  const [autoRecoveryAttempted, setAutoRecoveryAttempted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [envCheckResult, setEnvCheckResult] = useState<{
    available: boolean;
    missing: string[];
  }>({ available: false, missing: [] });

  // Check environment variables
  useEffect(() => {
    const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const available = areEnvVariablesAvailable(requiredEnvVars);
    
    const missing = requiredEnvVars.filter(key => {
      const fullKey = `VITE_${key}`;
      return (import.meta.env as Record<string, string | undefined>)[fullKey] === undefined;
    });
    
    setEnvCheckResult({ available, missing });
  }, []);

  // Auto-recovery countdown
  useEffect(() => {
    // Only start countdown if there's an initialization error and auto-recovery hasn't been attempted
    if (initializationError && !autoRecoveryAttempted && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    // When countdown reaches 0, attempt auto-recovery
    if (countdown === 0 && !autoRecoveryAttempted) {
      setAutoRecoveryAttempted(true);
      handleReload();
    }
    
    // Return undefined for other code paths
    return undefined;
  }, [countdown, initializationError, autoRecoveryAttempted]);

  // Handle manual reload
  const handleReload = () => {
    // Clear any cached data that might be causing issues
    localStorage.setItem('recovery_attempt', Date.now().toString());
    
    // Reload the page
    window.location.reload();
  };

  // If the app is still loading or has initialized successfully, don't show recovery screen
  if (loading || (initialized && !initializationError)) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-amber-400">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-amber-400 mb-2">Application Recovery</h2>
          <div className="w-16 h-16 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-amber-400">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <p className="text-white mb-4">
            The application encountered an issue during initialization.
          </p>
          
          {initializationError && (
            <div className="bg-red-900/30 p-3 rounded-md text-left mb-4 text-sm">
              <p className="text-red-300 font-semibold">Error Details:</p>
              <p className="text-red-100 break-words">{initializationError.message}</p>
            </div>
          )}
          
          {!envCheckResult.available && (
            <div className="bg-amber-900/30 p-3 rounded-md text-left mb-4 text-sm">
              <p className="text-amber-300 font-semibold">Missing Environment Variables:</p>
              <ul className="list-disc pl-5 text-amber-100">
                {envCheckResult.missing.map(key => (
                  <li key={key}>VITE_{key}</li>
                ))}
              </ul>
              <p className="mt-2 text-amber-200">
                This often happens after restarting Cursor. A page reload usually resolves this issue.
              </p>
            </div>
          )}
          
          {!autoRecoveryAttempted && countdown > 0 ? (
            <div className="mb-4">
              <p className="text-white">
                Automatic recovery in <span className="text-amber-400 font-bold">{countdown}</span> seconds...
              </p>
              <button
                onClick={() => setAutoRecoveryAttempted(true)}
                className="text-sm text-amber-400 hover:text-amber-300 mt-2"
              >
                Cancel auto-recovery
              </button>
            </div>
          ) : (
            <button
              onClick={handleReload}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-md transition-colors"
            >
              Reload Application
            </button>
          )}
          
          <p className="text-gray-400 text-sm mt-4">
            If the issue persists after multiple reloads, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecoveryScreen;