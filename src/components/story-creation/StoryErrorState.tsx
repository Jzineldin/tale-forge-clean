
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import StoryDisplayLayout from '@/components/story-display/StoryDisplayLayout';

interface StoryErrorStateProps {
  error: string;
  onRetry: () => void;
  onExit: () => void;
}

const StoryErrorState: React.FC<StoryErrorStateProps> = ({
  error,
  onRetry,
  onExit
}) => {
  return (
    <StoryDisplayLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl bg-slate-900/95 border-red-500/30">
          <CardHeader className="text-center">
            <CardTitle className="text-red-300 text-2xl">Story Generation Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-300">{error}</p>
            <div className="space-x-4">
              <Button onClick={onRetry} variant="outline">
                Try Again
              </Button>
              <Button onClick={onExit} variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Exit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StoryDisplayLayout>
  );
};

export default StoryErrorState;
