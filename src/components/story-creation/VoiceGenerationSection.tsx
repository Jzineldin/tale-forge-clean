
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import { VoiceSelector } from '@/components/VoiceSelector';

interface VoiceGenerationSectionProps {
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  onGenerateAudio: () => void;
  isGenerating: boolean;
}

const VoiceGenerationSection: React.FC<VoiceGenerationSectionProps> = ({
  selectedVoice,
  onVoiceChange,
  onGenerateAudio,
  isGenerating
}) => {
  return (
    <div className="voice-generation-section w-full pt-6 border-t border-amber-500/20">
      <Card className="bg-slate-800/80 border-amber-500/20">
        <CardHeader className="text-center">
          <CardTitle className="text-amber-300 text-xl flex items-center justify-center gap-2">
            <Mic className="h-5 w-5" />
            Generate Voice Narration
          </CardTitle>
          <p className="text-gray-300 text-sm">
            Transform your complete story into an immersive audio experience
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <VoiceSelector
            selectedVoice={selectedVoice}
            onVoiceChange={onVoiceChange}
            disabled={isGenerating}
          />
          <Button
            onClick={onGenerateAudio}
            disabled={isGenerating}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-3 text-lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900 mr-2"></div>
                Generating Audio...
              </>
            ) : (
              <>
                <Mic className="mr-2 h-5 w-5" />
                Generate Voice Narration
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceGenerationSection;
