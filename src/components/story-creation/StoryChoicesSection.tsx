
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Image } from 'lucide-react';
import { useStoryChoices } from '@/hooks/useStoryChoices';

interface StoryChoicesSectionProps {
  segmentId: string;
  isGenerating: boolean;
  onChoiceSelect: (choice: string) => void;
  skipImage?: boolean;
  onSkipImageChange?: ((skipImage: boolean) => void) | undefined;
  fallbackChoices?: string[]; // Add fallback choices from database
  isHistorical?: boolean; // Disable choices for historical segments
  isCurrentSegment?: boolean; // Whether this is the current active segment
  selectedChoice?: string; // Which choice was already selected for this segment
  hasBeenContinued?: boolean; // Whether this segment has been continued
}

const StoryChoicesSection: React.FC<StoryChoicesSectionProps> = ({
  segmentId,
  isGenerating,
  onChoiceSelect,
  skipImage = false,
  onSkipImageChange,
  fallbackChoices = [],
  isHistorical = false,
  isCurrentSegment = true,
  selectedChoice,
  hasBeenContinued = false
}) => {
  const { getChoices, hasChoices } = useStoryChoices();
  
  // Get choices from durable store first, then fallback to database
  const durableChoices = getChoices(segmentId);
  const hasStoredChoices = hasChoices(segmentId);
  
  // Use durable store choices if available, otherwise use fallback from database
  const choices = hasStoredChoices ? durableChoices : fallbackChoices;
  
  console.log(`[StoryChoicesSection ${segmentId}] Component render:`, {
    segmentId,
    durableChoices,
    fallbackChoices,
    hasStoredChoices,
    finalChoices: choices,
    isGenerating,
    choicesLength: choices.length,
    willRender: choices?.length > 0
  });

  // Don't show choices for historical segments or segments that have been continued
  if (isHistorical || !isCurrentSegment || hasBeenContinued) {
    return (
      <div className="space-y-4">
        <div className="glass-card p-4 text-center">
          <p className="text-amber-300 text-sm">
            {hasBeenContinued 
              ? `You chose: "${selectedChoice}". This chapter has already been continued.`
              : "This is a previous chapter. Navigate to the latest chapter to continue the story."
            }
          </p>
        </div>
      </div>
    );
  }

  // PATCH: Always render choices if any exist upstream - remove early return on image loading
  if (!choices?.length) {
    console.warn(`[StoryChoicesSection ${segmentId}] No choices available to display - returning null`);
    return null;
  }

  // Show loading state only if generating and no choices available
  if (isGenerating && choices.length === 0) {
    console.log(`[StoryChoicesSection ${segmentId}] Showing loading state - generating with no choices`);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-2 text-amber-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400"></div>
          <span className="text-sm">Generating story choices...</span>
        </div>
      </div>
    );
  }

  console.log(`[StoryChoicesSection ${segmentId}] Rendering ${choices.length} choices:`, choices);

  return (
    <div className="space-y-4">
      {/* Choice Buttons */}
      <div className="grid gap-3">
        {choices.map((choice, index) => {
          const isSelected = selectedChoice === choice;
          return (
            <Button
              key={`${segmentId}-choice-${index}`}
              onClick={() => onChoiceSelect(choice)}
              disabled={isSelected}
              className={`btn-primary w-full text-left group ${isSelected ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <span className={`font-bold mr-3 ${isSelected ? 'text-emerald-300' : 'text-amber-300'}`}>
                {isSelected ? '✓' : `${index + 1}.`}
              </span>
              <span className="flex-1 text-left">
                {choice}
              </span>
              {!isSelected && (
                <ArrowRight className="h-4 w-4 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Image Toggle */}
      {onSkipImageChange && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="skip-image"
                checked={skipImage}
                onChange={(e) => onSkipImageChange(e.target.checked)}
                className="w-4 h-4 text-amber-500 bg-slate-700 border-amber-500/30 rounded focus:ring-amber-500/50 focus:ring-2"
              />
              <label htmlFor="skip-image" className="flex items-center space-x-2 text-sm text-amber-200 cursor-pointer">
                <Image className="h-4 w-4" />
                <span>Skip image generation for next segment</span>
              </label>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StoryChoicesSection;
