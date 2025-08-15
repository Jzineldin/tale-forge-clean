
import React from 'react';
import StoryTextSection from './StoryTextSection';
import StoryImageSection from './StoryImageSection';
import StoryChoicesSection from './StoryChoicesSection';
import ConnectionStatus from './ConnectionStatus';
import { StorySegment } from '@/hooks/useStoryDisplay/types';

interface StorySegmentViewerProps {
  segment: StorySegment;
  chapterNumber: number;
  storyId?: string;
  audioPlaying: boolean;
  onToggleAudio: () => void;
  isStoryComplete: boolean;
  showChoices: boolean;
  isGenerating: boolean;
  onChoiceSelect: (choice: string, skipImage?: boolean) => void;
  skipImage?: boolean;
  onSkipImageChange?: ((skipImage: boolean) => void) | undefined;
  isCurrentSegment?: boolean;
  isHistorical?: boolean;
  connectionHealth?: 'healthy' | 'degraded' | 'failed';
  isFallbackPolling?: boolean;
  isSubscribed?: boolean;
}

const StorySegmentViewer: React.FC<StorySegmentViewerProps> = ({
  segment,
  chapterNumber,
  storyId,
  audioPlaying,
  onToggleAudio,
  showChoices,
  isGenerating,
  onChoiceSelect,
  skipImage = false,
  onSkipImageChange,
  connectionHealth = 'healthy',
  isFallbackPolling = false,
  isSubscribed = true
}) => {
  return (
    <div className="bg-slate-800/50 border border-yellow-500/20 rounded-xl p-6 md:p-8 shadow-lg backdrop-blur-sm space-y-6">
      {/* Chapter Header */}
      <div className="text-center pb-4 border-b border-yellow-500/10">
        <h2 className="font-['Cinzel'] text-3xl md:text-4xl font-bold text-yellow-400">
          CHAPTER {chapterNumber}
        </h2>
      </div>

      {/* Connection Status - Only show when there are issues */}
      <ConnectionStatus 
        connectionHealth={connectionHealth}
        isFallbackPolling={isFallbackPolling}
        isSubscribed={isSubscribed}
      />

      <StoryTextSection
        segmentText={segment.segment_text}
        segmentCount={chapterNumber}
        audioUrl={segment.audio_url || ''}
        audioPlaying={audioPlaying}
        onToggleAudio={onToggleAudio}
      />

      <StoryImageSection
        imageUrl={segment.image_url || ''}
        imageGenerationStatus={segment.image_generation_status}
        segmentId={segment.id}
        {...(storyId && { storyId })}
      />

      {showChoices && !segment.is_end && (
        <StoryChoicesSection
          choices={segment.choices}
          isGenerating={isGenerating}
          onChoiceSelect={onChoiceSelect}
          skipImage={skipImage}
          onSkipImageChange={onSkipImageChange}
          selectedChoice={segment.selected_choice}
          hasBeenContinued={segment.has_been_continued}
        />
      )}
    </div>
  );
};

export default StorySegmentViewer;
