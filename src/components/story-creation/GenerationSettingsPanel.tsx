import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Image, Volume2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface GenerationSettingsPanelProps {
  skipImage: boolean;
  skipAudio: boolean;
  onSkipImageChange: (checked: boolean) => void;
  onSkipAudioChange: (checked: boolean) => void;
  apiUsageCount: number;
  showAudioOption?: boolean;
  onGenerate: () => void;
  isGenerating?: boolean;
  pendingAction?: 'start' | 'choice' | 'audio' | null;
}

export const GenerationSettingsPanel: React.FC<GenerationSettingsPanelProps> = ({
  skipImage,
  skipAudio,
  onSkipImageChange,
  onSkipAudioChange,
  apiUsageCount,
  showAudioOption = false,
  onGenerate,
  isGenerating = false,
  pendingAction = null
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getEstimatedCost = () => {
    if (pendingAction === 'audio') {
      return '0.015'; // Audio generation cost
    }
    let baseCost = 0.02; // Text generation
    if (!skipImage) baseCost += 0.04; // Image generation
    if (showAudioOption && !skipAudio) baseCost += 0.015; // Audio generation (only if audio option is shown)
    return baseCost.toFixed(3);
  };

  const getActionText = () => {
    switch (pendingAction) {
      case 'start': return 'Start Story';
      case 'choice': return 'Continue Story';
      case 'audio': return 'Generate Audio';
      default: return 'Generate';
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-600 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-400 text-lg">
            <Coins className="h-5 w-5" />
            Generation Settings
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Cost Summary - Always Visible */}
        <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">Estimated Cost:</span>
            <Badge variant="secondary" className="bg-amber-500/20 text-amber-300">
              ~${getEstimatedCost()}
            </Badge>
          </div>
          <div className="text-xs text-gray-400">
            {apiUsageCount} calls made
          </div>
        </div>

        {/* Expandable Settings */}
        {isExpanded && (
          <div className="space-y-4 pt-2 border-t border-slate-600">
            {/* Generation Options */}
            {pendingAction !== 'audio' && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="skip-image-panel"
                    checked={skipImage}
                    onCheckedChange={onSkipImageChange}
                  />
                  <label htmlFor="skip-image-panel" className="text-sm flex items-center gap-2 text-gray-300">
                    <Image className="h-4 w-4" />
                    Skip image generation
                    <Badge variant="secondary" className="text-xs bg-green-900/50 text-green-300">
                      Save ~$0.04
                    </Badge>
                  </label>
                </div>

                {showAudioOption && (
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="skip-audio-panel"
                      checked={skipAudio}
                      onCheckedChange={onSkipAudioChange}
                    />
                    <label htmlFor="skip-audio-panel" className="text-sm flex items-center gap-2 text-gray-300">
                      <Volume2 className="h-4 w-4" />
                      Skip audio generation
                      <Badge variant="secondary" className="text-xs bg-green-900/50 text-green-300">
                        Save ~$0.015
                      </Badge>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Tips */}
            <div className="bg-amber-900/20 p-3 rounded text-xs text-amber-200">
              <Sparkles className="h-4 w-4 inline mr-1" />
              <strong>Tip:</strong> You can continue your story anytime. Only generate when you're ready to continue.
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="btn-primary w-full"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating...' : getActionText()}
        </Button>
      </CardContent>
    </Card>
  );
}; 