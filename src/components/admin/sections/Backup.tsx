import React from 'react';
import { Archive, Download, Upload, Clock, Calendar, Database } from 'lucide-react';

const Backup: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Backup & Restore</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Archive className="h-6 w-6 text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Total Backups</h3>
          </div>
          <p className="text-xl font-bold text-white">12</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Last Backup</h3>
          </div>
          <p className="text-xl font-bold text-white">Today, 03:15 AM</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Next Scheduled</h3>
          </div>
          <p className="text-xl font-bold text-white">Tomorrow, 03:00 AM</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Storage Used</h3>
          </div>
          <p className="text-xl font-bold text-white">4.2 GB</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Create Backup</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Backup Name</label>
              <input 
                type="text" 
                placeholder="Enter backup name" 
                className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
              />
            </div>
            
            <div>
              <label className="block text-white mb-2">Backup Type</label>
              <select className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600">
                <option>Full Backup</option>
                <option>Database Only</option>
                <option>Files Only</option>
                <option>User Data Only</option>
              </select>
            </div>
            
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Create Backup Now
            </button>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Backups</h3>
          <div className="space-y-3">
            {[
              { name: 'Daily Backup', date: 'Today, 03:15 AM', size: '1.2 GB' },
              { name: 'Weekly Backup', date: 'Jul 22, 2025', size: '1.4 GB' },
              { name: 'Monthly Backup', date: 'Jul 01, 2025', size: '1.6 GB' }
            ].map((backup, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">{backup.name}</p>
                  <p className="text-sm text-gray-400">{backup.date} • {backup.size}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-purple-400 hover:text-purple-300">
                    <Download className="h-5 w-5" />
                  </button>
                  <button className="text-purple-400 hover:text-purple-300">
                    <Upload className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Backup Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
            <div>
              <p className="text-white font-medium">Automatic Backups</p>
              <p className="text-sm text-gray-400">Schedule regular backups</p>
            </div>
            <div>
              <input type="checkbox" defaultChecked className="bg-slate-600 text-white rounded" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
            <div>
              <p className="text-white font-medium">Backup Frequency</p>
              <p className="text-sm text-gray-400">How often to create backups</p>
            </div>
            <div>
              <select className="bg-slate-600 text-white rounded px-3 py-1">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
            <div>
              <p className="text-white font-medium">Retention Policy</p>
              <p className="text-sm text-gray-400">How long to keep backups</p>
            </div>
            <div>
              <select className="bg-slate-600 text-white rounded px-3 py-1">
                <option>30 days</option>
                <option>60 days</option>
                <option>90 days</option>
                <option>1 year</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backup;