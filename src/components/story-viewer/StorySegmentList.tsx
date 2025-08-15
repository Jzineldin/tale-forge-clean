
import React from 'react';
import { StorySegmentRow } from '@/types/stories';
import StorySegmentItem from './StorySegmentItem';

interface StorySegmentListProps {
    segments: StorySegmentRow[];
    canContinue: boolean;
    onGoBack: (segmentId: string) => void;
    isGoBackPending: boolean;
}

const StorySegmentList: React.FC<StorySegmentListProps> = ({ segments, canContinue, onGoBack, isGoBackPending }) => {
    return (
        <div className="space-y-8">
            {segments.map((segment, index) => (
                <StorySegmentItem 
                    key={segment.id}
                    segment={segment}
                    index={index}
                    canContinue={canContinue}
                    onGoBack={onGoBack}
                    isGoBackPending={isGoBackPending}
                />
            ))}
        </div>
    );
}
export default StorySegmentList;
