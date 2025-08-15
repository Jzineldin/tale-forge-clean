
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StoryDisplay from '@/components/StoryDisplay';
import { StorySegmentRow } from '@/types/stories';
import { useFinishStory } from '@/hooks/useFinishStory';
import { toast } from 'sonner';

interface StoryContinuationProps {
    lastSegment: StorySegmentRow | null;
    canContinue: boolean;
    onSelectChoice: (choice: string) => void;
    isLoading: boolean;
}

const StoryContinuation: React.FC<StoryContinuationProps> = ({ lastSegment, canContinue, onSelectChoice, isLoading }) => {
    const navigate = useNavigate();
    const finishStoryMutation = useFinishStory();

    const handleFinishStory = () => {
        if (lastSegment) {
            finishStoryMutation.mutate(lastSegment.id, {
                onSuccess: () => {
                    toast.success("🎉 Story completed! Scroll down to see your options for generating audio and more.");
                    // Scroll to the completion controls after a short delay
                    setTimeout(() => {
                        const completionElement = document.querySelector('[data-completion-controls]');
                        if (completionElement) {
                            completionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 500);
                }
            });
        }
    };

    if (lastSegment && !lastSegment.is_end && canContinue) {
        return (
            <div className="-mx-4 md:-mx-6 mt-8">
                <StoryDisplay
                    storySegment={{
                        storyId: lastSegment.story_id,
                        text: lastSegment.segment_text,
                        imageUrl: lastSegment.image_url,
                        choices: lastSegment.choices,
                        isEnd: lastSegment.is_end,
                        segmentId: lastSegment.id,
                    }}
                    onSelectChoice={onSelectChoice}
                    onFinishStory={handleFinishStory}
                    onRestart={() => navigate('/')}
                    isLoading={isLoading}
                    isFinishingStory={finishStoryMutation.isPending}
                    isEmbedded={true}
                />
            </div>
        );
    }
    
    if (lastSegment && !lastSegment.is_end && !canContinue) {
        return (
             <div className="text-center p-8 border-t mt-8">
                <p className="text-muted-foreground">This story is still in progress.</p>
            </div>
        );
    }

    return null;
}

export default StoryContinuation;
