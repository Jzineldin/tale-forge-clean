import React from 'react';

const EnvCheck: React.FC = () => {
  const supabaseUrl = 'https://xofnypcjpgzrcefhqrqo.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZm55cGNqcGd6cmNlZmhxcnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1Mjg5ODEsImV4cCI6MjA1MDEwNDk4MX0.Tc6qmRMOaomKDIqGhqW3sZfJz5-P_v03JnkUm-PvG0k';
  
  const hasUrl = !!supabaseUrl;
  const hasKey = !!supabaseKey;
  const keyLength = supabaseKey?.length || 0;
  const urlLength = supabaseUrl?.length || 0;

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Environment Check</h1>
        
        <div className="bg-white p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">Supabase Configuration</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded">
              <span className="font-medium">VITE_SUPABASE_URL:</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${hasUrl ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {hasUrl ? 'Present' : 'Missing'}
                </span>
                {hasUrl && <span className="text-sm text-gray-600">({urlLength} chars)</span>}
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 border rounded">
              <span className="font-medium">VITE_SUPABASE_ANON_KEY:</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${hasKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {hasKey ? 'Present' : 'Missing'}
                </span>
                {hasKey && <span className="text-sm text-gray-600">({keyLength} chars)</span>}
              </div>
            </div>
          </div>
          
          {hasUrl && hasKey && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="text-green-800 font-semibold mb-2">✅ Configuration Looks Good</h3>
              <p className="text-green-700 text-sm">
                Both environment variables are present. The authentication issue might be elsewhere.
              </p>
            </div>
          )}
          
          {(!hasUrl || !hasKey) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="text-red-800 font-semibold mb-2">❌ Configuration Issue</h3>
              <p className="text-red-700 text-sm">
                Missing required environment variables. Check your .env file.
              </p>
              <div className="mt-2 text-sm">
                <p><strong>Required:</strong></p>
                <ul className="list-disc list-inside mt-1">
                  <li>VITE_SUPABASE_URL</li>
                  <li>VITE_SUPABASE_ANON_KEY</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="text-blue-800 font-semibold mb-2">Next Steps:</h3>
            <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
              <li>If configuration is good, try the minimal auth test</li>
              <li>If configuration is missing, check your .env file</li>
              <li>Make sure your .env file is in the project root</li>
              <li>Restart the development server after changing .env</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvCheck; 