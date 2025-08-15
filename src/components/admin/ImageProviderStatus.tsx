import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Clock, Zap, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface ProviderHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  lastSuccess: string | null;
  averageResponseTime: number;
  todayUsage: number;
  errorRate: number;
}

const ImageProviderStatus: React.FC = () => {
  const [providers, setProviders] = useState<ProviderHealth[]>([
    {
      name: 'OVH',
      status: 'unknown',
      lastSuccess: null,
      averageResponseTime: 0,
      todayUsage: 0,
      errorRate: 0
    },
    {
      name: 'OpenAI',
      status: 'unknown',
      lastSuccess: null,
      averageResponseTime: 0,
      todayUsage: 0,
      errorRate: 0
    }
  ]);
  const [testing, setTesting] = useState<string | null>(null);

  const checkProviderHealth = async (providerName: string) => {
    setTesting(providerName);
    try {
      const startTime = Date.now();
      
      const { error } = await supabase.functions.invoke('regenerate-image', {
        body: { 
          prompt: 'Test image generation - simple colorful circle',
          testMode: true 
        }
      });

      const responseTime = Date.now() - startTime;

      if (error) {
        throw error;
      }

      // Update provider status
      setProviders(prev => prev.map(provider => 
        provider.name === providerName
          ? {
              ...provider,
              status: 'healthy' as const,
              lastSuccess: new Date().toISOString(),
              averageResponseTime: responseTime
            }
          : provider
      ));

      toast.success(`${providerName} is healthy! Response time: ${responseTime}ms`);
    } catch (error: any) {
      console.error(`Error testing ${providerName}:`, error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      
      setProviders(prev => prev.map(provider => 
        provider.name === providerName
          ? {
              ...provider,
              status: 'down' as const,
              errorRate: provider.errorRate + 1
            }
          : provider
      ));

      toast.error(`${providerName} test failed: ${errorMessage}`);
    } finally {
      setTesting(null);
    }
  };

  const testAllProviders = async () => {
    toast.info('Testing all image providers...');
    await Promise.all([
      checkProviderHealth('OVH'),
      checkProviderHealth('OpenAI')
    ]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-white" />;
      case 'down':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
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

  useEffect(() => {
    // Auto-check provider health on component mount
    testAllProviders();
  }, []);

  return (
    <Card className="bg-slate-800 border-purple-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Image Provider Status
            </CardTitle>
            <CardDescription className="text-purple-200">
              Monitor health and performance of image generation providers
            </CardDescription>
          </div>
          <Button
            onClick={testAllProviders}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
            disabled={testing !== null}
          >
            {testing ? 'Testing...' : 'Test All'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {providers.map((provider) => (
          <div
            key={provider.name}
            className="bg-slate-700 p-4 rounded-lg border border-purple-600/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(provider.status)}
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {provider.name}
                  </h3>
                  <Badge className={`${getStatusColor(provider.status)} border-0 text-xs`}>
                    {provider.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => checkProviderHealth(provider.name)}
                variant="outline"
                size="sm"
                className="bg-slate-600 border-purple-600/50 text-purple-300 hover:bg-purple-600 hover:text-white"
                disabled={testing === provider.name}
              >
                {testing === provider.name ? 'Testing...' : 'Test'}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-slate-800 p-2 rounded">
                <div className="text-purple-200 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last Success
                </div>
                <div className="text-white font-medium">
                  {provider.lastSuccess
                    ? new Date(provider.lastSuccess).toLocaleTimeString()
                    : 'Never'
                  }
                </div>
              </div>

              <div className="bg-slate-800 p-2 rounded">
                <div className="text-purple-200 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Avg Response
                </div>
                <div className="text-white font-medium">
                  {provider.averageResponseTime > 0
                    ? `${provider.averageResponseTime}ms`
                    : 'N/A'
                  }
                </div>
              </div>

              <div className="bg-slate-800 p-2 rounded">
                <div className="text-purple-200">Today's Usage</div>
                <div className="text-white font-medium">{provider.todayUsage}</div>
              </div>

              <div className="bg-slate-800 p-2 rounded">
                <div className="text-purple-200">Error Rate</div>
                <div className={`font-medium ${provider.errorRate > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {provider.errorRate}%
                </div>
              </div>
            </div>

            {provider.status === 'down' && (
              <div className="mt-3 p-2 bg-red-900/20 border border-red-600/30 rounded text-red-300 text-sm">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                Provider is currently unavailable. Check your API keys and network connection.
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ImageProviderStatus;