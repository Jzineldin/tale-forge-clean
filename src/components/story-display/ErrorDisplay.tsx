
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
  onExit: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onExit
}) => {
  return (
    <div 
      className="min-h-screen bg-slate-900 flex items-center justify-center p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Card className="w-full max-w-2xl bg-slate-800/90 border-red-500/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-red-400 flex items-center justify-center gap-2">
            <AlertCircle className="h-6 w-6" />
            Story Generation Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-gray-300">
            {typeof error === 'string' ? error : 'Something went wrong while creating your story. Please try again.'}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={onRetry} className="fantasy-heading bg-purple-600 hover:bg-purple-700 text-white">
              Try Again
            </Button>
            <Button onClick={onExit} variant="outline" className="fantasy-heading border-gray-600 text-gray-300">
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorDisplay;
