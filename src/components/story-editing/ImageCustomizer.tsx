import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RotateCcw, Palette, Camera, Sun, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthRequired } from '@/hooks/useAuthRequired';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';

interface ImageCustomizationProps {
  imageUrl: string;
  segmentId: string;
  onRegenerate: (segmentId: string, customizations: ImageCustomizations) => Promise<void>;
  className?: string;
}

interface ImageCustomizations {
  style: string;
  mood: string;
  lighting: string;
  colorPalette: string;
  composition: string;
  detail: number;
}

const STYLE_OPTIONS = [
  { value: 'realistic', label: 'Realistic', description: 'Photo-realistic imagery' },
  { value: 'cartoon', label: 'Cartoon', description: 'Animated cartoon style' },
  { value: 'watercolor', label: 'Watercolor', description: 'Soft watercolor painting' },
  { value: 'oil-painting', label: 'Oil Painting', description: 'Classic oil painting style' },
  { value: 'digital-art', label: 'Digital Art', description: 'Modern digital illustration' },
  { value: 'sketch', label: 'Sketch', description: 'Hand-drawn sketch style' },
  { value: 'fantasy', label: 'Fantasy Art', description: 'Magical fantasy illustration' }
];

const MOOD_OPTIONS = [
  { value: 'cheerful', label: 'Cheerful', description: 'Happy and uplifting' },
  { value: 'mysterious', label: 'Mysterious', description: 'Enigmatic and intriguing' },
  { value: 'adventurous', label: 'Adventurous', description: 'Exciting and bold' },
  { value: 'peaceful', label: 'Peaceful', description: 'Calm and serene' },
  { value: 'magical', label: 'Magical', description: 'Enchanted and whimsical' },
  { value: 'dramatic', label: 'Dramatic', description: 'Intense and powerful' }
];

const LIGHTING_OPTIONS = [
  { value: 'natural', label: 'Natural', description: 'Natural daylight' },
  { value: 'golden-hour', label: 'Golden Hour', description: 'Warm sunset lighting' },
  { value: 'moonlight', label: 'Moonlight', description: 'Soft moonlit scene' },
  { value: 'dramatic', label: 'Dramatic', description: 'High contrast lighting' },
  { value: 'soft', label: 'Soft', description: 'Gentle diffused light' },
  { value: 'magical', label: 'Magical', description: 'Glowing magical light' }
];

const COLOR_PALETTE_OPTIONS = [
  { value: 'vibrant', label: 'Vibrant', description: 'Bright, bold colors' },
  { value: 'pastel', label: 'Pastel', description: 'Soft, muted colors' },
  { value: 'monochrome', label: 'Monochrome', description: 'Single color scheme' },
  { value: 'earth-tones', label: 'Earth Tones', description: 'Natural brown/green palette' },
  { value: 'cool-blues', label: 'Cool Blues', description: 'Blue and teal palette' },
  { value: 'warm-sunset', label: 'Warm Sunset', description: 'Orange and red palette' }
];

const COMPOSITION_OPTIONS = [
  { value: 'close-up', label: 'Close-up', description: 'Focus on characters/details' },
  { value: 'wide-shot', label: 'Wide Shot', description: 'Show full scene' },
  { value: 'bird-eye', label: 'Bird\'s Eye', description: 'View from above' },
  { value: 'low-angle', label: 'Low Angle', description: 'Looking up at subjects' },
  { value: 'centered', label: 'Centered', description: 'Balanced composition' },
  { value: 'dynamic', label: 'Dynamic', description: 'Action-oriented framing' }
];

export const ImageCustomizer: React.FC<ImageCustomizationProps> = ({
  imageUrl,
  segmentId,
  onRegenerate,
  className = ""
}) => {
  const [customizations, setCustomizations] = useState<ImageCustomizations>({
    style: 'realistic',
    mood: 'cheerful',
    lighting: 'natural',
    colorPalette: 'vibrant',
    composition: 'centered',
    detail: 50
  });

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  
  const { checkAuthAndExecute, showAuthModal, setShowAuthModal } = useAuthRequired({
    feature: 'image customization'
  });

  const handleCustomizationChange = (key: keyof ImageCustomizations, value: string | number) => {
    setCustomizations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRegenerate = async () => {
    checkAuthAndExecute(async () => {
      setIsRegenerating(true);
      try {
        await onRegenerate(segmentId, customizations);
        toast.success('Image regenerated with new style!');
        setShowCustomizer(false);
      } catch (error) {
        console.error('Failed to regenerate image:', error);
        toast.error('Failed to regenerate image');
      } finally {
        setIsRegenerating(false);
      }
    });
  };

  const resetCustomizations = () => {
    setCustomizations({
      style: 'realistic',
      mood: 'cheerful',
      lighting: 'natural',
      colorPalette: 'vibrant',
      composition: 'centered',
      detail: 50
    });
    toast.info('Customizations reset to defaults');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Display */}
      <div className="relative group">
        <img
          src={imageUrl}
          alt="Story scene"
          className="w-full rounded-lg shadow-md"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
          <Button
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
          >
            <Palette className="w-4 h-4 mr-2" />
            Customize Image
          </Button>
        </div>
      </div>

      {/* Image Customizer Panel */}
      {showCustomizer && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                Image Customizer
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetCustomizations}
                className="text-gray-500 hover:text-gray-700"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Art Style */}
            <div className="space-y-2">
              <Label className="flex items-center text-sm font-medium">
                <Palette className="w-4 h-4 mr-2" />
                Art Style
              </Label>
              <Select
                value={customizations.style}
                onValueChange={(value) => handleCustomizationChange('style', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mood */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Mood & Atmosphere</Label>
              <Select
                value={customizations.mood}
                onValueChange={(value) => handleCustomizationChange('mood', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lighting */}
              <div className="space-y-2">
                <Label className="flex items-center text-sm font-medium">
                  <Sun className="w-4 h-4 mr-2" />
                  Lighting
                </Label>
                <Select
                  value={customizations.lighting}
                  onValueChange={(value) => handleCustomizationChange('lighting', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LIGHTING_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Palette */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Color Palette</Label>
                <Select
                  value={customizations.colorPalette}
                  onValueChange={(value) => handleCustomizationChange('colorPalette', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_PALETTE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Composition */}
            <div className="space-y-2">
              <Label className="flex items-center text-sm font-medium">
                <Camera className="w-4 h-4 mr-2" />
                Composition
              </Label>
              <Select
                value={customizations.composition}
                onValueChange={(value) => handleCustomizationChange('composition', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPOSITION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Detail Level */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Detail Level: {customizations.detail}%
              </Label>
              <Slider
                value={[customizations.detail]}
                onValueChange={(value) => handleCustomizationChange('detail', value[0])}
                min={10}
                max={100}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Simple</span>
                <span>Highly Detailed</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button
                onClick={() => setShowCustomizer(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isRegenerating ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {isRegenerating ? 'Regenerating...' : 'Apply Changes'}
              </Button>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium mb-1">💡 Customization Tips:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Experiment with different art styles to find your preferred look</li>
                <li>• Mood settings affect the overall feeling of the image</li>
                <li>• Higher detail levels create more intricate images but take longer</li>
                <li>• Try different compositions for variety in your story</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Authentication Required Modal */}
      <AuthRequiredModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        feature="image customization"
      />
    </div>
  );
};