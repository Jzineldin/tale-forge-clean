
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  service: string;
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
  duration?: number;
}

const AIConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([
    { service: 'Text Generation (Gemini)', status: 'idle' },
    { service: 'Image Generation (Dynamic)', status: 'idle' },
    { service: 'Audio Generation (ElevenLabs)', status: 'idle' },
    { service: 'Health Check', status: 'idle' }
  ]);

  const updateTestResult = (service: string, update: Partial<TestResult>) => {
    setTestResults(prev => prev.map(result => 
      result.service === service ? { ...result, ...update } : result
    ));
  };

  const testHealthCheck = async () => {
    const startTime = Date.now();
    updateTestResult('Health Check', { status: 'testing' });

    try {
      const { error } = await supabase.functions.invoke('health-check');
      const duration = Date.now() - startTime;
      
      if (error) throw error;
      
      updateTestResult('Health Check', { 
        status: 'success', 
        message: `API responded in ${duration}ms`,
        duration 
      });
    } catch (error: any) {
      updateTestResult('Health Check', { 
        status: 'error', 
        message: error?.message || 'Health check failed' 
      });
    }
  };

  const testTextGeneration = async () => {
    const startTime = Date.now();
    updateTestResult('Text Generation (Gemini)', { status: 'testing' });

    try {
      const { error } = await supabase.functions.invoke('generate-story-segment', {
        body: {
          storyId: 'test-story-id',
          prompt: 'Test prompt for AI generation',
          choice: null,
          parentSegmentId: null,
          testMode: true
        }
      });
      
      const duration = Date.now() - startTime;
      
      if (error) throw error;
      
      updateTestResult('Text Generation (Gemini)', { 
        status: 'success', 
        message: `Generated text in ${duration}ms`,
        duration 
      });
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      updateTestResult('Text Generation (Gemini)', { 
        status: 'error', 
        message: errorMessage || 'Text generation failed' 
      });
    }
  };

  const testVoiceGeneration = async () => {
    const startTime = Date.now();
    updateTestResult('Audio Generation (ElevenLabs)', { status: 'testing' });

    try {
      const { error } = await supabase.functions.invoke('test-voice', {
        body: {
          text: 'This is a test of the voice generation system.',
          voiceId: 'fable'
        }
      });
      
      const duration = Date.now() - startTime;
      
      if (error) throw error;
      
      updateTestResult('Audio Generation (ElevenLabs)', { 
        status: 'success', 
        message: `Generated audio in ${duration}ms`,
        duration 
      });
    } catch (error: any) {
      updateTestResult('Audio Generation (ElevenLabs)', { 
        status: 'error', 
        message: error?.message || 'Audio generation failed' 
      });
    }
  };

  const testImageGeneration = async () => {
    const startTime = Date.now();
    updateTestResult('Image Generation (Dynamic)', { status: 'testing' });

    try {
      const { error } = await supabase.functions.invoke('regenerate-image', {
        body: {
          prompt: 'A simple test image for admin panel',
          testMode: true
        }
      });
      
      const duration = Date.now() - startTime;
      
      if (error) {
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        updateTestResult('Image Generation (Dynamic)', { 
          status: 'error', 
          message: errorMessage || 'Image generation failed' 
        });
      } else {
        updateTestResult('Image Generation (Dynamic)', { 
          status: 'success', 
          message: `Image generated in ${duration}ms`,
          duration 
        });
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      updateTestResult('Image Generation (Dynamic)', { 
        status: 'error', 
        message: errorMessage || 'Image generation failed' 
      });
    }
  };

  const runAllTests = async () => {
    await Promise.all([
      testHealthCheck(),
      testTextGeneration(),
      testImageGeneration(),
      testVoiceGeneration()
    ]);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'testing':
        return <Badge variant="secondary" className="bg-blue-600">Testing...</Badge>;
      case 'success':
        return <Badge variant="secondary" className="bg-green-600">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  return (
    <Card className="bg-slate-800 border-purple-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="h-5 w-5" />
          AI Connection Tests
        </CardTitle>
        <CardDescription className="text-purple-200">
          Test all AI service connections to ensure proper functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button onClick={runAllTests} className="bg-purple-600 hover:bg-purple-700">
            Run All Tests
          </Button>
          <Button onClick={testHealthCheck} variant="outline" size="sm">
            Health Check
          </Button>
          <Button onClick={testTextGeneration} variant="outline" size="sm">
            Text
          </Button>
          <Button onClick={testImageGeneration} variant="outline" size="sm">
            Image
          </Button>
          <Button onClick={testVoiceGeneration} variant="outline" size="sm">
            Audio
          </Button>
        </div>

        <div className="space-y-4">
          {testResults.map((result) => (
            <div key={result.service} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div>
                  <h3 className="text-white font-medium">{result.service}</h3>
                  {result.message && (
                    <p className="text-sm text-purple-200 mt-1">{result.message}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {result.duration && (
                  <span className="text-sm text-purple-300">{result.duration}ms</span>
                )}
                {getStatusBadge(result.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIConnectionTest;
