
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import { useAuthRequired } from '@/hooks/useAuthRequired';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';

interface StoryInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onStart: () => void;
  isLoading: boolean;
  storyMode: string;
}

const StoryInput: React.FC<StoryInputProps> = ({
  prompt,
  onPromptChange,
  onStart,
  isLoading,
  storyMode
}) => {
  const { checkAuthAndExecute, showAuthModal, setShowAuthModal } = useAuthRequired({
    feature: 'story creation'
  });

  const handleStartClick = () => {
    checkAuthAndExecute(() => {
      onStart();
    });
  };
  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-3">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-300 via-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-lg">
          Begin Your Tale
        </h3>
        <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
          Describe your story idea, and watch as it unfolds with {storyMode.toLowerCase()} magic
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="relative">
          <Textarea
            placeholder="A mysterious letter arrives at your door on a stormy night..."
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="min-h-32 text-base sm:text-lg p-4 sm:p-6 bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-amber-400 focus:ring-amber-400/20 backdrop-blur-sm resize-none overflow-hidden"
            disabled={isLoading}
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}
          />
          <div className="absolute top-4 right-4 opacity-30">
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={handleStartClick}
            disabled={isLoading || !prompt.trim()}
            className="cta-btn relative overflow-hidden border-0 text-white font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 transition-all duration-[250ms] ease-out hover:scale-[1.03] disabled:hover:scale-100 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Weaving your tale...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Sparkles className="h-5 w-5" />
                Forge My Story
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {/* Authentication Required Modal */}
      <AuthRequiredModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        feature="story creation"
      />
    </div>
  );
};

export default StoryInput;
