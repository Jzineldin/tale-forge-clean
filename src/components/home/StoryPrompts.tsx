
import React from 'react';
import { Button } from '@/components/ui/button';
import { getPromptsForStoryMode } from '@/data/storyPrompts';
import { Lightbulb, Sparkles, Star } from 'lucide-react';

interface StoryPromptsProps {
  storyMode: string;
  onPromptSelect: (prompt: string) => void;
  isLoading: boolean;
}

const StoryPrompts: React.FC<StoryPromptsProps> = ({ storyMode, onPromptSelect, isLoading }) => {
  const prompts = getPromptsForStoryMode(storyMode);

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-8">
          <div className="flex items-center justify-center gap-6">
            <Lightbulb className="h-12 w-12 text-amber-400 animate-pulse" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl font-heading">
              Need Inspiration?
            </h2>
            <Sparkles className="h-12 w-12 text-purple-400 animate-pulse" />
          </div>
          
          <div className="w-32 h-1 bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 mx-auto rounded-full shadow-lg"></div>
          
          <div className="space-y-4">
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-100 font-body font-medium leading-relaxed">
              Spark your creativity with these captivating prompts
            </p>
            <p className="text-lg md:text-xl text-amber-300 font-semibold font-body">
              Crafted specifically for <span className="text-purple-300">{storyMode}</span> adventures
            </p>
          </div>
        </div>

        {/* Prompts Grid - Fixed container and text wrapping */}
        <div className="grid grid-cols-1 gap-6">
          {prompts.map((prompt: string, index: number) => (
            <Button
              key={index}
              variant="outline"
              className="btn-ghost group h-auto p-6 text-left disabled:opacity-50"
              onClick={() => onPromptSelect(prompt)}
              disabled={isLoading}
            >
              <div className="w-full flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-400/60 to-purple-400/60 rounded-full flex items-center justify-center group-hover:from-amber-400/80 group-hover:to-purple-400/80 transition-all duration-300 shadow-lg mt-1">
                  <Star className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-white text-lg font-medium leading-relaxed group-hover:text-amber-100 transition-colors font-body break-words">
                    {prompt}
                  </p>
                </div>
                <div className="flex-shrink-0 self-center">
                  <div className="text-amber-400/70 text-sm font-body group-hover:text-amber-300 transition-colors whitespace-nowrap">
                    Click to use →
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center pt-8">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-amber-400/30 to-purple-400/30 border-2 border-amber-400/60 rounded-full backdrop-blur-md shadow-2xl">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span className="text-amber-300 text-lg font-semibold font-body">
              Choose any prompt to begin your adventure
            </span>
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryPrompts;
