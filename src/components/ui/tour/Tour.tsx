import React, { useState, useEffect, useRef } from 'react';
import Portal from '@/components/ui/portal/Portal';
import { Button } from '@/components/ui/button';

interface TourStep {
  selector: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface TourProps {
  steps: TourStep[];
  isOpen: boolean;
  onRequestClose: () => void;
}

const Tour: React.FC<TourProps> = ({ steps, isOpen, onRequestClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tourRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Keep hooks unconditional; we guard rendering at the bottom
  const shouldRender = isOpen && steps.length > 0;

  const current = steps[currentStep];
  const canGoNext = currentStep < steps.length - 1;
  const canGoPrev = currentStep > 0;

  const goToNext = () => {
    if (canGoNext) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrev = () => {
    if (canGoPrev) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishTour = () => {
    onRequestClose();
  };

  // Handle keyboard events for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onRequestClose();
      } else if (e.key === 'ArrowRight' && canGoNext) {
        goToNext();
      } else if (e.key === 'ArrowLeft' && canGoPrev) {
        goToPrev();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus the first focusable element when tour opens
      if (firstFocusableRef.current) {
        firstFocusableRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentStep, canGoNext, canGoPrev, onRequestClose]);

  // Find the target element using the selector and calculate position
  useEffect(() => {
    if (!shouldRender) return;

    const updatePosition = () => {
      const targetElement = current ? document.querySelector(current.selector) : null;
      targetRef.current = targetElement as HTMLElement;
      
      if (targetElement && tourRef.current) {
        const targetRect = targetElement.getBoundingClientRect();
        const tourRect = tourRef.current.getBoundingClientRect();
        
        let top = 0;
        let left = 0;
        
        switch (current.position) {
          case 'top':
            top = targetRect.top - tourRect.height - 10;
            left = targetRect.left + (targetRect.width / 2) - (tourRect.width / 2);
            break;
          case 'bottom':
            top = targetRect.bottom + 10;
            left = targetRect.left + (targetRect.width / 2) - (tourRect.width / 2);
            break;
          case 'left':
            top = targetRect.top + (targetRect.height / 2) - (tourRect.height / 2);
            left = targetRect.left - tourRect.width - 10;
            break;
          case 'right':
            top = targetRect.top + (targetRect.height / 2) - (tourRect.height / 2);
            left = targetRect.right + 10;
            break;
          default:
            // Default to bottom positioning
            top = targetRect.bottom + 10;
            left = targetRect.left + (targetRect.width / 2) - (tourRect.width / 2);
        }
        
        // Ensure tour stays within viewport
        if (left < 10) left = 10;
        if (top < 10) top = 10;
        if (left + tourRect.width > window.innerWidth - 10) {
          left = window.innerWidth - tourRect.width - 10;
        }
        if (top + tourRect.height > window.innerHeight - 10) {
          top = window.innerHeight - tourRect.height - 10;
        }
        
        setPosition({ top, left });
      }
    };

    // Update position immediately and on window resize
    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    // Highlight target element
    if (targetRef.current) {
      targetRef.current.style.boxShadow = '0 0 0 2px #f59e0b, 0 0 10px #f59e0b';
      targetRef.current.style.zIndex = '1000';
      targetRef.current.style.position = 'relative';
    }
    
    // Clean up highlight on unmount
    return () => {
      window.removeEventListener('resize', updatePosition);
      if (targetRef.current) {
        targetRef.current.style.boxShadow = '';
        targetRef.current.style.zIndex = '';
        targetRef.current.style.position = '';
      }
    };
  }, [currentStep, current, shouldRender]);

  if (!shouldRender) return null;

  return (
    <Portal>
      <div
        ref={tourRef}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        className="fixed z-50 p-4 rounded-2xl bg-amber-900/90 border-2 border-amber-500/30 shadow-2xl transition-all duration-300"
        role="dialog"
        aria-labelledby="tour-title"
        aria-describedby="tour-content"
        aria-modal="true"
      >
        <div id="tour-content" className="text-amber-100 text-sm mb-3">{current?.content}</div>
        <div className="flex justify-between text-amber-300 text-xs">
          <div>
            {canGoPrev && (
              <Button
                ref={firstFocusableRef}
                size="sm"
                variant="outline"
                onClick={goToPrev}
                className="mr-2"
                aria-label="Previous step"
              >
                Back
              </Button>
            )}
          </div>
          <div className="text-amber-200 text-xs" aria-live="polite">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div>
            {canGoNext ? (
              <Button
                size="sm"
                onClick={goToNext}
                aria-label="Next step"
              >
                Next
              </Button>
            ) : (
              <Button
                size="sm"
                variant="default"
                onClick={finishTour}
                aria-label="Finish tour"
              >
                Finish
              </Button>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Tour;