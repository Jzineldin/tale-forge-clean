
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap } from 'lucide-react';

interface HuggingFaceProviderSettings {
  model: string;
  steps: number;
  guidance_scale: number;
  width: number;
  height: number;
}

interface HuggingFaceProviderSettingsProps {
  settings: HuggingFaceProviderSettings;
  onUpdate: (field: string, value: any) => void;
}

const HuggingFaceProviderSettings: React.FC<HuggingFaceProviderSettingsProps> = ({ settings, onUpdate }) => {
  return (
    <Card className="bg-slate-800 border-purple-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Hugging Face Settings
        </CardTitle>
        <CardDescription className="text-purple-200">
          Configure Hugging Face FLUX.1-schnell model settings (Free tier available)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-white">Model</Label>
          <Select
            value={settings.model}
            onValueChange={(value) => onUpdate('model', value)}
          >
            <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="black-forest-labs/FLUX.1-schnell">FLUX.1-schnell (Fast & Free)</SelectItem>
              <SelectItem value="black-forest-labs/FLUX.1-dev">FLUX.1-dev (Higher Quality)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Inference Steps</Label>
            <Input
              type="number"
              value={settings.steps}
              onChange={(e) => onUpdate('steps', parseInt(e.target.value) || 4)}
              className="bg-slate-700 border-purple-600 text-white"
              min="1"
              max="20"
            />
          </div>
          <div>
            <Label className="text-white">Guidance Scale</Label>
            <Input
              type="number"
              step="0.1"
              value={settings.guidance_scale}
              onChange={(e) => onUpdate('guidance_scale', parseFloat(e.target.value) || 0.0)}
              className="bg-slate-700 border-purple-600 text-white"
              min="0"
              max="10"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Width</Label>
            <Select
              value={settings.width.toString()}
              onValueChange={(value) => onUpdate('width', parseInt(value))}
            >
              <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="512">512px</SelectItem>
                <SelectItem value="768">768px</SelectItem>
                <SelectItem value="1024">1024px</SelectItem>
                <SelectItem value="1536">1536px</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white">Height</Label>
            <Select
              value={settings.height.toString()}
              onValueChange={(value) => onUpdate('height', parseInt(value))}
            >
              <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="512">512px</SelectItem>
                <SelectItem value="768">768px</SelectItem>
                <SelectItem value="1024">1024px</SelectItem>
                <SelectItem value="1536">1536px</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HuggingFaceProviderSettings;
