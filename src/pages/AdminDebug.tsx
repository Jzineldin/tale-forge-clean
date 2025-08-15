import React from 'react';
import AdminAccessDebugger from '@/components/debug/AdminAccessDebugger';
import AuthDebugger from '@/components/debug/AuthDebugger';
import SessionPersistenceTest from '@/components/debug/SessionPersistenceTest';

const AdminDebug: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Admin Access Debug</h1>
          <p className="text-gray-400">
            This page helps diagnose admin access issues. No admin permissions required.
          </p>
        </div>
        
        <SessionPersistenceTest />
        <div className="mt-8">
          <AuthDebugger />
        </div>
        <div className="mt-8">
          <AdminAccessDebugger />
        </div>
        
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
          <h3 className="text-blue-400 font-semibold mb-2">Next Steps:</h3>
          <ol className="text-blue-300 text-sm space-y-1 list-decimal list-inside">
            <li>Check the diagnostic results above</li>
            <li>If you see errors, run the fix script in Supabase SQL Editor</li>
            <li>Copy and paste the contents of <code className="bg-blue-800 px-1 rounded">fix_admin_access_complete.sql</code></li>
            <li>Refresh this page to see if the issues are resolved</li>
            <li>Try accessing the admin panel again</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AdminDebug; 