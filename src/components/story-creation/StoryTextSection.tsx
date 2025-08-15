
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StoryTextSectionProps {
  text: string;
}

const StoryTextSection: React.FC<StoryTextSectionProps> = ({ text }) => {
  return (
    <div className="story-text-section w-full">
      <Card className="bg-slate-800/80 border-amber-500/20 shadow-inner">
        <CardContent className="p-8">
          <div className="prose prose-invert max-w-none">
            <div 
              className="font-['Cinzel'] text-lg text-gray-200 leading-relaxed whitespace-pre-wrap"
            >
              {text}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryTextSection;
