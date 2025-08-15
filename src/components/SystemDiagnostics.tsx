
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Image, AlertCircle, CheckCircle, Clock, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthRequired } from '@/hooks/useAuthRequired';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
interface StorySegment {
  id: string;
  segment_text: string;
  image_url: string | null;
  image_generation_status: string | null;
  created_at: string;
  story_id: string;
}

const SystemDiagnostics: React.FC = () => {
  const [segments, setSegments] = useState<StorySegment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Not tested');
  const [imageTestResult, setImageTestResult] = useState<string | null>(null);
  
  const { checkAuthAndExecute, showAuthModal, setShowAuthModal } = useAuthRequired({
    feature: 'image generation test'
  });

  const loadRecentSegments = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Loading recent story segments for diagnostics...');
      
      const { data, error } = await supabase
        .from('story_segments')
        .select('id, segment_text, image_url, image_generation_status, created_at, story_id')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Error loading segments:', error);
        throw error;
      }

      console.log('✅ Loaded segments:', data?.length || 0);
      setSegments(data || []);
      
      // Test connection status
      const { error: testError } = await supabase
        .from('story_segments')
        .select('count')
        .limit(1);
        
      if (testError) {
        setConnectionStatus('❌ Connection Failed');
      } else {
        setConnectionStatus('✅ Connected');
      }
      
    } catch (error) {
      console.error('Error in diagnostics:', error);
      toast.error('Failed to load diagnostic data');
      setConnectionStatus('❌ Error');
    } finally {
      setIsLoading(false);
    }
  };

  const testImageGeneration = async () => {
    checkAuthAndExecute(async () => {
      setImageTestResult('Testing...');
      try {
        console.log('🧪 Testing image generation capabilities...');
        
        const { data, error } = await supabase.functions.invoke('regenerate-image', {
          body: {
            prompt: 'A simple test image of a magical forest',
            testMode: true
          }
        });

        if (error) {
          console.error('❌ Image test error:', error);
          setImageTestResult(`❌ Test Failed: ${error.message}`);
          return;
        }

        if (data?.success) {
          setImageTestResult(`✅ Test Successful: ${data.message}`);
          console.log('✅ Image generation test successful');
        } else {
          setImageTestResult(`❌ Test Failed: ${data?.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('❌ Image test exception:', error);
        setImageTestResult(`❌ Test Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  const refreshSegment = async (segmentId: string) => {
    try {
      console.log(`🔄 Force refreshing segment: ${segmentId}`);
      
      const { data, error } = await supabase
        .from('story_segments')
        .select('*')
        .eq('id', segmentId)
        .single();

      if (error) throw error;
      
      console.log('📊 Refreshed segment data:', {
        id: data.id,
        image_url: data.image_url ? 'present' : 'missing',
        image_generation_status: data.image_generation_status,
        created_at: data.created_at
      });

      // Update the segment in our local state
      setSegments(prev => prev.map(seg => 
        seg.id === segmentId ? { ...seg, ...data } : seg
      ));
      
      toast.success('Segment refreshed');
    } catch (error) {
      console.error('❌ Error refreshing segment:', error);
      toast.error('Failed to refresh segment');
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Wand2 className="h-4 w-4 text-blue-500" />;
              case 'pending': return <Clock className="h-4 w-4 text-white" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Image className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
              case 'pending': return 'bg-indigo-100 text-indigo-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            System Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <Button 
              onClick={loadRecentSegments}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Load Recent Segments
            </Button>
            
            <Button 
              onClick={testImageGeneration}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Image className="h-4 w-4" />
              Test Image Generation
            </Button>
            
            <Badge variant="outline" className="flex items-center gap-2">
              Database: {connectionStatus}
            </Badge>
          </div>

          {imageTestResult && (
            <div className="p-3 rounded-lg bg-muted">
              <strong>Image Generation Test:</strong> {imageTestResult}
            </div>
          )}
        </CardContent>
      </Card>

      {segments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Story Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {segments.map((segment) => (
                <div key={segment.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(segment.image_generation_status)}
                      <span className="font-mono text-sm text-muted-foreground">
                        {segment.id.substring(0, 8)}...
                      </span>
                      <Badge className={getStatusColor(segment.image_generation_status)}>
                        {segment.image_generation_status || 'not_started'}
                      </Badge>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => refreshSegment(segment.id)}
                      className="flex items-center gap-1"
                    >
                      <LoadingSpinner size="sm" className="h-3 w-3" />
                      Refresh
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Story Text:</strong>
                      <p className="text-muted-foreground mt-1 line-clamp-2">
                        {segment.segment_text?.substring(0, 150)}...
                      </p>
                    </div>
                    
                    <div>
                      <strong>Image Status:</strong>
                      <div className="mt-1 space-y-1">
                        <p className="text-muted-foreground">
                          URL: {segment.image_url ? (
                            <span className="text-green-600 font-mono text-xs">
                              {segment.image_url.substring(0, 50)}...
                            </span>
                          ) : (
                            <span className="text-red-600">None</span>
                          )}
                        </p>
                        <p className="text-muted-foreground">
                          Created: {new Date(segment.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {segment.image_generation_status === 'failed' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        <strong>Image Generation Failed</strong>
                      </p>
                      <p className="text-red-600 text-sm mt-1">
                        This segment's image generation failed. Common causes:
                      </p>
                      <ul className="text-red-600 text-sm mt-1 ml-4 list-disc">
                        <li>OVH API rate limits exceeded (2 req/min for anonymous users)</li>
                        <li>Missing OVH API token configuration</li>
                        <li>Network connectivity issues</li>
                        <li>OpenAI fallback also failed</li>
                      </ul>
                    </div>
                  )}
                  
                  {segment.image_generation_status === 'in_progress' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-800 text-sm">
                        <Wand2 className="h-4 w-4 inline mr-2" />
                        <strong>Image Currently Generating</strong>
                      </p>
                      <p className="text-blue-600 text-sm mt-1">
                        This may take 30-60 seconds. The page should automatically update when complete.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold">If images aren't generating:</h4>
            <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
              <li>Check if you're hitting OVH rate limits (2 requests per minute for anonymous users)</li>
              <li>Wait 1-2 minutes between story generation attempts</li>
              <li>Verify your internet connection is stable</li>
              <li>Try refreshing the page if segments show "in_progress" for more than 2 minutes</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">If real-time updates aren't working:</h4>
            <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
              <li>Check browser console for WebSocket connection errors</li>
              <li>Ensure you're on a supported browser (Chrome, Firefox, Safari)</li>
              <li>Try refreshing the page to restart the connection</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {/* Authentication Required Modal */}
      <AuthRequiredModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        feature="image generation test"
      />
    </div>
  );
};

export default SystemDiagnostics;
