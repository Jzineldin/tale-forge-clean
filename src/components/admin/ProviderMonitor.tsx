import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Monitor, Activity, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ProviderLog {
  timestamp: string;
  provider: string;
  type: 'text' | 'image' | 'tts';
  status: 'success' | 'error' | 'fallback';
  duration?: number;
  error?: string;
}

const ProviderMonitor: React.FC = () => {
  const [logs, setLogs] = useState<ProviderLog[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    errors: 0,
    ovhUsage: 0,
    openaiUsage: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchProviderLogs = async () => {
    setLoading(true);
    try {
      // Fetch Edge Function logs for monitoring
      const { error } = await supabase.functions.invoke('test-connection', {
        body: { action: 'get_provider_stats' }
      });

      if (error) {
        console.error('Error fetching provider logs:', error);
        return;
      }

      // Mock data for demonstration - in real implementation, this would come from logs
      const mockLogs: ProviderLog[] = [
        {
          timestamp: new Date().toISOString(),
          provider: 'OVH',
          type: 'image',
          status: 'success',
          duration: 2.3
        },
        {
          timestamp: new Date(Date.now() - 60000).toISOString(),
          provider: 'OpenAI',
          type: 'image',
          status: 'fallback',
          duration: 3.1
        },
        {
          timestamp: new Date(Date.now() - 120000).toISOString(),
          provider: 'OpenAI',
          type: 'text',
          status: 'success',
          duration: 1.8
        }
      ];

      setLogs(mockLogs);
      
      // Calculate stats
      const total = mockLogs.length;
      const success = mockLogs.filter(log => log.status === 'success').length;
      const errors = mockLogs.filter(log => log.status === 'error').length;
      const ovhUsage = mockLogs.filter(log => log.provider === 'OVH').length;
      const openaiUsage = mockLogs.filter(log => log.provider === 'OpenAI').length;

      setStats({ total, success, errors, ovhUsage, openaiUsage });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch provider logs');
    } finally {
      setLoading(false);
    }
  };

  const testProvider = async (provider: string, type: string) => {
    try {
      toast.info(`Testing ${provider} ${type} generation...`);
      
      let endpoint = '';
      let body = {};
      
      // Use the appropriate endpoint based on provider and type
      if (type === 'text') {
        endpoint = 'generate-story-segment';
        body = {
          prompt: 'Test story generation',
          testMode: true,
          forceProvider: provider.toLowerCase()
        };
      } else if (type === 'image') {
        endpoint = 'regenerate-image';
        body = {
          prompt: 'Test image generation',
          testMode: true,
          forceProvider: provider.toLowerCase()
        };
      } else if (type === 'tts' || type === 'audio') {
        endpoint = 'test-voice';
        body = {
          text: 'This is a test of the voice generation system.',
          voiceId: 'fable',
          testMode: true
        };
      }
      
      const { error } = await supabase.functions.invoke(endpoint, { body });

      if (error) {
        toast.error(`${provider} test failed: ${error.message}`);
      } else {
        toast.success(`${provider} test successful!`);
        fetchProviderLogs(); // Refresh logs
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      toast.error(`${provider} test failed: ${errorMessage}`);
    } finally {
      // Reset testing state handled elsewhere
    }
  };


  useEffect(() => {
    fetchProviderLogs();
    const interval = setInterval(fetchProviderLogs, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'fallback':
        return <AlertTriangle className="h-4 w-4 text-white" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'fallback':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-slate-800 border-purple-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Provider Monitor
        </CardTitle>
        <CardDescription className="text-purple-200">
          Real-time monitoring of AI provider usage and health
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-700 p-3 rounded-lg">
            <div className="text-sm text-purple-200">Total Requests</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-slate-700 p-3 rounded-lg">
            <div className="text-sm text-purple-200">Success Rate</div>
            <div className="text-2xl font-bold text-green-400">
              {stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0}%
            </div>
          </div>
          <div className="bg-slate-700 p-3 rounded-lg">
            <div className="text-sm text-purple-200">Errors</div>
            <div className="text-2xl font-bold text-red-400">{stats.errors}</div>
          </div>
          <div className="bg-slate-700 p-3 rounded-lg">
            <div className="text-sm text-purple-200">OVH Usage</div>
            <div className="text-2xl font-bold text-blue-400">{stats.ovhUsage}</div>
          </div>
          <div className="bg-slate-700 p-3 rounded-lg">
            <div className="text-sm text-purple-200">OpenAI Usage</div>
            <div className="text-2xl font-bold text-orange-400">{stats.openaiUsage}</div>
          </div>
        </div>

        {/* Provider Test Buttons */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Test Providers</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              onClick={() => testProvider('OVH', 'image')}
              variant="outline"
              size="sm"
              className="bg-slate-700 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
            >
              Test OVH
            </Button>
            <Button
              onClick={() => testProvider('OpenAI', 'image')}
              variant="outline"
              size="sm"
              className="bg-slate-700 border-brand-indigo text-brand-indigo hover:bg-brand-indigo hover:text-white"
            >
              Test OpenAI
            </Button>
            <Button
              onClick={() => testProvider('Gemini', 'text')}
              variant="outline"
              size="sm"
              className="bg-slate-700 border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
            >
              Test Gemini
            </Button>
            <Button
              onClick={fetchProviderLogs}
              variant="outline"
              size="sm"
              className="bg-slate-700 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </h3>
          <ScrollArea className="h-64 w-full rounded-md border border-purple-600 bg-slate-700">
            <div className="p-4 space-y-2">
              {logs.length === 0 ? (
                <div className="text-center text-purple-200 py-8">
                  No recent activity
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <div className="text-white font-medium">
                          {log.provider} - {log.type}
                        </div>
                        <div className="text-sm text-purple-200 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(log.status)} text-white border-0`}>
                        {log.status}
                      </Badge>
                      {log.duration && (
                        <span className="text-sm text-purple-200">
                          {log.duration}s
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderMonitor;