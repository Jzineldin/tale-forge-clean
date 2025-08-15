import React from 'react';
import { Shield, Lock, Key, UserCheck } from 'lucide-react';

const Security: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Security</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Security Status</h3>
          </div>
          <p className="text-xl font-bold text-green-400">Protected</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Lock className="h-6 w-6 text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Last Scan</h3>
          </div>
          <p className="text-xl font-bold text-white">Today, 08:45 AM</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Key className="h-6 w-6 text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Active Sessions</h3>
          </div>
          <p className="text-xl font-bold text-white">24</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <UserCheck className="h-6 w-6 text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">2FA Status</h3>
          </div>
          <p className="text-xl font-bold text-white">Enabled</p>
        </div>
      </div>
      
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
            <div>
              <p className="text-white font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-400">Require 2FA for all admin users</p>
            </div>
            <div>
              <input type="checkbox" defaultChecked className="bg-slate-600 text-white rounded" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
            <div>
              <p className="text-white font-medium">Password Policy</p>
              <p className="text-sm text-gray-400">Enforce strong password requirements</p>
            </div>
            <div>
              <input type="checkbox" defaultChecked className="bg-slate-600 text-white rounded" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
            <div>
              <p className="text-white font-medium">Session Timeout</p>
              <p className="text-sm text-gray-400">Automatically log out inactive users</p>
            </div>
            <div>
              <select className="bg-slate-600 text-white rounded px-3 py-1">
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>4 hours</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
