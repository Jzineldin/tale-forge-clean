import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface APIMetrics {
  provider: string;
  service: 'text' | 'image' | 'audio';
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastSuccess: string | null;
  lastFailure: string | null;
  healthStatus: 'healthy' | 'degraded' | 'down';
  uptime: number;
  errorRate: number;
}

const APIMonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<APIMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  // Initialize with empty metrics for each provider
  const initializeMetrics = (): APIMetrics[] => {
    const providers = [
      { provider: 'OpenAI', service: 'text' as const },
      { provider: 'OpenAI', service: 'image' as const },
      { provider: 'OpenAI', service: 'audio' as const },
      { provider: 'OVH', service: 'text' as const },
      { provider: 'OVH', service: 'image' as const },
      { provider: 'Gemini', service: 'text' as const },
    ];

    return providers.map(({ provider, service }) => ({
      provider,
      service,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastSuccess: null,
      lastFailure: null,
      healthStatus: 'healthy' as const,
      uptime: 100,
      errorRate: 0
    }));
  };

  // Test individual provider with real API calls
  const testProvider = async (provider: string, service: 'text' | 'image' | 'audio') => {
    const metricKey = `${provider}-${service}`;
    setTestingProvider(metricKey);
    
    const startTime = Date.now();
    let success = false;
    let error: string | null = null;

    try {
      switch (service) {
        case 'text': {
          const textEndpoint = provider === 'Gemini' || provider === 'OVH' ? 'generate-story-segment' : 'generate-story-segment';
          const { error: textError } = await supabase.functions.invoke(textEndpoint, {
            body: {
              prompt: 'Test story generation for admin panel',
              testMode: true,
              forceProvider: provider.toLowerCase() // Force specific provider for testing
            }
          });
          
          if (textError) throw textError;
          success = true;
          break;
        }

        case 'image': {
          const { error: imageError } = await supabase.functions.invoke('regenerate-image', {
            body: {
              prompt: 'A simple test image for admin panel',
              testMode: true,
              forceProvider: provider.toLowerCase() // Force specific provider for testing
            }
          });
          
          if (imageError) throw imageError;
          success = true;
          break;
        }

        case 'audio': {
          const { error: audioError } = await supabase.functions.invoke('test-voice', {
            body: {
              text: 'This is a test of the audio generation system.',
              voiceId: 'fable',
              testMode: true
            }
          });
          
          if (audioError) throw audioError;
          success = true;
          break;
        }
      }
    } catch (err: any) {
      error = err.message || 'Unknown error';
      success = false;
    }

    const responseTime = Date.now() - startTime;

    // Update metrics for this provider
    setMetrics(prev => prev.map(metric => {
      if (metric.provider === provider && metric.service === service) {
        const newTotalRequests = metric.totalRequests + 1;
        const newSuccessfulRequests = success ? metric.successfulRequests + 1 : metric.successfulRequests;
        const newFailedRequests = !success ? metric.failedRequests + 1 : metric.failedRequests;
        const newErrorRate = (newFailedRequests / newTotalRequests) * 100;
        const newAverageResponseTime = ((metric.averageResponseTime * metric.totalRequests) + responseTime) / newTotalRequests;

        return {
          ...metric,
          totalRequests: newTotalRequests,
          successfulRequests: newSuccessfulRequests,
          failedRequests: newFailedRequests,
          averageResponseTime: Math.round(newAverageResponseTime),
          lastSuccess: success ? new Date().toISOString() : metric.lastSuccess,
          lastFailure: !success ? new Date().toISOString() : metric.lastFailure,
          healthStatus: newErrorRate < 10 ? 'healthy' : newErrorRate < 30 ? 'degraded' : 'down',
          errorRate: Math.round(newErrorRate * 10) / 10,
          uptime: Math.round(((newSuccessfulRequests / newTotalRequests) * 100) * 10) / 10
        };
      }
      return metric;
    }));

    setTestingProvider(null);

    if (success) {
      toast.success(`${provider} ${service} test passed (${responseTime}ms)`);
    } else {
      toast.error(`${provider} ${service} test failed: ${error}`);
    }
  };

  const testAllProviders = async () => {
    setLoading(true);
    toast.info('Testing all providers...');

    for (const metric of metrics) {
      await testProvider(metric.provider, metric.service);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    }

    setLoading(false);
    toast.success('All provider tests completed');
  };

  const testHealthCheck = async () => {
    try {
      const { error } = await supabase.functions.invoke('health-check');
      
      if (error) {
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        toast.error(`Health check error: ${errorMessage}`);
      } else {
        toast.success('Health check passed');
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      toast.error(`Health check error: ${errorMessage}`);
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-white" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500 text-white';
      case 'degraded':
        return 'bg-yellow-500 text-black';
      case 'down':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const totalRequests = metrics.reduce((sum, metric) => sum + metric.totalRequests, 0);
  const totalErrors = metrics.reduce((sum, metric) => sum + metric.failedRequests, 0);
  const averageResponseTime = metrics.length > 0 && totalRequests > 0
    ? metrics.reduce((sum, metric) => sum + (metric.averageResponseTime * metric.totalRequests), 0) / totalRequests
    : 0;

  useEffect(() => {
    setMetrics(initializeMetrics());
  }, []);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-purple-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Total Tests Run</p>
                <p className="text-2xl font-bold text-white">{totalRequests}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-purple-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Failed Tests</p>
                <p className="text-2xl font-bold text-red-400">{totalErrors}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-purple-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Avg Response Time</p>
                <p className="text-2xl font-bold text-white">{Math.round(averageResponseTime)}ms</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Provider Testing & Monitoring</h3>
        <div className="flex gap-2">
          <Button
            onClick={testHealthCheck}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Health Check'}
          </Button>
          <Button
            onClick={testAllProviders}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
            disabled={testingProvider !== null}
          >
            Test All Providers
          </Button>
        </div>
      </div>

      {/* Provider Metrics */}
      <Card className="bg-slate-800 border-purple-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Provider Performance Metrics
          </CardTitle>
          <CardDescription className="text-purple-200">
            Real-time testing and monitoring of AI providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.map((metric, index) => {
              const isTestingThis = testingProvider === `${metric.provider}-${metric.service}`;
              
              return (
                <div key={index} className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {isTestingThis ? (
                        <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                      ) : (
                        getHealthIcon(metric.healthStatus)
                      )}
                      <div>
                        <h3 className="text-white font-semibold">
                          {metric.provider} - {metric.service.toUpperCase()}
                        </h3>
                        <Badge className={`${getHealthColor(metric.healthStatus)} text-xs border-0`}>
                          {metric.healthStatus.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => testProvider(metric.provider, metric.service)}
                        disabled={testingProvider !== null}
                        variant="outline"
                        size="sm"
                        className="bg-slate-600 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                      >
                        {isTestingThis ? 'Testing...' : 'Test'}
                      </Button>
                      <div className="text-right">
                        <div className="text-white font-semibold">{metric.uptime}% uptime</div>
                        <div className="text-purple-200 text-sm">{metric.errorRate}% error rate</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="bg-slate-800 p-3 rounded">
                      <div className="text-purple-200 text-sm">Total Tests</div>
                      <div className="text-white font-bold">{metric.totalRequests}</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded">
                      <div className="text-purple-200 text-sm">Successful</div>
                      <div className="text-white font-bold">{metric.successfulRequests}</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded">
                      <div className="text-purple-200 text-sm">Failed</div>
                      <div className="text-white font-bold">{metric.failedRequests}</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded">
                      <div className="text-purple-200 text-sm">Avg Response</div>
                      <div className="text-white font-bold">{metric.averageResponseTime}ms</div>
                    </div>
                  </div>

                  {metric.totalRequests > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-200">Success Rate</span>
                        <span className="text-white">{metric.uptime}%</span>
                      </div>
                      <Progress 
                        value={metric.uptime} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {metric.lastFailure && (
                    <div className="mt-2 text-sm text-red-400">
                      Last failure: {new Date(metric.lastFailure).toLocaleString()}
                    </div>
                  )}
                  {metric.lastSuccess && (
                    <div className="mt-1 text-sm text-green-400">
                      Last success: {new Date(metric.lastSuccess).toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIMonitoringDashboard; 