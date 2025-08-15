
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

interface StoryCreationErrorStateProps {
  message: string;
  onRetry?: () => void;
  onGoHome: () => void;
}

const StoryCreationErrorState: React.FC<StoryCreationErrorStateProps> = ({
  message,
  onRetry,
  onGoHome
}) => {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="text-center text-white space-y-4">
        <p className="mb-4">{message}</p>
        <div className="flex gap-4 justify-center">
          {onRetry && (
            <Button onClick={onRetry} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded">
              Try Again
            </Button>
          )}
          <Button onClick={onGoHome} variant="outline" className="px-4 py-2 rounded">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoryCreationErrorState;
