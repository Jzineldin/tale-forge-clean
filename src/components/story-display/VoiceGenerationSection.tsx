
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, AlertCircle, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRequired } from '@/hooks/useAuthRequired';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
interface VoiceGenerationSectionProps {
  storySegments: Array<{
    segment_text: string;
    triggering_choice_text?: string;
  }>;
  storyId: string;
  onAudioGenerated: (audioUrl: string) => void;
}

const VoiceGenerationSection: React.FC<VoiceGenerationSectionProps> = ({
  storySegments,
  storyId,
  onAudioGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { checkAuthAndExecute, showAuthModal, setShowAuthModal } = useAuthRequired({
    feature: 'voice narration'
  });

  const generateVoice = async () => {
    checkAuthAndExecute(async () => {
      setIsGenerating(true);
      setError(null);

      try {
        // Combine all story text
        const fullStoryText = storySegments
          .map(segment => segment.segment_text)
          .join('\n\n');

        const { data, error } = await supabase.functions.invoke('generate-full-story-audio', {
          body: {
            text: fullStoryText,
            storyId: storyId,
            voiceId: 'fable' // Default storyteller voice
          }
        });

        if (error) throw error;

        if (data?.audioUrl) {
          onAudioGenerated(data.audioUrl);
        } else {
          throw new Error('No audio URL returned');
        }

      } catch (error) {
        console.error('Voice generation error:', error);
        setError(error instanceof Error ? error.message : 'Voice generation failed');
      } finally {
        setIsGenerating(false);
      }
    });
  };

  return (
    <>
    <Card className="bg-slate-800/80 border-amber-500/20 mb-6">
      <CardHeader>
        <CardTitle className="text-amber-300 flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Add Voice Narration to Your Story
        </CardTitle>
        <p className="text-gray-300 text-sm">
          Transform your story into an immersive audio experience
        </p>
      </CardHeader>
      
      <CardContent>
        {isGenerating ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" className="h-12 w-12  text-amber-400 mx-auto mb-4" />
            <p className="text-amber-300 text-lg mb-2">Generating voice narration...</p>
            <p className="text-gray-400 text-sm">This may take 1-2 minutes</p>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-4">
              <div className="bg-amber-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Button
              onClick={generateVoice}
              disabled={isGenerating}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8 py-3 text-lg"
            >
              <Mic className="mr-2 h-5 w-5" />
              Generate Voice Narration
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Voice generation failed</span>
            </div>
            <p className="text-red-300 text-sm mb-3">{error}</p>
            <Button
              onClick={generateVoice}
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-300 hover:bg-red-500/20"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    
    {/* Authentication Required Modal */}
    <AuthRequiredModal
      open={showAuthModal}
      onOpenChange={setShowAuthModal}
      feature="voice narration"
    />
    </>
  );
};

export default VoiceGenerationSection;
