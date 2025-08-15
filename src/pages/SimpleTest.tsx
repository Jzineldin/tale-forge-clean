import React from 'react';
import { areEnvVariablesAvailable } from '@/utils/envUtils';
import { Link } from 'react-router-dom';
const SimpleTest: React.FC = () => {
  const envVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const envVarsAvailable = areEnvVariablesAvailable(envVars);
  
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Simple App Test</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Basic React Test</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">React Version:</span>
              <span className="text-green-400">{React.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Environment:</span>
              <span className="text-blue-400">{import.meta.env.MODE}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Timestamp:</span>
              <span className="text-blue-400">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Environment Variables Test</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">All Env Vars Available:</span>
              <span className={envVarsAvailable ? 'text-green-400' : 'text-red-400'}>
                {envVarsAvailable ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">VITE_SUPABASE_URL:</span>
              <span className="text-blue-400">
                Set
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">VITE_SUPABASE_ANON_KEY:</span>
              <span className="text-blue-400">
                Set
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-900/30 border border-blue-600 rounded-lg">
          <h3 className="text-blue-300 font-semibold mb-2">Test Instructions:</h3>
          <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
            <li>If you can see this page, React is working</li>
            <li>If the styling looks correct, CSS is working</li>
            <li>If the timestamp updates, JavaScript is working</li>
            <li>Check if environment variables are available above</li>
            <li>Try navigating to the home page: <Link to="/" className="text-blue-400 underline">Home</Link></li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SimpleTest; 