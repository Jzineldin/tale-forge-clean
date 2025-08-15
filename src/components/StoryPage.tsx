
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useStoryGeneration } from '@/hooks/useStoryGeneration';
import { Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
const StoryPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const { generateSegment, isGenerating, error } = useStoryGeneration();

  const addAnonymousStoryId = (storyId: string) => {
    try {
      const existingIds = JSON.parse(localStorage.getItem('anonymous_story_ids') || '[]');
      if (!existingIds.includes(storyId)) {
        const updatedIds = [...existingIds, storyId];
        localStorage.setItem('anonymous_story_ids', JSON.stringify(updatedIds));
        console.log('Added story ID to anonymous stories:', storyId);
      }
    } catch (error) {
      console.error('Failed to update anonymous story IDs:', error);
    }
  };

  const handleStartStory = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a story prompt');
      return;
    }

    try {
      console.log('Starting new story with prompt:', prompt);
      
      // Create a new story first
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          title: prompt.slice(0, 100), // Use first 100 chars as title
          is_public: false,
          user_id: null // Anonymous for now
        })
        .select()
        .single();

      if (storyError) {
        console.error('Error creating story:', storyError);
        throw new Error('Failed to create story');
      }

      if (!story) {
        throw new Error('No story data returned');
      }

      console.log('Story created successfully:', story);

      // Add to anonymous stories tracking
      addAnonymousStoryId(story.id);

      // Generate the first segment
      await generateSegment({
        storyId: story.id,
        prompt: prompt
      });

      // Show success message with navigation hint
      toast.success('Story created! You can find it in "My Stories" anytime.', {
        duration: 5000,
      });

      // Navigate to the story viewer
      navigate(`/story/${story.id}`);
      
    } catch (err) {
      console.error('Error starting story:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start story';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/90 border-purple-600 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-2xl font-serif flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            Create Your Story
          </CardTitle>
          <CardDescription className="text-purple-200">
            Enter a prompt and let AI weave your tale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-600 bg-red-900/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-purple-200">
              Story Prompt
            </Label>
            <Input
              id="prompt"
              type="text"
              placeholder="A brave knight enters a mysterious forest..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-slate-700 border-purple-600 text-white placeholder-purple-300"
              disabled={isGenerating}
            />
          </div>

          <Button
            onClick={handleStartStory}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" className="mr-2 h-4 w-4 " />
                Creating Your Story...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Start Story
              </>
            )}
          </Button>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-purple-300 hover:text-white"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryPage;
