
import React from 'react';
import { StorySegmentRow } from '@/types/stories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FullStoryTextProps {
    segments: StorySegmentRow[];
}

const FullStoryText: React.FC<FullStoryTextProps> = ({ segments }) => {
    if (!segments || segments.length === 0) {
        return null;
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Full Story Text</CardTitle>
                <p className="text-sm text-muted-foreground">The complete story being read aloud</p>
            </CardHeader>
            <CardContent className="space-y-4">
                {segments.map((segment, index) => (
                    <div key={segment.id} className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                            Chapter {index + 1}
                        </div>
                        <div className="font-['Cinzel'] text-lg text-gray-200 leading-relaxed">
                            {segment.segment_text}
                        </div>
                        {segment.triggering_choice_text && index > 0 && (
                            <div className="text-sm italic text-muted-foreground border-l-2 border-primary/20 pl-3">
                                Choice made: "{segment.triggering_choice_text}"
                            </div>
                        )}
                        {index < segments.length - 1 && (
                            <hr className="my-4 border-border/50" />
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default FullStoryText;
