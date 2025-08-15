import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Play } from 'lucide-react';

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  labels?: Record<string, string>;
  high_quality_base_model_ids?: string[];
}

const ElevenLabsVoicesExplorer: React.FC = () => {
  const [voices] = useState<Voice[]>([]);
  const [isLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">ElevenLabs Voice Explorer</h2>
          <p className="text-slate-400">Explore and test available voices</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      ) : (
        <div className="grid gap-4">
          {voices.length === 0 ? (
            <Alert>
              <AlertDescription>
                No voices loaded. This is a placeholder component.
              </AlertDescription>
            </Alert>
          ) : (
            voices.map((voice) => (
              <Card key={voice.voice_id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">{voice.name}</CardTitle>
                  <CardDescription>{voice.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{voice.category}</Badge>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ElevenLabsVoicesExplorer;