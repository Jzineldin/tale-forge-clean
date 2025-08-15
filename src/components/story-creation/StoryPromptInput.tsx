import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, BookOpen, Lightbulb, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StoryPromptInputProps {
  initialPrompt?: string;
  initialMode?: string;
  onPromptChange?: (prompt: string) => void;
  onModeChange?: (mode: string) => void;
}

const StoryPromptInput: React.FC<StoryPromptInputProps> = ({
  initialPrompt = '',
  initialMode = '',
  onPromptChange,
  onModeChange
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [mode, setMode] = useState(initialMode);
  const [showGuidance, setShowGuidance] = useState(false);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    onPromptChange?.(newPrompt);
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    onModeChange?.(newMode);
  };

  const MODE_OPTIONS = [
    { value: 'adventure', label: 'Adventure', description: 'Exciting journeys and quests' },
    { value: 'mystery', label: 'Mystery', description: 'Puzzles and detective work' },
    { value: 'fantasy', label: 'Fantasy', description: 'Magic and mythical creatures' },
    { value: 'sci-fi', label: 'Sci-Fi', description: 'Futuristic technology and space' },
    { value: 'horror', label: 'Horror', description: 'Spooky and thrilling tales' },
    { value: 'comedy', label: 'Comedy', description: 'Funny and lighthearted stories' },
    { value: 'romance', label: 'Romance', description: 'Love stories and relationships' },
    { value: 'historical', label: 'Historical', description: 'Stories set in the past' }
  ];

  // Example prompts for guidance
  const EXAMPLE_PROMPTS = [
    "A brave knight searching for a magical artifact in a mysterious forest",
    "A detective solving a mystery in a haunted mansion",
    "A space explorer discovering a new planet with alien life",
    "A young wizard learning magic at a hidden school",
    "A time traveler visiting ancient Egypt"
  ];

  return (
    <div className="space-y-4">
      {/* Guidance Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="story-prompt" className="text-amber-300 font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Your Story Idea
          </Label>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowGuidance(!showGuidance)}
            className="p-1 h-6 w-6 text-amber-400 hover:text-amber-300"
            aria-label={showGuidance ? "Hide guidance" : "Show guidance"}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-xs text-amber-200/70">{prompt.length}/500</span>
      </div>

      {/* Guidance Panel */}
      {showGuidance && (
        <div className="bg-slate-800/50 border border-amber-500/30 rounded-lg p-3 mb-3 transition-all duration-300">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-amber-300 font-medium text-sm mb-1">Story Idea Tips</h4>
              <p className="text-amber-100 text-xs mb-2">
                Describe your main character, their goal, and the world they're in. The more details you provide, 
                the better your story will be!
              </p>
              <p className="text-amber-200 text-xs font-medium mb-1">Example prompts:</p>
              <ul className="text-amber-100 text-xs list-disc pl-4 space-y-1">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <li key={index}>{example}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Story Prompt Input */}
      <div className="space-y-2">
        <Textarea
          id="story-prompt"
          value={prompt}
          onChange={handlePromptChange}
          placeholder="Describe your story idea... For example: 'A brave knight searching for a magical artifact in a mysterious forest'"
          className="w-full min-h-[120px] bg-slate-800/50 border-amber-500/30 text-amber-100 placeholder:text-amber-300/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
          maxLength={500}
          aria-describedby="prompt-help"
        />
      </div>

      {/* Story Mode Selection */}
      <div className="space-y-2">
        <Label htmlFor="story-mode" className="text-amber-300 font-semibold flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Story Style
        </Label>
        <Select onValueChange={handleModeChange} value={mode}>
          <SelectTrigger 
            id="story-mode" 
            className="bg-slate-800/50 border-amber-500/30 text-amber-100 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300 w-full"
          >
            <SelectValue placeholder="Choose a story style..." />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-amber-500/30 max-h-60 overflow-y-auto">
            {MODE_OPTIONS.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="focus:bg-amber-500/20 focus:text-amber-100"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-amber-200/70">{option.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile-specific help text */}
      <div className="md:hidden text-center text-xs text-amber-200/70 mt-2">
        <p>Tip: Use the info icon (ℹ️) above for story idea suggestions</p>
      </div>
    </div>
  );
};

export default StoryPromptInput;