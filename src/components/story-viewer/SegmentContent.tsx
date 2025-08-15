
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';


interface SegmentContentProps {
    segmentText: string;
    triggeringChoiceText?: string;
    isEnd: boolean;
    index: number;
    canContinue: boolean;
    segmentId: string;
    onGoBack: (segmentId: string) => void;
    isGoBackPending: boolean;
}

const SegmentContent: React.FC<SegmentContentProps> = ({
    segmentText,
    triggeringChoiceText,
    isEnd,
    index,
    canContinue,
    segmentId,
    onGoBack,
    isGoBackPending
}) => {
    return (
        <div className="col-span-2">
            {/* top nav */}
            <header className="border-b border-slate-300/20 dark:border-slate-700/20 pb-3 mb-6">
                <div className="flex items-center justify-between text-sm text-indigo-600 dark:text-indigo-400">
                    <span>Chapter {index + 1}</span>
                    {index > 0 && canContinue && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hover:text-indigo-800"
                            onClick={() => onGoBack(segmentId)}
                            disabled={isGoBackPending}
                            title="Go back to this point"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Go Back
                        </Button>
                    )}
                </div>
            </header>

            {/* rich body */}
            <section className="prose prose-slate dark:prose-invert max-w-none">
                {triggeringChoiceText && (
                    <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700/30">
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 italic">
                            You chose: "{triggeringChoiceText}"
                        </p>
                    </div>
                )}
                <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    {segmentText}
                </p>
                {isEnd && (
                    <div className="mt-6 text-center">
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">The End.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default SegmentContent;
