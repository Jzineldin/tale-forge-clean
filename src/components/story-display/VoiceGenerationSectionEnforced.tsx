import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, AlertCircle, RotateCcw, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTierEnforcement } from '@/hooks/useTierEnforcement';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthRequired } from '@/hooks/useAuthRequired';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';

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
  const { enforceVoiceGeneration, checkVoiceGenerationLimit } = useTierEnforcement();
  const { effectiveTier, usage, currentTierLimits } = useSubscription();
  
  const { checkAuthAndExecute, showAuthModal, setShowAuthModal } = useAuthRequired({
    feature: 'voice generation'
  });

  const generateVoice = async () => {
    checkAuthAndExecute(async () => {
      setIsGenerating(true);
      setError(null);

      try {
        // 🔒 TIER ENFORCEMENT: Check if user can generate voice
        const limitCheck = await checkVoiceGenerationLimit();
        if (!limitCheck.canProceed) {
          setError(limitCheck.reason || 'Voice generation limit reached');
          if (limitCheck.upgradeRequired) {
            toast.error(limitCheck.reason || 'Voice generation limit reached', {
              action: {
                label: 'Upgrade',
                onClick: () => window.location.href = '/pricing'
              }
            });
          }
          return;
        }

        // Proceed with voice generation
        const canGenerate = await enforceVoiceGeneration();
        if (!canGenerate) {
          setError('Voice generation limit reached for your current tier');
          return;
        }

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
          toast.success('Voice narration generated successfully!');
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

  // Calculate usage display
  const voiceLimit = currentTierLimits?.voice_generations_per_month || 0;
  const isUnlimited = voiceLimit === -1;
  const remaining = isUnlimited ? Infinity : Math.max(0, voiceLimit - usage.voice_generations);

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
        
        {/* Usage Display */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            {effectiveTier} Plan
          </span>
          <span className="text-amber-400">
            {isUnlimited 
              ? 'Unlimited voice generations' 
              : `${usage.voice_generations}/${voiceLimit} used this month`
            }
          </span>
        </div>
        
        {!isUnlimited && remaining <= 2 && remaining > 0 && (
          <div className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-3 mt-2">
            <p className="text-orange-300 text-sm">
              ⚠️ Only {remaining} voice generation{remaining !== 1 ? 's' : ''} remaining this month
            </p>
          </div>
        )}
        
        {!isUnlimited && remaining === 0 && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 mt-2">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <Lock className="h-4 w-4" />
              <span className="font-medium">Voice generation limit reached</span>
            </div>
            <p className="text-red-300 text-sm mb-3">
              You've used all {voiceLimit} voice generations for this month.
            </p>
            <Button
              onClick={() => window.location.href = '/pricing'}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-slate-900"
            >
              Upgrade Plan
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {isGenerating ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" className="h-12 w-12 text-amber-400 mx-auto mb-4" />
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
              disabled={isGenerating || (!isUnlimited && remaining === 0)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic className="mr-2 h-5 w-5" />
              {(!isUnlimited && remaining === 0) ? 'Upgrade to Generate Voice' : 'Generate Voice Narration'}
            </Button>
            
            {!isUnlimited && remaining > 0 && (
              <p className="text-gray-400 text-sm mt-2">
                {remaining} generation{remaining !== 1 ? 's' : ''} remaining this month
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Voice generation failed</span>
            </div>
            <p className="text-red-300 text-sm mb-3">{error}</p>
            {!error.includes('limit reached') && (
              <Button
                onClick={generateVoice}
                variant="outline"
                size="sm"
                className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                disabled={!isUnlimited && remaining === 0}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    
    {/* Authentication Required Modal */}
    <AuthRequiredModal
      open={showAuthModal}
      onOpenChange={setShowAuthModal}
      feature="voice generation"
    />
    </>
  );
};

export default VoiceGenerationSection;