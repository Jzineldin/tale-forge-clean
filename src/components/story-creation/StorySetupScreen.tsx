
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, DollarSign, BookOpen, Settings } from 'lucide-react';
import { CheckedState } from '@radix-ui/react-checkbox';

interface StorySetupScreenProps {
  prompt: string;
  storyMode: string;
  skipImage: boolean;
  apiCallsCount: number;
  onSkipImageChange: (checked: CheckedState) => void;
  onStartStory: () => void;
  onGoHome: () => void;
}

const StorySetupScreen: React.FC<StorySetupScreenProps> = ({
  prompt,
  storyMode,
  skipImage,
  apiCallsCount,
  onSkipImageChange,
  onStartStory,
  onGoHome
}) => {
  console.log('🖥️ StorySetupScreen: Rendering with props:', {
    prompt: prompt?.substring(0, 50) + '...',
    storyMode,
    skipImage,
    apiCallsCount
  });

  const canStartStory = prompt && prompt.trim().length > 0 && storyMode;

  const handleStartClick = () => {
    console.log('🔘 Generate Opening Scene button clicked!');
    console.log('📋 Button click details:', {
      canStartStory,
      prompt: prompt?.substring(0, 50) + '...',
      storyMode,
      skipImage
    });
    
    if (!canStartStory) {
      console.error('❌ Cannot start story - missing requirements');
      return;
    }
    
    console.log('✅ Calling onStartStory...');
    onStartStory();
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      {/* Magical background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-amber-300 rounded-full shadow-lg shadow-amber-300/50 animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full shadow-lg shadow-purple-300/50 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-3/4 w-2.5 h-2.5 bg-blue-300 rounded-full shadow-lg shadow-blue-300/50 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/8 right-1/3 w-1 h-1 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50 animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <Card className="w-full max-w-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-2 border-amber-500/40 backdrop-blur-sm shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-amber-400/60 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <CardTitle className="text-3xl font-bold text-amber-300 drop-shadow-lg" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
              Ready to Create Your Story
            </CardTitle>
            <div className="w-3 h-3 bg-amber-400/60 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mx-auto rounded-full shadow-lg shadow-amber-500/30"></div>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge variant="outline" className="text-purple-300 border-purple-600 bg-purple-900/30 px-4 py-2 text-sm font-medium">
              <BookOpen className="h-4 w-4 mr-2" />
              {storyMode}
            </Badge>
            <Badge variant="outline" className="text-emerald-300 border-emerald-600 bg-emerald-900/30 px-4 py-2 text-sm font-medium">
              <DollarSign className="h-3 w-3 mr-1" />
              {apiCallsCount} API calls used
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Story prompt display */}
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-6 rounded-xl border border-amber-500/30 shadow-inner">
            <h3 className="text-amber-300 font-semibold mb-3 flex items-center gap-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              Your Story Prompt:
            </h3>
            <p className="text-amber-100 text-lg leading-relaxed" style={{ fontFamily: 'Lora, serif' }}>
              {prompt}
            </p>
          </div>
          
          {/* Cost control section */}
          <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/20 border-2 border-amber-500/50 p-6 rounded-xl backdrop-blur-sm">
            <h4 className="text-amber-300 font-semibold mb-3 flex items-center gap-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              <Settings className="h-5 w-5" />
              Magical Enhancement Settings
            </h4>
            <p className="text-amber-200 text-sm mb-4 leading-relaxed">
              Each story segment includes AI-crafted text and optional visual enchantments. You control when magic happens.
            </p>
            <div className="flex items-center space-x-3 bg-amber-900/30 p-4 rounded-lg">
              <Checkbox
                id="skip-image"
                checked={skipImage}
                onCheckedChange={onSkipImageChange}
                className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
              <label htmlFor="skip-image" className="text-amber-200 cursor-pointer flex-1 text-sm">
                Skip image generation for now (saves 1-2 credits per segment - you can add images later)
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleStartClick}
              className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canStartStory}
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
              Begin the Magical Journey
            </Button>
            
            {!canStartStory && (
              <p className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg border border-red-600/30">
                {!prompt ? 'No story prompt provided' : !storyMode ? 'No story mode selected' : 'Missing required information'}
              </p>
            )}
            
            <Button
              onClick={onGoHome}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700/50 py-3"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorySetupScreen;
