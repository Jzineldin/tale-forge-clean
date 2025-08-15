
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Image, Volume2, Zap } from 'lucide-react';

interface CostControlSettingsProps {
  skipImage: boolean;
  skipAudio: boolean;
  onSkipImageChange: (value: boolean) => void;
  onSkipAudioChange: (value: boolean) => void;
  apiCallsCount: number;
  estimatedCost: string;
}

const CostControlSettings: React.FC<CostControlSettingsProps> = ({
  skipImage,
  skipAudio,
  onSkipImageChange,
  onSkipAudioChange,
  apiCallsCount,
  estimatedCost
}) => {
  return (
    <Card className="bg-slate-700/50 border-amber-600/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-amber-300 text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Cost Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-sm">Session API calls:</span>
          <Badge variant="outline" className="border-green-600 text-green-300">
            {apiCallsCount} calls
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-sm">Estimated cost:</span>
          <Badge variant="outline" className="border-amber-600 text-amber-300">
            {estimatedCost}
          </Badge>
        </div>
        
        <div className="space-y-3 pt-2 border-t border-slate-600">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="skip-image"
              checked={skipImage}
              onCheckedChange={onSkipImageChange}
            />
            <label htmlFor="skip-image" className="text-sm text-slate-300 flex items-center gap-2">
              <Image className="h-4 w-4" />
              Skip image generation
              <Badge variant="secondary" className="text-xs bg-green-900/50 text-green-300">
                Saves 1-2 credits
              </Badge>
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <Checkbox
              id="skip-audio"
              checked={skipAudio}
              onCheckedChange={onSkipAudioChange}
            />
            <label htmlFor="skip-audio" className="text-sm text-slate-300 flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Skip audio generation
              <Badge variant="secondary" className="text-xs bg-green-900/50 text-green-300">
                Saves 2-3 credits
              </Badge>
            </label>
          </div>
        </div>
        
        <div className="bg-amber-900/20 p-3 rounded text-xs text-amber-200">
          <Zap className="h-4 w-4 inline mr-1" />
          <strong>Economy Mode:</strong> Enable both options above for text-only stories at minimum cost.
        </div>
      </CardContent>
    </Card>
  );
};

export default CostControlSettings;
