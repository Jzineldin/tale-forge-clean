
import React from 'react';

import { StorySegmentRow } from '@/types/stories';
import StoryImage from './StoryImage';
import SegmentContent from './SegmentContent';
import { heroGrad } from '@/lib/theme';

interface StorySegmentItemProps {
    segment: StorySegmentRow;
    index: number;
    canContinue: boolean;
    onGoBack: (segmentId: string) => void;
    isGoBackPending: boolean;
}

const StorySegmentItem: React.FC<StorySegmentItemProps> = ({ 
    segment, 
    index, 
    canContinue, 
    onGoBack, 
    isGoBackPending 
}) => {
    console.log(`[StorySegmentItem ${segment.id}] Rendering segment:`, {
        id: segment.id,
        image_url: segment.image_url,
        image_generation_status: segment.image_generation_status,
        segment_text_preview: segment.segment_text?.substring(0, 50) + '...',
        hasImageUrl: !!segment.image_url,
        imageUrlLength: segment.image_url?.length || 0,
        isPlaceholder: segment.image_url === '/placeholder.svg',
        propsToStoryImage: {
            imageUrl: segment.image_url,
            imageGenerationStatus: segment.image_generation_status,
            altText: `Visual for segment ${index + 1}`
        }
    });

    return (
        <article className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
            {/* subtle hero burst */}
            <div className={heroGrad + ' absolute inset-0 z-0 pointer-events-none'}/>

            {/* glass card */}
            <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-6 sm:p-8 z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <StoryImage
                        imageUrl={segment.image_url}
                        imageGenerationStatus={segment.image_generation_status}
                        altText={`Visual for segment ${index + 1}`}
                        className="rounded-lg col-span-1"
                    />
                    
                    <SegmentContent
                        segmentText={segment.segment_text}
                        triggeringChoiceText={segment.triggering_choice_text || ''}
                        isEnd={segment.is_end}
                        index={index}
                        canContinue={canContinue}
                        segmentId={segment.id}
                        onGoBack={onGoBack}
                        isGoBackPending={isGoBackPending}
                    />
                </div>
            </div>
        </article>
    );
};

export default StorySegmentItem;
