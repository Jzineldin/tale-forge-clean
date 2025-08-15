
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flag, Loader2, Image } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface StoryEndSectionProps {
  isEnd: boolean;
  isGenerating: boolean;
  onFinishStory: (skipImage?: boolean) => void;
  onExit: () => void;
}

const StoryEndSection: React.FC<StoryEndSectionProps> = ({
  isEnd,
  isGenerating,
  onFinishStory,
  onExit
}) => {
  const [skipImage, setSkipImage] = useState(false);

  if (isEnd) {
    return (
      <div className="story-end-section text-center space-y-6 py-8">
        <div className="text-center">
          <p className="text-amber-300 text-2xl font-serif mb-6">🎉 The End 🎉</p>
          <p className="text-gray-300 text-lg mb-8">Your adventure has reached its conclusion!</p>
          <Button
            onClick={onExit}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8 py-3 text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Start New Adventure
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="end-story-section w-full pt-6 border-t border-amber-500/20 space-y-4">
      <div className="flex items-center space-x-2 justify-center">
        <Checkbox
          id="skip-ending-image"
          checked={skipImage}
          onCheckedChange={(checked) => setSkipImage(checked as boolean)}
        />
        <label htmlFor="skip-ending-image" className="text-sm text-slate-300 flex items-center gap-1">
          <Image className="h-4 w-4" />
          Skip image for story ending (faster generation)
        </label>
      </div>
      
      <Button
        onClick={() => onFinishStory(skipImage)}
        disabled={isGenerating}
        variant="outline"
                    className="w-full border-brand-indigo/50 text-indigo-300 hover:bg-brand-indigo/20 hover:border-indigo-400 transition-all duration-300 py-3 text-lg font-medium bg-slate-800/60 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            Generating Story Ending...
          </>
        ) : (
          <>
            <Flag className="mr-3 h-5 w-5" />
            End Story Here {skipImage ? '(No Image)' : '(With Image)'}
          </>
        )}
      </Button>
    </div>
  );
};

export default StoryEndSection;
