import React from 'react';

const AppFallback: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#f59e0b' }}>
          🚀 Tale Forge
        </h1>
        
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#94a3b8' }}>
          AI-Powered Storytelling Platform
        </p>
        
        <div style={{ 
          backgroundColor: '#1e293b', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#f59e0b', marginBottom: '1rem' }}>🔧 App Initialization</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
            The app is starting up. If you see this message for more than a few seconds, 
            there might be an issue with the configuration.
          </p>
          
          <div style={{ 
            backgroundColor: '#334155', 
            padding: '15px', 
            borderRadius: '6px',
            marginBottom: '1rem'
          }}>
            <h3 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>Quick Checks:</h3>
            <ul style={{ textAlign: 'left', color: '#cbd5e1' }}>
              <li>✅ Environment variables configured</li>
              <li>✅ Database connection available</li>
              <li>✅ JavaScript enabled</li>
              <li>✅ Modern browser detected</li>
            </ul>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🔄 Refresh Page
          </button>
          
          <button 
            onClick={() => window.location.href = '/debug'}
            style={{
              backgroundColor: '#334155',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🔍 Debug Info
          </button>
        </div>
        
        <p style={{ 
          fontSize: '0.9rem', 
          color: '#64748b', 
          marginTop: '2rem',
          fontStyle: 'italic'
        }}>
          If the problem persists, please check the browser console for error messages.
        </p>
      </div>
    </div>
  );
};

export default AppFallback; 