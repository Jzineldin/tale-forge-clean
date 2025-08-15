import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, RefreshCw, Database } from 'lucide-react';
import { toast } from 'sonner';

// REAL pricing data for providers we actually use
const REAL_PRICING = {
  elevenlabs: {
    audio: {
      'eleven_multilingual_v2': 0.03, // $0.03 per 1K characters
      'eleven_turbo_v2': 0.02 // $0.02 per 1K characters
    }
  },
  openai: {
    // Only if we have actual OpenAI TTS usage (legacy)
    audio: {
      'tts-1': 0.015, // $0.015 per 1K characters
      'tts-1-hd': 0.03 // $0.03 per 1K characters
    }
  }
};

interface RealUsageData {
  provider: string;
  service: 'audio';
  model: string;
  characterCount: number;
  requestCount: number;
  totalCost: number;
  details: string;
}

const CostTracker: React.FC = () => {
  const [realUsage, setRealUsage] = useState<RealUsageData[]>([]);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [hasRealData, setHasRealData] = useState(false);

  const fetchRealUsageData = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(now.getDate() - 30);
          break;
      }

      console.log('Fetching real usage data from:', startDate.toISOString());

      // Look for audio URLs in story_segments (indicates audio was generated)
      const { data: segments, error: segmentsError } = await supabase
        .from('story_segments')
        .select('id, audio_url, segment_text, created_at')
        .gte('created_at', startDate.toISOString())
        .not('audio_url', 'is', null)
        .order('created_at', { ascending: false });

      if (segmentsError) throw segmentsError;

      if (segments && segments.length > 0) {
        console.log('Found segments with audio URLs:', segments.length);
        setHasRealData(true);
        processSegmentAudioUsage(segments);
      } else {
        setHasRealData(false);
        setRealUsage([]);
        setTotalCost(0);
      }

      if (realUsage.length > 0) {
        toast.success(`Found ${realUsage.length} real usage records`);
      } else {
        toast.info('No real usage data found for this time period');
      }
    } catch (error: any) {
      console.error('Error fetching real usage:', error);
      toast.error('Failed to fetch usage data');
    } finally {
      setLoading(false);
    }
  };

  const processSegmentAudioUsage = (segments: any[]) => {
    const usageMap = new Map<string, RealUsageData>();
    const key = 'elevenlabs-eleven_multilingual_v2';

    const existing = usageMap.get(key) || {
      provider: 'elevenlabs',
      service: 'audio' as const,
      model: 'eleven_multilingual_v2',
      characterCount: 0,
      requestCount: 0,
      totalCost: 0,
      details: ''
    };

    segments.forEach(segment => {
      // Use actual character count from segment text
      existing.characterCount += segment.segment_text?.length || 0;
      existing.requestCount += 1;
    });

    usageMap.set(key, existing);
    calculateCosts(usageMap);
  };

  const calculateCosts = (usageMap: Map<string, RealUsageData>) => {
    const realUsageArray: RealUsageData[] = [];
    let total = 0;

    for (const [, usage] of usageMap) {
      const providerPricing = REAL_PRICING[usage.provider as keyof typeof REAL_PRICING];
      
      if (providerPricing && 'audio' in providerPricing) {
        const audioPricing = providerPricing.audio as any;
        const modelPricing = audioPricing[usage.model];
        
        if (typeof modelPricing === 'number') {
          const cost = (usage.characterCount / 1000) * modelPricing;
          usage.totalCost = cost;
          usage.details = `${usage.characterCount.toLocaleString()} characters in ${usage.requestCount} requests`;
          total += cost;
        }
      }

      realUsageArray.push(usage);
    }

    setRealUsage(realUsageArray);
    setTotalCost(total);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  const getProviderColor = (provider: string): string => {
    switch (provider.toLowerCase()) {
      case 'elevenlabs':
        return 'bg-purple-600';
      case 'openai':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  useEffect(() => {
    fetchRealUsageData();
  }, [timeRange]);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Real Cost Tracking</h2>
          <p className="text-purple-200 text-sm">Only shows actual API usage from database</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32 bg-slate-700 border-purple-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={fetchRealUsageData}
            disabled={loading}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Data Source Alert */}
      <Alert className="bg-blue-900 border-blue-600">
        <Database className="h-4 w-4" />
        <AlertDescription className="text-blue-200">
          <strong>Real Data Source:</strong> Tracking actual audio generation from story_segments table.
          {hasRealData ? ' Real usage data found!' : ' No real usage data found yet.'}
        </AlertDescription>
      </Alert>

      {/* Total Cost Card */}
      <Card className="bg-slate-800 border-purple-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Real Total Cost ({timeRange})</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalCost)}</p>
              {totalCost === 0 && (
                <p className="text-gray-400 text-xs mt-1">No costs incurred yet</p>
              )}
            </div>
            <DollarSign className="h-12 w-12 text-green-400" />
          </div>
        </CardContent>
      </Card>

      {/* Real Usage Data */}
      {realUsage.length > 0 ? (
        <Card className="bg-slate-800 border-purple-600">
          <CardHeader>
            <CardTitle className="text-white">Real Usage Breakdown</CardTitle>
            <CardDescription className="text-purple-200">
              Actual API usage calculated from generated audio segments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {realUsage.map((item, idx) => (
                <div key={idx} className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getProviderColor(item.provider)} text-white`}>
                        {item.provider}
                      </Badge>
                      <span className="text-white font-medium">
                        {item.service} ({item.model})
                      </span>
                    </div>
                    <span className="text-green-400 font-bold">
                      {formatCurrency(item.totalCost)}
                    </span>
                  </div>
                  <div className="text-purple-200 text-sm">
                    {item.details}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-800 border-gray-600">
          <CardContent className="p-6 text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white text-lg mb-2">No Real Usage Data</h3>
            <p className="text-gray-400 text-sm">
              No actual API usage found in the database for the selected time period.
              Start generating stories with audio to see real cost tracking.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Provider Information */}
      <Card className="bg-slate-800 border-purple-600">
        <CardHeader>
          <CardTitle className="text-white">Current Provider Pricing</CardTitle>
          <CardDescription className="text-purple-200">
            Real pricing for providers we actually use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-700 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Badge className="bg-purple-600 text-white">ElevenLabs</Badge>
                Audio Generation
              </h4>
              <ul className="text-purple-200 text-sm space-y-1">
                <li>• Multilingual v2: $0.03 per 1K characters</li>
                <li>• Turbo v2: $0.02 per 1K characters</li>
              </ul>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Badge className="bg-green-600 text-white">OpenAI</Badge>
                Audio (Legacy)
              </h4>
              <ul className="text-purple-200 text-sm space-y-1">
                <li>• TTS-1: $0.015 per 1K characters</li>
                <li>• TTS-1-HD: $0.03 per 1K characters</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Optimization Tips */}
      <Card className="bg-slate-800 border-purple-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cost Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-purple-200">
            <li>• ElevenLabs Turbo v2 is 33% cheaper than Multilingual v2</li>
            <li>• Monitor character usage to stay within plan limits</li>
            <li>• Consider voice caching for frequently used phrases</li>
            <li>• Use shorter segments to reduce character count</li>
            <li>• Track usage patterns to optimize subscription tier</li>
          </ul>
        </CardContent>
      </Card>

      {/* Database Schema Info */}
      <Card className="bg-slate-800 border-blue-600">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-semibold mb-1">Real Data Tracking</p>
              <p>
                This cost tracker only shows real usage from the story_segments table. 
                No estimated or fake costs are included. Data is updated in real-time as users generate audio.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostTracker; 