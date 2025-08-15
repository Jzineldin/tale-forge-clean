import React, { useState } from 'react';
import { Search, Filter, Download, RefreshCw, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source: string;
  details?: string;
}

const Logs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [logLevel, setLogLevel] = useState('all');
  
  // Mock log data
  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: '2025-07-22T23:45:12Z',
      level: 'error',
      message: 'Database connection failed',
      source: 'api/database.ts',
      details: 'Connection timeout after 30s'
    },
    {
      id: '2',
      timestamp: '2025-07-22T23:42:05Z',
      level: 'warning',
      message: 'High memory usage detected',
      source: 'system/monitor.ts',
      details: 'Memory usage at 85%'
    },
    {
      id: '3',
      timestamp: '2025-07-22T23:40:18Z',
      level: 'info',
      message: 'User authentication successful',
      source: 'auth/login.ts'
    },
    {
      id: '4',
      timestamp: '2025-07-22T23:38:45Z',
      level: 'info',
      message: 'Story generation completed',
      source: 'story/generator.ts'
    },
    {
      id: '5',
      timestamp: '2025-07-22T23:35:22Z',
      level: 'debug',
      message: 'Cache invalidation triggered',
      source: 'cache/manager.ts',
      details: 'Invalidated 24 entries'
    },
    {
      id: '6',
      timestamp: '2025-07-22T23:30:10Z',
      level: 'error',
      message: 'API rate limit exceeded',
      source: 'api/external.ts',
      details: 'OpenAI API rate limit reached'
    }
  ];
  
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'debug':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = logLevel === 'all' || log.level === logLevel;
    
    return matchesSearch && matchesLevel;
  });
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">System Logs</h2>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400" />
          <select 
            className="bg-slate-700 text-white rounded-lg px-3 py-2"
            value={logLevel}
            onChange={(e) => setLogLevel(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
        </div>
        
        <button className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-4 py-2 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </button>
        
        <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
      
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-white">Time</th>
                <th className="px-6 py-3 text-left text-white">Level</th>
                <th className="px-6 py-3 text-left text-white">Message</th>
                <th className="px-6 py-3 text-left text-white">Source</th>
                <th className="px-6 py-3 text-left text-white">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-700">
                  <td className="px-6 py-4 text-gray-300">{formatTimestamp(log.timestamp)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getLevelIcon(log.level)}
                      <span className="ml-2 text-white capitalize">{log.level}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{log.message}</td>
                  <td className="px-6 py-4 text-gray-400">{log.source}</td>
                  <td className="px-6 py-4 text-gray-400">{log.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-gray-400">
          Showing {filteredLogs.length} of {logs.length} logs
        </div>
        
        <div className="flex space-x-2">
          <button className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-1">Previous</button>
          <button className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-1">Next</button>
        </div>
      </div>
    </div>
  );
};

export default Logs;