import React, { useState, useEffect } from 'react';
import { Cpu, MemoryStick, HardDrive, Network, RefreshCw } from 'lucide-react';
import OptimizationDashboard from '../optimization/OptimizationDashboard';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  activeUsers: number;
  totalUsers: number;
  totalStories: number;
  revenue: number;
}

const System: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    activeUsers: 0,
    totalUsers: 0,
    totalStories: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMetrics();
    // Set up interval to refresh metrics every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      // In a real application, this would fetch actual system metrics
      // For now, we'll use random values for demonstration
      setMetrics({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        network: Math.random() * 100,
        activeUsers: Math.floor(Math.random() * 1000),
        totalUsers: 1500,
        totalStories: Math.floor(Math.random() * 5000),
        revenue: Math.floor(Math.random() * 50000)
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (value: number) => {
    if (value < 50) return 'text-green-500';
    if (value < 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">System Monitor</h2>
        <button 
          onClick={loadMetrics}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">CPU Usage</h3>
            <Cpu className={`h-5 w-5 ${getStatusColor(metrics.cpu)}`} />
          </div>
          <p className="text-2xl font-bold text-white">{metrics.cpu.toFixed(1)}%</p>
          <div className="w-full bg-slate-700 rounded-full h-2.5 mt-2">
            <div 
              className={`h-2.5 rounded-full ${
                metrics.cpu < 50 ? 'bg-green-500' : metrics.cpu < 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`} 
              style={{ width: `${metrics.cpu}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Memory Usage</h3>
            <MemoryStick className={`h-5 w-5 ${getStatusColor(metrics.memory)}`} />
          </div>
          <p className="text-2xl font-bold text-white">{metrics.memory.toFixed(1)}%</p>
          <div className="w-full bg-slate-700 rounded-full h-2.5 mt-2">
            <div 
              className={`h-2.5 rounded-full ${
                metrics.memory < 50 ? 'bg-green-500' : metrics.memory < 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`} 
              style={{ width: `${metrics.memory}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Disk Usage</h3>
            <HardDrive className={`h-5 w-5 ${getStatusColor(metrics.disk)}`} />
          </div>
          <p className="text-2xl font-bold text-white">{metrics.disk.toFixed(1)}%</p>
          <div className="w-full bg-slate-700 rounded-full h-2.5 mt-2">
            <div 
              className={`h-2.5 rounded-full ${
                metrics.disk < 50 ? 'bg-green-500' : metrics.disk < 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`} 
              style={{ width: `${metrics.disk}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Network Usage</h3>
            <Network className={`h-5 w-5 ${getStatusColor(metrics.network)}`} />
          </div>
          <p className="text-2xl font-bold text-white">{metrics.network.toFixed(1)}%</p>
          <div className="w-full bg-slate-700 rounded-full h-2.5 mt-2">
            <div 
              className={`h-2.5 rounded-full ${
                metrics.network < 50 ? 'bg-green-500' : metrics.network < 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`} 
              style={{ width: `${metrics.network}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Server Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Server Name:</span>
              <span className="text-white">tale-forge-prod-01</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Operating System:</span>
              <span className="text-white">Ubuntu 22.04 LTS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Uptime:</span>
              <span className="text-white">42 days, 15 hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Reboot:</span>
              <span className="text-white">2023-06-10 03:15 UTC</span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Database Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Database Type:</span>
              <span className="text-white">PostgreSQL 14.5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Connection Pool:</span>
              <span className="text-white">25/50 active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Query Performance:</span>
              <span className="text-green-500">Good</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Backup:</span>
              <span className="text-white">Today, 00:00 UTC</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Optimization Dashboard */}
      <div className="mt-8">
        <OptimizationDashboard />
      </div>
    </div>
  );
};

export default System;