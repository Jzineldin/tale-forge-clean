import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  completed?: boolean;
  current?: boolean;
  href?: string;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep?: number;
  className?: string;
  variant?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  showDescriptions?: boolean;
}

/**
 * Progress Indicator Component
 * Shows user progress through multi-step flows
 * WCAG 2.1 AA Compliance: Success Criterion 2.4.8 (Location), 3.3.2 (Labels or Instructions)
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep = 0,
  className,
  variant = 'horizontal',
  showLabels = true,
  showDescriptions = false
}) => {
  const isHorizontal = variant === 'horizontal';

  return (
    <nav
      aria-label="Progress through story creation"
      className={cn(
        "progress-indicator",
        isHorizontal ? "flex items-center justify-center" : "flex flex-col space-y-4",
        className
      )}
    >
      <ol
        className={cn(
          "flex",
          isHorizontal ? "items-center space-x-4" : "flex-col space-y-4"
        )}
        role="list"
      >
        {steps.map((step, index) => {
          const isCompleted = step.completed || index < currentStep;
          const isCurrent = step.current || index === currentStep;
          const isUpcoming = index > currentStep && !step.completed;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center",
                !isHorizontal && "w-full"
              )}
            >
              {/* Step Circle */}
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  isCompleted && "bg-amber-400 border-amber-400 text-slate-900",
                  isCurrent && "border-amber-400 bg-slate-900 text-amber-400 ring-4 ring-amber-400/20",
                  isUpcoming && "border-slate-600 bg-slate-800 text-slate-400"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Circle
                    className={cn(
                      "w-5 h-5",
                      isCurrent ? "fill-current" : "fill-none"
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Step Content */}
              {showLabels && (
                <div
                  className={cn(
                    "ml-4 flex-1",
                    isHorizontal && "text-center ml-0 mt-2 absolute top-12 left-1/2 transform -translate-x-1/2 w-24"
                  )}
                >
                  <div
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      isCompleted && "text-amber-400",
                      isCurrent && "text-amber-400",
                      isUpcoming && "text-slate-400"
                    )}
                  >
                    {step.label}
                  </div>
                  
                  {showDescriptions && step.description && (
                    <div
                      className={cn(
                        "text-xs mt-1 transition-colors duration-300",
                        isCompleted && "text-amber-300/80",
                        isCurrent && "text-amber-300/80",
                        isUpcoming && "text-slate-500"
                      )}
                    >
                      {step.description}
                    </div>
                  )}
                </div>
              )}

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "transition-colors duration-300",
                    isHorizontal ? "w-16 h-0.5 mx-4" : "w-0.5 h-8 ml-5 mt-2",
                    isCompleted ? "bg-amber-400" : "bg-slate-600"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Screen Reader Progress Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.label}
        {steps[currentStep]?.description && ` - ${steps[currentStep].description}`}
      </div>
    </nav>
  );
};

/**
 * Story Creation Progress Hook
 * Provides progress steps for the story creation flow
 */
export const useStoryCreationProgress = (currentPath: string) => {
  const steps: ProgressStep[] = [
    {
      id: 'age',
      label: 'Choose Age',
      description: 'Select your age group',
      href: '/create/age'
    },
    {
      id: 'genre',
      label: 'Select Genre',
      description: 'Pick your story type',
      href: '/create/genre'
    },
    {
      id: 'prompt',
      label: 'Story Seed',
      description: 'Create your story idea',
      href: '/create/prompt'
    }
  ];

  // Determine current step based on path
  let currentStep = 0;
  if (currentPath.includes('/genre')) currentStep = 1;
  else if (currentPath.includes('/prompt')) currentStep = 2;
  else if (currentPath.includes('/story/')) currentStep = 3;

  // Mark completed steps
  const updatedSteps = steps.map((step, index) => ({
    ...step,
    completed: index < currentStep,
    current: index === currentStep
  }));

  return {
    steps: updatedSteps,
    currentStep,
    totalSteps: steps.length
  };
};

/**
 * Compact Progress Bar Component
 * Minimal progress indicator for tight spaces
 */
interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showText?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  className,
  showText = true
}) => {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className={cn("progress-bar", className)}>
      {showText && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gold-metallic">
            Progress
          </span>
          <span className="text-sm text-gold-metallic/80">
            {current} of {total}
          </span>
        </div>
      )}
      
      <div
        className="w-full bg-slate-700 rounded-full h-2 overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Progress: ${current} of ${total} steps completed`}
      >
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="sr-only" aria-live="polite">
        {current} of {total} steps completed
      </div>
    </div>
  );
};

export default ProgressIndicator;