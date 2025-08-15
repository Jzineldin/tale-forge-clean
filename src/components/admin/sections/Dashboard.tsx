import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Total Users</h3>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Active Users</h3>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Total Stories</h3>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Revenue</h3>
          <p className="text-2xl font-bold text-white">$0</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;