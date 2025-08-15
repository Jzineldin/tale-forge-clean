
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image } from 'lucide-react';

interface ImageProviderSettings {
  primary: string;
  fallback: string;
  huggingFaceSettings: {
    model: string;
    steps: number;
    guidance_scale: number;
    width: number;
    height: number;
  };
  stableDiffusionSettings: {
    steps: number;
    dimensions: string;
  };
  dalleSettings: {
    model: string;
    quality: string;
    size: string;
  };
  replicateSettings: {
    model: string;
    steps: number;
    aspect_ratio: string;
    output_format: string;
  };
  ovhSettings: {
    model: string;
    negative_prompt: string;
  };
}

interface ImageProviderSettingsProps {
  settings: ImageProviderSettings;
  onUpdate: (field: string, value: any) => void;
}

const ImageProviderSettings: React.FC<ImageProviderSettingsProps> = ({ settings, onUpdate }) => {
  return (
    <Card className="bg-slate-800 border-purple-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Image className="h-5 w-5" />
          Image Generation Providers
        </CardTitle>
        <CardDescription className="text-purple-200">
          Configure AI models for image generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-white">Primary Provider</Label>
            <Select
              value={settings.primary}
              onValueChange={(value) => onUpdate('primary', value)}
            >
              <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ovh">OVHcloud (SDXL)</SelectItem>
                <SelectItem value="openai">DALL-E</SelectItem>
                <SelectItem value="replicate">Replicate</SelectItem>
                <SelectItem value="hugging-face">Hugging Face</SelectItem>
                <SelectItem value="stable-diffusion">Stable Diffusion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white">Fallback Provider</Label>
            <Select
              value={settings.fallback}
              onValueChange={(value) => onUpdate('fallback', value)}
            >
              <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ovh">OVHcloud (SDXL)</SelectItem>
                <SelectItem value="openai">DALL-E</SelectItem>
                <SelectItem value="hugging-face">Hugging Face</SelectItem>
                <SelectItem value="replicate">Replicate</SelectItem>
                <SelectItem value="stable-diffusion">Stable Diffusion</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Replicate Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Model</Label>
              <Select
                value={settings.replicateSettings.model}
                onValueChange={(value) => onUpdate('replicateSettings', {
                  ...settings.replicateSettings,
                  model: value
                })}
              >
                <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flux-schnell">FLUX.1-schnell (Fast & Free)</SelectItem>
                  <SelectItem value="sdxl">Stable Diffusion XL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Output Format</Label>
              <Select
                value={settings.replicateSettings.output_format}
                onValueChange={(value) => onUpdate('replicateSettings', {
                  ...settings.replicateSettings,
                  output_format: value
                })}
              >
                <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webp">WebP (Recommended)</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Hugging Face Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Model</Label>
              <Select
                value={settings.huggingFaceSettings.model}
                onValueChange={(value) => onUpdate('huggingFaceSettings', {
                  ...settings.huggingFaceSettings,
                  model: value
                })}
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
            <div>
              <Label className="text-white">Steps</Label>
              <Input
                type="number"
                value={settings.huggingFaceSettings.steps}
                onChange={(e) => onUpdate('huggingFaceSettings', {
                  ...settings.huggingFaceSettings,
                  steps: parseInt(e.target.value) || 4
                })}
                className="bg-slate-700 border-purple-600 text-white"
                min="1"
                max="20"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Stable Diffusion Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Steps</Label>
              <Input
                type="number"
                value={settings.stableDiffusionSettings.steps}
                onChange={(e) => onUpdate('stableDiffusionSettings', {
                  ...settings.stableDiffusionSettings,
                  steps: parseInt(e.target.value) || 20
                })}
                className="bg-slate-700 border-purple-600 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Dimensions</Label>
              <Select
                value={settings.stableDiffusionSettings.dimensions}
                onValueChange={(value) => onUpdate('stableDiffusionSettings', {
                  ...settings.stableDiffusionSettings,
                  dimensions: value
                })}
              >
                <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="512x512">512x512</SelectItem>
                  <SelectItem value="1024x1024">1024x1024</SelectItem>
                  <SelectItem value="1536x1024">1536x1024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">DALL-E Settings</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Model</Label>
              <Select
                value={settings.dalleSettings.model}
                onValueChange={(value) => onUpdate('dalleSettings', {
                  ...settings.dalleSettings,
                  model: value
                })}
              >
                <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                  <SelectItem value="dall-e-2">DALL-E 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Quality</Label>
              <Select
                value={settings.dalleSettings.quality}
                onValueChange={(value) => onUpdate('dalleSettings', {
                  ...settings.dalleSettings,
                  quality: value
                })}
              >
                <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="hd">HD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Size</Label>
              <Select
                value={settings.dalleSettings.size}
                onValueChange={(value) => onUpdate('dalleSettings', {
                  ...settings.dalleSettings,
                  size: value
                })}
              >
                <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024x1024">1024x1024</SelectItem>
                  <SelectItem value="1792x1024">1792x1024</SelectItem>
                  <SelectItem value="1024x1792">1024x1792</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">OVHcloud Settings</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="text-white">Model</Label>
              <Select
                value={settings.ovhSettings?.model || 'sdxl'}
                onValueChange={(value) => onUpdate('ovhSettings', {
                  ...settings.ovhSettings,
                  model: value
                })}
              >
                <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sdxl">Stable Diffusion XL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-white">Negative Prompt</Label>
            <Input
              value={settings.ovhSettings?.negative_prompt || 'Ugly, blurry, low quality'}
              onChange={(e) => onUpdate('ovhSettings', {
                ...settings.ovhSettings,
                negative_prompt: e.target.value
              })}
              className="bg-slate-700 border-purple-600 text-white"
              placeholder="Describe what to avoid in images"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageProviderSettings;
