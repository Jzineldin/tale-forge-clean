import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGenerateFullStoryAudio } from '@/hooks/useGenerateFullStoryAudio';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VoiceGenerationDebug: React.FC = () => {
  const [storyId, setStoryId] = useState('');
  const [voiceId, setVoiceId] = useState('jbHveVx08UsDYum4fcml'); // Default Kevin voice
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  const generateAudioMutation = useGenerateFullStoryAudio();

  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testSupabaseConnection = async () => {
    setIsTestingConnection(true);
    addTestResult('🔍 Testing Supabase connection...');
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        addTestResult(`❌ Auth error: ${userError.message}`);
        return;
      }
      
      if (!user) {
        addTestResult('❌ No authenticated user');
        return;
      }
      
      addTestResult(`✅ User authenticated: ${user.email}`);
      
      // Test function availability
      const { data, error } = await supabase.functions.invoke('generate-full-story-audio', {
        body: { test: true }
      });
      
      if (error) {
        addTestResult(`⚠️ Function test error: ${error.message}`);
      } else {
        addTestResult('✅ Function is accessible');
      }
      
    } catch (error) {
      addTestResult(`❌ Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testVoiceGeneration = async () => {
    if (!storyId) {
      toast.error('Please enter a story ID');
      return;
    }

    addTestResult(`🎵 Starting voice generation test for story: ${storyId}`);
    addTestResult(`🎤 Using voice ID: ${voiceId}`);

    try {
      // First check if story exists
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('id, title, audio_generation_status')
        .eq('id', storyId)
        .single();

      if (storyError) {
        addTestResult(`❌ Story not found: ${storyError.message}`);
        return;
      }

      addTestResult(`✅ Story found: "${story.title}" (status: ${story.audio_generation_status})`);

      // Check segments
      const { data: segments, error: segmentsError } = await supabase
        .from('story_segments')
        .select('id, segment_text')
        .eq('story_id', storyId);

      if (segmentsError) {
        addTestResult(`❌ Segments error: ${segmentsError.message}`);
        return;
      }

      addTestResult(`✅ Found ${segments?.length || 0} segments`);

      if (!segments || segments.length === 0) {
        addTestResult('❌ No segments found - cannot generate audio');
        return;
      }

      // Test the mutation
      const result = await generateAudioMutation.mutateAsync({
        storyId,
        voiceId
      });

      addTestResult(`✅ Voice generation completed: ${JSON.stringify(result)}`);

    } catch (error) {
      addTestResult(`❌ Voice generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-amber-300">🔧 Voice Generation Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Story ID</label>
              <input
                type="text"
                value={storyId}
                onChange={(e) => setStoryId(e.target.value)}
                placeholder="Enter story ID to test"
                className="w-full p-2 border rounded bg-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Voice ID</label>
              <input
                type="text"
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                placeholder="Voice ID"
                className="w-full p-2 border rounded bg-slate-700 text-white"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={testSupabaseConnection}
              disabled={isTestingConnection}
              variant="outline"
            >
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
            
            <Button 
              onClick={testVoiceGeneration}
              disabled={generateAudioMutation.isPending || !storyId}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {generateAudioMutation.isPending ? 'Generating...' : 'Test Voice Generation'}
            </Button>
            
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-green-300">📋 Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-900 p-4 rounded-lg max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-400">No test results yet. Run a test to see output.</p>
            ) : (
              <div className="space-y-1 font-mono text-sm">
                {testResults.map((result, index) => (
                  <div key={index} className="text-gray-300">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceGenerationDebug;
