import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">User Growth</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">+12%</p>
          <p className="text-sm text-gray-400">vs last month</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Story Creation</h3>
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">+8%</p>
          <p className="text-sm text-gray-400">vs last month</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Subscription Rate</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">+15%</p>
          <p className="text-sm text-gray-400">vs last month</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Churn Rate</h3>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-white">-3%</p>
          <p className="text-sm text-gray-400">vs last month</p>
        </div>
      </div>
      
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Monthly User Activity</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">Chart placeholder - Monthly user activity data</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Popular Story Genres</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-400">Chart placeholder - Genre distribution</p>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Revenue Breakdown</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-400">Chart placeholder - Revenue sources</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;