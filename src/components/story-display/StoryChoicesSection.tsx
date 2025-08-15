
import React from 'react';

interface StoryChoicesSectionProps {
  choices: string[];
  isGenerating: boolean;
  onChoiceSelect: (choice: string, skipImage?: boolean) => void;
  skipImage?: boolean;
  onSkipImageChange?: ((skipImage: boolean) => void) | undefined;
  selectedChoice?: string | undefined; // Which choice was already selected for this segment
  hasBeenContinued?: boolean | undefined; // Whether this segment has been continued
}

const StoryChoicesSection: React.FC<StoryChoicesSectionProps> = ({
  choices,
  isGenerating,
  onChoiceSelect,
  skipImage = false,
  onSkipImageChange,
  selectedChoice,
  hasBeenContinued = false
}) => {
  // Don't show choices for segments that have been continued
  if (hasBeenContinued) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-4">
        <div className="text-center">
          <p className="text-amber-300 text-sm">
            You chose: "{selectedChoice}". This chapter has already been continued.
          </p>
        </div>
      </div>
    );
  }

  if (!choices || choices.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/40 border border-yellow-500/10 rounded-xl p-6">
      <div className="text-center mb-4">
        <h3 className="font-['Cinzel'] text-xl font-bold text-yellow-300 mb-2 flex items-center justify-center gap-2">
          <span className="text-xl">✨</span>
          WHAT HAPPENS NEXT? ✨
        </h3>
        <p className="fantasy-subtitle text-slate-400 text-sm">
          Choose your path and continue the adventure
        </p>
      </div>
      
      <div className="space-y-2">
        {choices.map((choice, index) => {
          const isSelected = selectedChoice === choice;
          return (
            <div key={index} className="space-y-2">
              <button
                onClick={() => onChoiceSelect(choice, skipImage)}
                disabled={isGenerating || isSelected}
                className={`
                  w-full p-4 bg-slate-800/50 hover:bg-slate-800 border border-yellow-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center
                  ${isSelected ? 'bg-green-800/20 border-green-400/50 text-green-200 cursor-not-allowed' : ''}
                `}
              >
                <span className={`
                  font-medium mr-3 transition-colors duration-300
                  ${isSelected ? 'text-green-400' : 'text-yellow-400'}
                `}>
                  {isSelected ? '✓' : `${index + 1}.`}
                </span>
                <span className="flex-1 text-left font-medium text-slate-100">
                  {choice}
                </span>
              </button>
            </div>
          );
        })}
        
        {/* Single image generation toggle for all choices */}
        {onSkipImageChange && (
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-yellow-500/10">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={skipImage}
                onChange={(e) => onSkipImageChange(e.target.checked)}
                className="h-4 w-4 rounded bg-slate-700 border-slate-500 text-yellow-500 focus:ring-yellow-500"
              />
              <span className="fantasy-subtitle">Skip image generation for next segment</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryChoicesSection;
