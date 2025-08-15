
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Image, Settings } from 'lucide-react';

interface StoryImageSettingsProps {
  skipImage: boolean;
  onSkipImageChange: (checked: boolean) => void;
}

const StoryImageSettings: React.FC<StoryImageSettingsProps> = ({
  skipImage,
  onSkipImageChange
}) => {
  return (
    <Card className="w-full max-w-2xl mx-auto bg-slate-800/90 border-amber-500/30 backdrop-blur-sm shadow-lg mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-amber-300 text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Story Generation Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image className="h-5 w-5 text-amber-400" />
            <div>
              <label className="text-white font-medium">Generate Images</label>
              <p className="text-gray-400 text-sm">Create AI-generated images for each story segment</p>
            </div>
          </div>
          <Switch
            checked={!skipImage}
            onCheckedChange={(checked) => onSkipImageChange(!checked)}
            className="data-[state=checked]:bg-amber-500"
          />
        </div>
        <div className="mt-3 p-3 bg-slate-700/50 rounded-md">
          <p className="text-gray-300 text-sm">
            {skipImage 
              ? "💡 Images disabled - faster generation, lower cost" 
              : "🎨 Images enabled - enhanced story experience with visuals"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryImageSettings;
