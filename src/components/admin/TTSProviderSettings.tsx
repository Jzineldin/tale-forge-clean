
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Volume2, RefreshCw, Loader2 } from 'lucide-react';

import { toast } from 'sonner';
import { ESSENTIAL_VOICES as STORYTELLER_VOICES } from '@/lib/voices-optimized';

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
}

interface TTSProviderSettings {
  primary: string;
  voice: string;
  speed: number;
}

interface TTSProviderSettingsProps {
  settings: TTSProviderSettings;
  onUpdate: (field: string, value: any) => void;
}

const TTSProviderSettings: React.FC<TTSProviderSettingsProps> = ({ settings, onUpdate }) => {
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);

  const fetchAvailableVoices = async () => {
    setLoadingVoices(true);
    try {
      // Use static voice list instead of API call
      const staticVoices = STORYTELLER_VOICES.map(voice => ({
        voice_id: voice.id,
        name: voice.name,
        category: 'premade',
        description: voice.description
      }));
      
      setAvailableVoices(staticVoices);
      toast.success(`Loaded ${staticVoices.length} available voices`);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to load voices');
    } finally {
      setLoadingVoices(false);
    }
  };

  useEffect(() => {
    fetchAvailableVoices();
  }, []);

  return (
    <Card className="bg-slate-800 border-purple-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Text-to-Speech Providers
        </CardTitle>
        <CardDescription className="text-purple-200">
          Configure TTS settings and voice options
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
                <SelectItem value="elevenlabs">ElevenLabs TTS</SelectItem>
                <SelectItem value="openai">OpenAI TTS (Legacy)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-white">Voice</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchAvailableVoices}
                disabled={loadingVoices}
                className="h-6 px-2 text-xs"
              >
                {loadingVoices ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Refresh
              </Button>
            </div>
            <Select
              value={settings.voice}
              onValueChange={(value) => onUpdate('voice', value)}
            >
              <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                <SelectValue placeholder={loadingVoices ? "Loading voices..." : "Select a voice"} />
              </SelectTrigger>
              <SelectContent>
                {loadingVoices ? (
                  <SelectItem value="" disabled>Loading voices...</SelectItem>
                ) : availableVoices.length > 0 ? (
                  availableVoices.map((voice) => (
                    <SelectItem key={voice.voice_id} value={voice.voice_id}>
                      {voice.name} ({voice.category})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>No voices available</SelectItem>
                )}
              </SelectContent>
            </Select>
            {availableVoices.length === 0 && !loadingVoices && (
              <p className="text-sm text-red-400 mt-1">
                No voices found. Check your ElevenLabs API key and account status.
              </p>
            )}
          </div>
        </div>

        <div>
          <Label className="text-white">Speech Speed</Label>
          <Input
            type="number"
            step="0.1"
            min="0.25"
            max="4.0"
            value={settings.speed}
            onChange={(e) => onUpdate('speed', parseFloat(e.target.value) || 1.0)}
            className="bg-slate-700 border-purple-600 text-white"
          />
          <p className="text-sm text-purple-200 mt-1">
            Speed range: 0.25x to 4.0x (1.0 = normal speed)
          </p>
        </div>

        {availableVoices.length > 0 && (
          <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-purple-200">
              <strong>Available Voices:</strong> {availableVoices.length} voices loaded from your ElevenLabs account
            </p>
            <p className="text-xs text-purple-300 mt-1">
              Categories: {Array.from(new Set(availableVoices.map(v => v.category))).join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TTSProviderSettings;
