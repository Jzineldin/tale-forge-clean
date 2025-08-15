
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthRequired } from '@/hooks/useAuthRequired';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';

interface SimpleStoryInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onStart: () => void;
  isLoading: boolean;
  storyMode: string;
}

const SimpleStoryInput: React.FC<SimpleStoryInputProps> = ({
  prompt,
  onPromptChange,
  onStart,
  isLoading,
  storyMode
}) => {
  const { checkAuthAndExecute, showAuthModal, setShowAuthModal } = useAuthRequired({
    feature: 'story creation'
  });

  const handleStart = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a story prompt");
      return;
    }
    checkAuthAndExecute(() => {
      onStart();
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h3 className="text-3xl md:text-4xl font-bold text-white font-serif">
          Create Your Story
        </h3>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto font-sans">
          Describe your story idea and watch it unfold as an interactive {storyMode.toLowerCase()} adventure
        </p>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <Textarea
            placeholder="A mysterious letter arrives at your door on a stormy night, bearing a seal you've never seen before..."
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="min-h-[140px] text-lg p-6 bg-black/30 border-white/20 text-white placeholder:text-gray-400 placeholder:text-lg focus:border-amber-400 focus:ring-amber-400/20 backdrop-blur-sm resize-none rounded-2xl font-sans"
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleStart}
          disabled={isLoading || !prompt.trim()}
          className="w-full py-6 text-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 rounded-2xl shadow-lg hover:shadow-xl transition-all font-sans"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Crafting your {storyMode.toLowerCase()}...
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5" />
              Begin My {storyMode} Adventure
            </div>
          )}
        </Button>
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

export default SimpleStoryInput;
