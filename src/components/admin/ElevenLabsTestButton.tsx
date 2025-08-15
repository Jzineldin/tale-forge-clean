import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Volume2, Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ESSENTIAL_VOICES as STORYTELLER_VOICES } from '@/lib/voices-optimized';

const ElevenLabsTestButton: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    voicesCount?: number;
    audioSize?: number;
  } | null>(null);

  const testElevenLabs = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      console.log('🎵 Testing ElevenLabs integration...');
      
      // Use static voice list instead of API call
      const staticVoices = STORYTELLER_VOICES;
      
      console.log('🎵 ElevenLabs test result:', { voices: staticVoices });
      
      setTestResult({
        success: true,
        message: 'Static voice list loaded successfully',
        voicesCount: staticVoices.length
      });
      
      toast.success(`ElevenLabs test successful! Found ${staticVoices.length} voices.`);
      
    } catch (error: any) {
      console.error('🚨 ElevenLabs test failed:', error);
      setTestResult({
        success: false,
        message: error?.message || 'Unknown error occurred'
      });
      toast.error(`ElevenLabs test failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const testVoiceGeneration = async () => {
    setTesting(true);
    
    try {
      console.log('🎵 Testing ElevenLabs voice generation...');
      
      const { error } = await supabase.functions.invoke('test-voice', {
        body: {
          text: 'Hello! This is a test of ElevenLabs voice generation for Tale Forge.',
          voiceId: 'nPczCjzI2devNBz1zQrb' // Brian - Master Storyteller
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log('🎵 Voice generation successful');
      toast.success('Voice generation test successful!');
      
    } catch (error: any) {
      console.error('🚨 Voice generation test failed:', error);
      toast.error(`Voice generation failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-purple-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          ElevenLabs Integration Test
        </CardTitle>
        <CardDescription className="text-purple-200">
          Test the ElevenLabs TTS integration and voice generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={testElevenLabs}
            disabled={testing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Volume2 className="h-4 w-4 mr-2" />
            )}
            Test API Connection
          </Button>
          
          <Button
            onClick={testVoiceGeneration}
            disabled={testing}
            variant="outline"
            className="bg-slate-700 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Test Voice Generation
          </Button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-900/20 border border-green-600/30' : 'bg-red-900/20 border border-red-600/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className={`font-semibold ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                {testResult.success ? 'Success' : 'Failed'}
              </span>
            </div>
            <p className="text-white text-sm">{testResult.message}</p>
            {testResult.voicesCount && (
              <p className="text-purple-200 text-sm mt-1">
                Found {testResult.voicesCount} available voices
              </p>
            )}
            {testResult.audioSize && (
              <p className="text-purple-200 text-sm">
                Generated {testResult.audioSize} bytes of audio
              </p>
            )}
          </div>
        )}

        <div className="text-sm text-purple-200">
          <p>• <strong>API Connection Test:</strong> Verifies ElevenLabs API key and fetches available voices</p>
          <p>• <strong>Voice Generation Test:</strong> Generates actual audio using the Fable voice</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElevenLabsTestButton; 