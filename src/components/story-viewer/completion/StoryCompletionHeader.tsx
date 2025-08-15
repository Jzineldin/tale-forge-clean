
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Home } from 'lucide-react';

interface StoryCompletionHeaderProps {
  segmentCount: number;
  totalWords: number;
  imageCount: number;
  onExit?: () => void;
}

const StoryCompletionHeader: React.FC<StoryCompletionHeaderProps> = ({
  segmentCount,
  totalWords,
  imageCount,
  onExit
}) => {
  return (
    <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-slate-800/90 to-slate-900/80 backdrop-blur-sm">
      <CardHeader className="text-center relative">
        {/* Exit Button - Top Right */}
        {onExit && (
          <div className="absolute top-4 right-4">
            <Button
              onClick={onExit}
              variant="outline"
              className="bg-amber-600/80 hover:bg-amber-600 border-2 border-amber-400 hover:border-amber-300 text-white px-4 py-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Home className="h-4 w-4 mr-2" />
              Exit Story
            </Button>
          </div>
        )}
        
        <CardTitle className="text-3xl text-amber-200 flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8 text-amber-400" />
          🎉 Story Complete!
        </CardTitle>
        <p className="text-amber-300 text-lg mt-2">
          Your adventure concluded with <strong>{segmentCount} chapters</strong>, 
          <strong> {totalWords} words</strong>, and <strong>{imageCount} images</strong>
        </p>
      </CardHeader>
    </Card>
  );
};

export default StoryCompletionHeader;
