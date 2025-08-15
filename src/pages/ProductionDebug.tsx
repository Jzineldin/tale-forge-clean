import React, { useEffect, useState } from 'react';

const ProductionDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const gatherDebugInfo = () => {
      const info = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        windowSize: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        environment: {
          nodeEnv: import.meta.env.MODE,
          isDev: import.meta.env.DEV,
          isProd: import.meta.env.PROD,
          baseUrl: import.meta.env.BASE_URL,
        },
        supabase: {
          url: 'Set',
          hasAnonKey: true,
        },
        stripe: {
          hasPublishableKey: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
        },
        localStorage: {
          available: typeof localStorage !== 'undefined',
          keys: typeof localStorage !== 'undefined' ? Object.keys(localStorage) : [],
        },
        sessionStorage: {
          available: typeof sessionStorage !== 'undefined',
          keys: typeof sessionStorage !== 'undefined' ? Object.keys(sessionStorage) : [],
        },
        errors: [] as string[],
      };

      // Test for common errors
      try {
        // Test if React is working
        if (!React) {
          info.errors.push('React not available');
        }
      } catch (error) {
        info.errors.push(`React error: ${error}`);
      }

      try {
        // Test if we can access the DOM
        if (!document) {
          info.errors.push('Document not available');
        }
      } catch (error) {
        info.errors.push(`Document error: ${error}`);
      }

      setDebugInfo(info);
      setLoading(false);
    };

    gatherDebugInfo();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#1a1a1a', 
        color: 'white', 
        minHeight: '100vh',
        fontFamily: 'monospace'
      }}>
        <h1>Loading Debug Info...</h1>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      minHeight: '100vh',
      fontFamily: 'monospace'
    }}>
      <h1>🔍 Production Debug Info</h1>
      
      <h2>📊 Environment</h2>
      <pre>{JSON.stringify(debugInfo.environment, null, 2)}</pre>
      
      <h2>🔐 Environment Variables</h2>
      <pre>{JSON.stringify({
        supabase: debugInfo.supabase,
        stripe: debugInfo.stripe
      }, null, 2)}</pre>
      
      <h2>🌐 Browser Info</h2>
      <pre>{JSON.stringify({
        userAgent: debugInfo.userAgent,
        windowSize: debugInfo.windowSize
      }, null, 2)}</pre>
      
      <h2>💾 Storage</h2>
      <pre>{JSON.stringify({
        localStorage: debugInfo.localStorage,
        sessionStorage: debugInfo.sessionStorage
      }, null, 2)}</pre>
      
      <h2>❌ Errors</h2>
      {debugInfo.errors.length > 0 ? (
        <pre style={{ color: '#ff6b6b' }}>
          {JSON.stringify(debugInfo.errors, null, 2)}
        </pre>
      ) : (
        <p style={{ color: '#51cf66' }}>✅ No errors detected</p>
      )}
      
      <h2>⏰ Timestamp</h2>
      <p>{debugInfo.timestamp}</p>
      
      <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #333' }}>
        <h3>🔧 Quick Fixes to Try:</h3>
        <ol>
          <li>Check Vercel environment variables</li>
          <li>Clear browser cache and reload</li>
          <li>Try incognito/private browsing</li>
          <li>Check browser console for errors</li>
        </ol>
      </div>
    </div>
  );
};

export default ProductionDebug; 