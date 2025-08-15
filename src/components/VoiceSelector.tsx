import React, { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Volume2, Play, CheckCircle, Crown, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Voice,
  ESSENTIAL_VOICES as STORYTELLER_VOICES
} from '@/lib/voices-optimized';
import { VoiceGenerationLimitChecker } from '@/components/pricing/UsageLimitChecker';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthRequired } from '@/hooks/useAuthRequired';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  disabled?: boolean;
  showPremiumVoices?: boolean;
}

// Categorize voices by tier
const categorizeVoices = (voices: Voice[]) => {
  const freeVoices = voices.slice(0, 3); // First 3 voices are free
  const premiumVoices = voices.slice(3, 8); // Next 5 voices are premium
  const proVoices = voices.slice(8); // Remaining voices are pro
  
  return { freeVoices, premiumVoices, proVoices };
};

// Export voices for backwards compatibility (with id field for compatibility)
const voices = STORYTELLER_VOICES.map(voice => ({
  id: voice.id,
  name: voice.name
}));

const VoiceSelectorInner: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onVoiceChange
}) => {
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const { isPremium, isPro, effectiveTier, canGenerateVoice } = useSubscription();
  
  const { checkAuthAndExecute, showAuthModal, setShowAuthModal } = useAuthRequired({
    feature: 'voice preview'
  });

  // Categorize voices by subscription tier
  const { freeVoices, premiumVoices, proVoices } = categorizeVoices(STORYTELLER_VOICES);

  const handleVoiceChange = (voiceId: string) => {
    console.log('🎵 Voice selected:', voiceId);
    onVoiceChange(voiceId);
  };

  const handleVoicePreview = async (voice: Voice) => {
    if (previewingVoice === voice.id) return;
    
    checkAuthAndExecute(async () => {
      // Check if user can generate voice
      if (!canGenerateVoice) {
        toast.error('Voice generation limit reached. Upgrade to continue.');
        return;
      }
      
      setPreviewingVoice(voice.id);
      
      try {
        const { data, error } = await supabase.functions.invoke('test-voice', {
          body: {
            voiceId: voice.id,
            text: `Hello! I'm ${voice.name}. ${voice.description}`
          }
        });
        
        if (error) throw error;
        
        // Create audio element and play the preview from base64
        const audio = new Audio(`data:audio/mpeg;base64,${data?.audioContent}`);
        audio.onended = () => {
          setPreviewingVoice(null);
        };
        audio.play();
        
      } catch (error) {
        console.error('Failed to preview voice:', error);
        toast.error('Failed to preview voice');
        setPreviewingVoice(null);
      }
    });
  };

  const renderVoiceCard = (voice: Voice, tier: 'free' | 'premium' | 'pro', isLocked: boolean) => (
    <div
      key={voice.id}
      className={`p-4 border rounded-lg transition-all relative ${
        selectedVoice === voice.id
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
          : isLocked 
            ? 'border-gray-200 bg-gray-50 opacity-60'
            : 'border-gray-300 hover:border-gray-400 cursor-pointer'
      }`}
      onClick={() => !isLocked && handleVoiceChange(voice.id)}
    >
      {/* Tier Badge */}
      <div className="absolute top-2 right-2">
        {tier === 'premium' && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs">
            <Crown className="w-2 h-2 mr-1" />
            Core
          </Badge>
        )}
        {tier === 'pro' && (
          <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 text-xs">
            <Crown className="w-2 h-2 mr-1" />
            Pro
          </Badge>
        )}
        {tier === 'free' && (
          <Badge variant="secondary" className="text-xs">
            Free
          </Badge>
        )}
      </div>

      <div className="flex justify-between items-start">
        <div className="flex-1 pr-8">
          <div className="flex items-center gap-2 mb-1">
            <p className={`font-bold ${isLocked ? 'text-gray-500' : 'text-gray-800'}`}>
              {voice.name}
              {isLocked && <Lock className="w-3 h-3 ml-1 inline" />}
            </p>
            <Badge variant="secondary" className="text-xs">
              {voice.gender}
            </Badge>
            {voice.accent && (
              <Badge variant="outline" className="text-xs">
                {voice.accent}
              </Badge>
            )}
          </div>
          <p className={`text-sm ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
            {voice.description}
          </p>
          {isLocked && (
            <p className="text-xs text-amber-600 mt-1">
              {tier === 'premium' ? 'Core subscription required' : 'Pro subscription required'}
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            if (!isLocked) {
              handleVoicePreview(voice);
            } else {
              toast.info(`${voice.name} requires ${tier === 'premium' ? 'Core' : 'Pro'} subscription`);
            }
          }}
          disabled={previewingVoice === voice.id || isLocked}
          className="ml-2"
        >
          {previewingVoice === voice.id ? (
            <LoadingSpinner size="sm" className="h-4 w-4" />
          ) : (
            <Play className={`h-4 w-4 ${isLocked ? 'text-gray-400' : ''}`} />
          )}
        </Button>
      </div>
    </div>
  );

  // Wrap the entire selector in voice generation limit check
  return (
    <>
      <VoiceGenerationLimitChecker>
        <div className="space-y-4">
          <div className="grid gap-3">
            {/* Free Voices */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                Free Voices
                <Badge variant="secondary" className="ml-2 text-xs">
                  {freeVoices.length} voices
                </Badge>
              </h4>
              {freeVoices.map((voice) => renderVoiceCard(voice, 'free', false))}
            </div>

            {/* Premium Voices */}
            {premiumVoices.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <Crown className="w-4 h-4 mr-1 text-yellow-500" />
                  Core Voices
                  <Badge className="ml-2 text-xs bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
                    {premiumVoices.length} voices
                  </Badge>
                </h4>
                {premiumVoices.map((voice) => renderVoiceCard(voice, 'premium', !isPremium && !isPro))}
              </div>
            )}

            {/* Pro Voices */}
            {proVoices.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <Crown className="w-4 h-4 mr-1 text-purple-500" />
                  Professional Voices
                  <Badge className="ml-2 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
                    {proVoices.length} voices
                  </Badge>
                </h4>
                {proVoices.map((voice) => renderVoiceCard(voice, 'pro', !isPro))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t">
            <CheckCircle className="h-4 w-4" />
            <span>
              {effectiveTier === 'Free' && `${freeVoices.length} free voices available`}
              {(effectiveTier === 'Premium' || effectiveTier === 'Core') && `${freeVoices.length + premiumVoices.length} voices available`}
              {effectiveTier === 'Pro' && `${freeVoices.length + premiumVoices.length + proVoices.length} voices available (unlimited)`}
            </span>
          </div>

          {/* Upgrade Prompt for Free Users */}
          {effectiveTier === 'Free' && (premiumVoices.length > 0 || proVoices.length > 0) && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Unlock {premiumVoices.length + proVoices.length} Core & Pro Voices
                  </p>
                  <p className="text-xs text-yellow-600">
                    Get access to professional-quality voices for your stories
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => window.location.href = '/pricing'}
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Upgrade
                </Button>
              </div>
            </div>
          )}
        </div>
      </VoiceGenerationLimitChecker>
      
      {/* Authentication Required Modal */}
      <AuthRequiredModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        feature="voice preview"
      />
    </>
  );
};

// Simple selector for compact UI with tier restrictions
const SimpleVoiceSelector: React.FC<VoiceSelectorProps> = ({ 
  selectedVoice, 
  onVoiceChange, 
  disabled = false 
}) => {
  const { isPremium, isPro } = useSubscription();
  const { freeVoices, premiumVoices, proVoices } = categorizeVoices(STORYTELLER_VOICES);
  
  // Filter available voices based on subscription
  const availableVoices = [
    ...freeVoices,
    ...(isPremium || isPro ? premiumVoices : []),
    ...(isPro ? proVoices : [])
  ];

  return (
    <Select value={selectedVoice} onValueChange={onVoiceChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a voice" />
      </SelectTrigger>
      <SelectContent>
        {availableVoices.map((voice) => (
          <SelectItem key={voice.id} value={voice.id}>
            <div className="flex items-center gap-2">
              <Volume2 className="h-3 w-3" />
              {voice.name}
              {freeVoices.includes(voice) ? (
                <Badge variant="secondary" className="text-xs ml-1">Free</Badge>
              ) : premiumVoices.includes(voice) ? (
                <Badge className="text-xs ml-1 bg-yellow-500 text-white">Core</Badge>
              ) : (
                <Badge className="text-xs ml-1 bg-purple-500 text-white">Pro</Badge>
              )}
            </div>
          </SelectItem>
        ))}
        
        {/* Show locked voices as disabled options */}
        {(!isPremium && !isPro) && premiumVoices.map((voice) => (
          <SelectItem key={`locked-${voice.id}`} value="" disabled>
            <div className="flex items-center gap-2 opacity-50">
              <Lock className="h-3 w-3" />
              {voice.name}
              <Badge className="text-xs ml-1 bg-yellow-500 text-white">Core</Badge>
            </div>
          </SelectItem>
        ))}
        
        {!isPro && proVoices.map((voice) => (
          <SelectItem key={`locked-${voice.id}`} value="" disabled>
            <div className="flex items-center gap-2 opacity-50">
              <Lock className="h-3 w-3" />
              {voice.name}
              <Badge className="text-xs ml-1 bg-purple-500 text-white">Pro</Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Main export component
const VoiceSelector: React.FC<VoiceSelectorProps> = (props) => {
  return <VoiceSelectorInner {...props} />;
};

export { VoiceSelector, SimpleVoiceSelector, voices };