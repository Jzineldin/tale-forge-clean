import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Volume2, Clock } from 'lucide-react';
import { getStuckAudioGenerationStories, resetStuckAudioGeneration } from '@/utils/resetStuckAudioGeneration';
import { toast } from 'sonner';

const AudioGenerationManager: React.FC = () => {
  const [stuckStories, setStuckStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadStuckStories = async () => {
    setLoading(true);
    try {
      const stories = await getStuckAudioGenerationStories();
      setStuckStories(stories);
    } catch (error) {
      console.error('Error loading stuck stories:', error);
      toast.error('Failed to load stuck stories');
    } finally {
      setLoading(false);
    }
  };

  const handleResetStory = async (storyId: string) => {
    try {
      const success = await resetStuckAudioGeneration(storyId);
      if (success) {
        // Remove from the list
        setStuckStories(prev => prev.filter(story => story.id !== storyId));
      }
    } catch (error) {
      console.error('Error resetting story:', error);
    }
  };

  const handleResetAll = async () => {
    if (!confirm('Are you sure you want to reset all stuck audio generation? This will affect all stories currently stuck in audio generation.')) {
      return;
    }

    setRefreshing(true);
    try {
      let successCount = 0;
      for (const story of stuckStories) {
        const success = await resetStuckAudioGeneration(story.id);
        if (success) successCount++;
      }
      
      if (successCount > 0) {
        toast.success(`Successfully reset ${successCount} stuck audio generation(s)`);
        setStuckStories([]);
      }
    } catch (error) {
      console.error('Error resetting all stories:', error);
      toast.error('Failed to reset all stories');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStuckStories();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-purple-600/50">
        <CardHeader>
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Audio Generation Manager
          </CardTitle>
          <CardDescription className="text-purple-300">
            Monitor and fix stories with stuck audio generation status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-purple-300 border-purple-600">
                  {stuckStories.length} stuck stories
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={loadStuckStories}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="border-purple-600 text-purple-300 hover:bg-purple-600/20"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                {stuckStories.length > 0 && (
                  <Button
                    onClick={handleResetAll}
                    disabled={refreshing}
                    variant="destructive"
                    size="sm"
                  >
                    {refreshing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Resetting All...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Reset All
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {stuckStories.length === 0 ? (
              <div className="text-center py-8">
                <Volume2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-green-300 font-medium">No stuck audio generation found!</p>
                <p className="text-gray-400 text-sm mt-1">All audio generation processes are running normally.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-orange-300 text-sm">
                  <AlertTriangle className="inline h-4 w-4 mr-1" />
                  Found {stuckStories.length} story(ies) with stuck audio generation (in_progress for more than 5 minutes)
                </p>
                
                {stuckStories.map((story) => (
                  <div
                    key={story.id}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-orange-500/30"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">
                          {story.title || 'Untitled Story'}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Stuck
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">ID: {story.id}</p>
                      <p className="text-gray-400 text-sm">
                        Last updated: {new Date(story.updated_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleResetStory(story.id)}
                      variant="outline"
                      size="sm"
                      className="border-brand-indigo/50 text-brand-indigo hover:bg-brand-indigo/20"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
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

export default AudioGenerationManager; 