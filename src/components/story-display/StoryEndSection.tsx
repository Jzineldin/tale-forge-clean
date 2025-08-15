
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Flag } from 'lucide-react';
import { heroGrad, actionBtn } from '@/components/ui/theme';
import VoiceSelectionDialog from './VoiceSelectionDialog';
import EnhancedAudioPlayer from './EnhancedAudioPlayer';
import StorySegmentsDisplay from './StorySegmentsDisplay';
import StoryActionButtons from './StoryActionButtons';
import { StorySegment } from '@/hooks/useStoryDisplay/types';

interface StoryEndSectionProps {
  isEnd: boolean;
  isGenerating: boolean;
  onFinishStory: () => void;
  storySegments?: Array<{
    id: string;
    segment_text: string;
    image_url?: string;
    triggering_choice_text?: string;
    created_at: string;
  }>;
  storyId?: string;
  storyTitle?: string;
}

const StoryEndSection: React.FC<StoryEndSectionProps> = ({
  isEnd,
  isGenerating,
  onFinishStory,
  storySegments = [],
  storyId = '',
  storyTitle = 'Your Epic Adventure'
}) => {
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleAudioGenerated = (url: string) => {
    setAudioUrl(url);
  };

  // Transform the segments to match StorySegment interface
  const transformedSegments: StorySegment[] = storySegments.map(segment => ({
    ...segment,
    storyId: storyId,
    text: segment.segment_text,
    imageUrl: segment.image_url || '',
    audioUrl: '',
    isEnd: false,
    choices: [],
    story_id: storyId,
    segment_text: segment.segment_text,
    image_url: segment.image_url || '',
    audio_url: '',
    is_end: false,
    image_generation_status: 'completed',
    audio_generation_status: 'not_started',
    created_at: segment.created_at,
    word_count: segment.segment_text?.split(/\s+/).length || 0,
    audio_duration: 0,
    triggering_choice_text: segment.triggering_choice_text || ''
  }));

  if (isEnd) {
    return (
      <div className="space-y-8">
        {/* TRUE STORY CARD - one slick toolbar in Hero theme */}
        <section className={heroGrad + ' p-6 mt-10 rounded-2xl'}>
          <div className="flex items-center justify-between">
            <h2 className="fantasy-heading text-2xl font-bold text-white">Your adventure is complete</h2>
            <div className="flex space-x-2">
              <button className={`fantasy-heading ${actionBtn}`} onClick={() => window.open(`/story/${storyId}`, '_blank')}>
                Share Story
              </button>
              <button className={`fantasy-heading ${actionBtn}`}>Download PDF</button>
            </div>
          </div>

          {/* stats ribbon — optional but thematic */}
          <div className="mt-4 flex text-xs font-medium text-indigo-100 space-x-6">
            <span>{storySegments.reduce((total, seg) => total + (seg.segment_text?.split(/\s+/).length || 0), 0)} words</span>
            <span>Images: {storySegments.filter(seg => seg.image_url).length}</span>
            <span>Chapters: {storySegments.length}</span>
          </div>
        </section>

        {/* Voice Generation Section - This is where users generate full story narration */}
        {!audioUrl && storySegments.length > 0 && (
          <Card className="bg-slate-800/80 border-amber-500/20 text-center">
            <CardHeader>
              <CardTitle className="fantasy-heading text-amber-300 text-xl">🎙️ Generate Voice Narration</CardTitle>
              <p className="text-gray-300 text-sm">Transform your complete story into an immersive audio experience</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-amber-300/80">
                  Create professional narration for your entire {storySegments.length}-chapter story
                </p>
                <VoiceSelectionDialog
                  storyId={storyId}
                  storyTitle={storyTitle}
                  onAudioGenerated={handleAudioGenerated}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <EnhancedAudioPlayer
            audioUrl={audioUrl}
            storyTitle={storyTitle}
          />
        )}

        {/* Story Segments Display */}
        {transformedSegments.length > 0 && (
          <StorySegmentsDisplay
            segments={transformedSegments}
            storyTitle={storyTitle}
          />
        )}

        {/* Action Buttons */}
        <StoryActionButtons
          storyId={storyId}
          storyTitle={storyTitle}
        />
      </div>
    );
  }

  return (
    <div className="end-story-section w-full pt-6 border-t border-amber-500/20">
      <div className="text-center mb-4">
        <p className="fantasy-subtitle text-amber-200 text-sm mb-3">
          ✨ Complete your adventure with a magical ending ✨
        </p>
        <p className="text-gray-300 text-xs mb-4">
          This will create a beautiful conclusion to your story, summarizing the journey and crafting an appropriate ending
        </p>
      </div>
      <Button
        onClick={onFinishStory}
        disabled={isGenerating}
        variant="outline"
                    className="fantasy-heading w-full border-brand-indigo/50 text-indigo-300 hover:bg-brand-indigo/20 hover:border-indigo-400 transition-all duration-300 py-3 text-lg font-medium bg-slate-800/60"
      >
        <Flag className="mr-3 h-5 w-5" />
        End Story Here
      </Button>
    </div>
  );
};

export default StoryEndSection;
