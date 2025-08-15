import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  RotateCcw, 
  Flag, 
  Menu,
  X,
  Image,
  Play,
  Pause
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface StoryProgressControlsProps {
  gameState: 'not_started' | 'playing' | 'completed';
  currentSegment: any;
  storyHistory: any[];
  isLoading: boolean;
  isFinishingStory: boolean;
  isStoryCompleted: boolean;
  skipImage: boolean;
  onSkipImageChange: (skipImage: boolean) => void;
  onGoHome: () => void;
  onRestart: () => void;
  onSelectChoice: (choice: string) => void;
  onFinishStory: () => void;
  onPreviousSegment?: () => void;
  onNextSegment?: () => void;
}

const StoryProgressControls: React.FC<StoryProgressControlsProps> = ({
  gameState,
  currentSegment,
  storyHistory,
  isLoading,
  isFinishingStory,
  isStoryCompleted,
  skipImage,
  onSkipImageChange,
  onGoHome,
  onRestart,
  onSelectChoice,
  onFinishStory,
  onPreviousSegment,
  onNextSegment
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showEndStoryDialog, setShowEndStoryDialog] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  // Get choices from current segment
  const choices = currentSegment?.choices || [];
  const hasPrevious = storyHistory.length > 1;
  const hasNext = false; // For future implementation
  
  // Handle swipe gestures for mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.changedTouches[0].screenX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX.current = e.changedTouches[0].screenX;
      handleSwipeGesture();
    };
    
    const handleSwipeGesture = () => {
      const swipeThreshold = 50; // Minimum distance for a swipe
      const deltaX = touchEndX.current - touchStartX.current;
      
      // Swipe right - go to previous segment
      if (deltaX > swipeThreshold && hasPrevious && onPreviousSegment) {
        onPreviousSegment();
      }
      // Swipe left - go to next segment (if implemented)
      else if (deltaX < -swipeThreshold && hasNext && onNextSegment) {
        onNextSegment();
      }
    };
    
    // Add event listeners for touch events
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Cleanup event listeners
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [hasPrevious, hasNext, onPreviousSegment, onNextSegment]);
  
  // Mobile view - simplified controls
  const renderMobileView = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-amber-500/30 p-4 md:hidden z-40">
      <div className="flex items-center justify-between gap-2">
        {/* Left side - Navigation */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={onGoHome}
            className="p-3 border-amber-500/30 rounded-full h-12 w-12 flex items-center justify-center"
            aria-label="Go Home"
          >
            <Home className="h-5 w-5" />
          </Button>
          
          {hasPrevious && onPreviousSegment && (
            <Button
              size="sm"
              variant="outline"
              onClick={onPreviousSegment}
              className="p-3 border-amber-500/30 rounded-full h-12 w-12 flex items-center justify-center"
              disabled={isLoading}
              aria-label="Previous Segment"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {/* Center - Menu Toggle */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setMobileMenuOpen(true)}
          className="p-3 text-amber-300 rounded-full h-12 w-12 flex items-center justify-center"
          aria-label="Open Menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        {/* Right side - Actions */}
        <div className="flex gap-1">
          {currentSegment?.is_end && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRestart}
              className="p-3 border-amber-500/30 rounded-full h-12 w-12 flex items-center justify-center"
              aria-label="Restart Story"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          )}
          
          {!currentSegment?.is_end && (
            <AlertDialog open={showEndStoryDialog} onOpenChange={setShowEndStoryDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="p-3 border-orange-500/30 text-orange-300 rounded-full h-12 w-12 flex items-center justify-center"
                  disabled={isFinishingStory}
                  aria-label="End Story"
                >
                  <Flag className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End story here?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will conclude your adventure at the current moment. You can always start a new one afterward.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Going</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      setShowEndStoryDialog(false);
                      onFinishStory();
                    }} 
                    disabled={isFinishingStory}
                  >
                    End Story
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col">
          <div className="p-4 border-b border-amber-500/30 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-amber-300">Story Controls</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-amber-300"
              aria-label="Close Menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Image Toggle */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="mobile-skip-image"
                    checked={skipImage}
                    onChange={(e) => onSkipImageChange(e.target.checked)}
                    className="w-5 h-5 text-amber-500 bg-slate-700 border-amber-500/30 rounded focus:ring-amber-500/50 focus:ring-2"
                    aria-label="Skip image generation"
                  />
                  <label htmlFor="mobile-skip-image" className="flex items-center space-x-2 text-sm text-amber-200 cursor-pointer">
                    <Image className="h-5 w-5" />
                    <span>Skip image generation</span>
                  </label>
                </div>
              </CardContent>
            </Card>
            
            {/* Navigation Options */}
            <div className="space-y-3">
              <Button
                onClick={onGoHome}
                variant="outline"
                className="w-full justify-start border-amber-500/30 py-3 text-base"
              >
                <Home className="h-5 w-5 mr-3" />
                Return Home
              </Button>
              
              <Button
                onClick={onRestart}
                variant="outline"
                className="w-full justify-start border-amber-500/30 py-3 text-base"
              >
                <RotateCcw className="h-5 w-5 mr-3" />
                Start New Story
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Desktop view - full controls
  const renderDesktopView = () => (
    <div className="hidden md:flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
      <div className="flex items-center gap-3">
        <Button
          onClick={onGoHome}
          variant="outline"
          className="border-amber-500/30 py-2 px-4 text-base"
          aria-label="Go Home"
        >
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
        
        {hasPrevious && onPreviousSegment && (
          <Button
            onClick={onPreviousSegment}
            variant="outline"
            className="border-amber-500/30 py-2 px-4 text-base"
            disabled={isLoading}
            aria-label="Previous Segment"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-lg">
          <input
            type="checkbox"
            id="desktop-skip-image"
            checked={skipImage}
            onChange={(e) => onSkipImageChange(e.target.checked)}
            className="w-5 h-5 text-amber-500 bg-slate-700 border-amber-500/30 rounded focus:ring-amber-500/50 focus:ring-2"
            aria-label="Skip image generation"
          />
          <label htmlFor="desktop-skip-image" className="flex items-center space-x-2 text-base text-amber-200 cursor-pointer">
            <Image className="h-5 w-5" />
            <span>Skip image generation</span>
          </label>
        </div>
        
        {currentSegment?.is_end ? (
          <Button
            onClick={onRestart}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 py-2 px-4 text-base"
            aria-label="Start New Story"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Start New Story
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-orange-500/30 text-orange-300 py-2 px-4 text-base"
                disabled={isFinishingStory}
                aria-label="End Story"
              >
                <Flag className="h-4 w-4 mr-2" />
                End Story
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End story here?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will conclude your adventure at the current moment. You can always start a new one afterward.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Going</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={onFinishStory} 
                  disabled={isFinishingStory}
                >
                  End Story
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
  
  return (
    <>
      {renderDesktopView()}
      {renderMobileView()}
      
      {/* Choice Selection for Mobile */}
      {choices.length > 0 && !currentSegment?.is_end && (
        <div className="fixed bottom-20 left-0 right-0 md:hidden p-4 z-30">
          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex overflow-x-auto gap-2 pb-1">
                {choices.map((choice: string, index: number) => (
                  <Button
                    key={`mobile-choice-${index}`}
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectChoice(choice)}
                    className="flex-shrink-0 border-amber-500/30 text-xs py-2 px-3 h-10"
                    aria-label={`Choice ${index + 1}: ${choice.length > 20 ? `${choice.substring(0, 17)}...` : choice}`}
                  >
                    {choice.length > 20 ? `${choice.substring(0, 17)}...` : choice}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Mobile-specific help text */}
      <div className="md:hidden text-center text-xs text-amber-200/70 p-2 fixed bottom-32 left-0 right-0">
        <p>Swipe left/right to navigate between story segments</p>
      </div>
    </>
  );
};

export default StoryProgressControls;