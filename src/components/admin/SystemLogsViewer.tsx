import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, RefreshCw, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  service: string;
  message: string;
  metadata?: any;
  duration?: number;
  statusCode?: number;
}

const SystemLogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Mock data for demonstration - in production, this would come from actual logs
  const generateMockLogs = (): LogEntry[] => {
    const services = ['story-generation', 'image-generation', 'audio-generation', 'health-check'];
    const levels: LogEntry['level'][] = ['info', 'warning', 'error', 'debug'];
    const messages = [
      'Story generation completed successfully',
      'Image generation started with OVH provider',
      'Fallback to OpenAI due to OVH timeout',
      'Audio generation failed - API rate limit exceeded',
      'Health check passed - all systems operational',
      'Database connection established',
      'Cache hit for story segment',
      'Provider response time: 2.3s',
      'Invalid API key detected',
      'Memory usage: 85%'
    ];

    return Array.from({ length: 50 }, (_, i) => {
      const log: LogEntry = {
        id: `log-${i}`,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        service: services[Math.floor(Math.random() * services.length)],
        message: messages[Math.floor(Math.random() * messages.length)]
      };
      
      if (Math.random() > 0.5) {
        log.duration = Math.floor(Math.random() * 5000);
      }
      
      if (Math.random() > 0.7) {
        log.statusCode = Math.random() > 0.5 ? 200 : 500;
      }
      
      if (Math.random() > 0.8) {
        log.metadata = { userId: 'user-123', storyId: 'story-456' };
      }
      
      return log;
    });
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // In production, this would fetch from actual logging system
      // For now, we'll simulate with mock data
      const mockLogs = generateMockLogs();
      setLogs(mockLogs);
      toast.success('Logs refreshed successfully');
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const testLogGeneration = async () => {
    try {
      toast.info('Testing log generation...');
      const { error } = await supabase.functions.invoke('health-check');
      
      if (error) {
        toast.error(`Log test failed: ${error.message}`);
      } else {
        toast.success('Log test completed - check system logs');
        fetchLogs(); // Refresh logs after test
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      toast.error(`Log test failed: ${errorMessage}`);
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Service', 'Message', 'Duration', 'Status Code'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.level,
        log.service,
        `"${log.message}"`,
        log.duration || '',
        log.statusCode || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Logs exported successfully');
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (serviceFilter !== 'all') {
      filtered = filtered.filter(log => log.service === serviceFilter);
    }

    setFilteredLogs(filtered);
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-white" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'debug':
        return <Zap className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
      case 'info':
        return 'bg-blue-500 text-white';
      case 'debug':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, levelFilter, serviceFilter]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 10000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [autoRefresh, fetchLogs]);

  const uniqueServices = [...new Set(logs.map(log => log.service))];

  return (
    <Card className="bg-slate-800 border-purple-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="h-5 w-5" />
          System Logs Viewer
        </CardTitle>
        <CardDescription className="text-purple-200">
          Monitor system logs, API calls, and error tracking in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700 border-purple-600 text-white"
            />
          </div>
          
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-32 bg-slate-700 border-purple-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>

          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-40 bg-slate-700 border-purple-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {uniqueServices.map(service => (
                <SelectItem key={service} value={service}>{service}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={fetchLogs}
            disabled={loading}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>

          <Button
            onClick={testLogGeneration}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
          >
            Test Logs
          </Button>

          <Button
            onClick={exportLogs}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Auto-refresh toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="auto-refresh"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="auto-refresh" className="text-purple-200 text-sm">
            Auto-refresh (10s)
          </label>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-700 p-3 rounded-lg">
            <div className="text-sm text-purple-200">Total Logs</div>
            <div className="text-2xl font-bold text-white">{filteredLogs.length}</div>
          </div>
          <div className="bg-slate-700 p-3 rounded-lg">
            <div className="text-sm text-purple-200">Errors</div>
            <div className="text-2xl font-bold text-red-400">
              {filteredLogs.filter(log => log.level === 'error').length}
            </div>
          </div>
          <div className="bg-slate-700 p-3 rounded-lg">
            <div className="text-sm text-purple-200">Warnings</div>
            <div className="text-2xl font-bold text-white">
              {filteredLogs.filter(log => log.level === 'warning').length}
            </div>
          </div>
          <div className="bg-slate-700 p-3 rounded-lg">
            <div className="text-sm text-purple-200">Services</div>
            <div className="text-2xl font-bold text-blue-400">{uniqueServices.length}</div>
          </div>
        </div>

        {/* Logs Display */}
        <ScrollArea className="h-96 w-full rounded-md border border-purple-600 bg-slate-700">
          <div className="p-4 space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-purple-200 py-8">
                {loading ? 'Loading logs...' : 'No logs match your filters'}
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getLevelIcon(log.level)}
                    <Badge className={`${getLevelColor(log.level)} text-xs border-0`}>
                      {log.level.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-purple-300 text-sm font-medium">{log.service}</span>
                      <span className="text-purple-200 text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      {log.duration && (
                        <span className="text-purple-200 text-xs">
                          {log.duration}ms
                        </span>
                      )}
                      {log.statusCode && (
                        <Badge variant="outline" className="text-xs">
                          {log.statusCode}
                        </Badge>
                      )}
                    </div>
                    <div className="text-white text-sm break-words">{log.message}</div>
                    {log.metadata && (
                      <details className="mt-2">
                        <summary className="text-xs text-purple-300 cursor-pointer">Metadata</summary>
                        <pre className="text-xs text-purple-200 mt-1 p-2 bg-slate-900 rounded">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SystemLogsViewer; 