
import React from 'react';
import StoryImage from '@/components/story-viewer/StoryImage';

interface StoryImageSectionProps {
  imageUrl?: string;
  imageGenerationStatus?: string;
  segmentId?: string;
  storyId?: string;
  onRetry?: () => void;
}

const StoryImageSection: React.FC<StoryImageSectionProps> = React.memo(({
  imageUrl,
  imageGenerationStatus,
  segmentId,
  storyId,
  onRetry
}) => {
  console.log('[StoryImageSection] Rendering with:', {
    imageUrl,
    imageGenerationStatus,
    hasImageUrl: !!imageUrl,
    segmentId
  });

  return (
    <div className="story-image-section w-full">
      <StoryImage
        imageUrl={imageUrl || null}
        imageGenerationStatus={imageGenerationStatus || 'not_started'}
        altText="AI generated story illustration"
        className="w-full max-w-4xl h-96 md:h-[500px] rounded-lg shadow-lg mx-auto object-cover"
        segmentId={segmentId || ''}
        {...(storyId && { storyId })}
        {...(onRetry && { onRetry })}
      />
    </div>
  );
});

// Display name for debugging
StoryImageSection.displayName = 'StoryImageSection';

export default StoryImageSection;
