
import React from 'react';
import { ImageIcon } from 'lucide-react';
import StoryImage from '@/components/story-viewer/StoryImage';

interface StoryImageSectionProps {
  imageUrl: string;
  imageGenerationStatus: string;
  segmentId?: string;
  onRetry?: () => void;
}

const StoryImageSection: React.FC<StoryImageSectionProps> = ({
  imageUrl,
  imageGenerationStatus,
  segmentId,
  onRetry
}) => {
  const hasRealImage = imageUrl && 
                      imageUrl.startsWith('http') && 
                      imageUrl !== '/placeholder.svg';

  const isImageGenerating = hasRealImage ? false : imageGenerationStatus === 'not_started' || imageGenerationStatus === 'pending' || imageGenerationStatus === 'in_progress';
  const isImageFailed = imageGenerationStatus === 'failed' || imageGenerationStatus === 'CURRENT_TASK_ERROR';

  return (
    <div className="story-image-section w-full">
      {hasRealImage ? (
        <StoryImage
          imageUrl={imageUrl}
          imageGenerationStatus={imageGenerationStatus}
          altText="AI generated story illustration"
          className="w-full max-w-4xl h-80 md:h-96 rounded-lg shadow-lg mx-auto"
          {...(segmentId && { segmentId })}
          {...(onRetry && { onRetry })}
        />
      ) : (
        <div className="w-full max-w-4xl h-80 md:h-96 rounded-lg border-2 border-dashed border-amber-500/30 bg-slate-800/50 flex flex-col items-center justify-center mx-auto">
          {isImageGenerating ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mb-4"></div>
              <p className="text-amber-300 text-lg">Creating your story image...</p>
              <p className="text-amber-300/70 text-sm mt-2">This may take 30-60 seconds</p>
            </>
          ) : isImageFailed ? (
            <>
              <ImageIcon className="h-16 w-16 text-red-400/50 mb-4" />
              <p className="text-red-300 text-lg">Image generation failed</p>
              <p className="text-red-300/70 text-sm mt-2">
                {imageGenerationStatus === 'CURRENT_TASK_ERROR' 
                  ? 'Service temporarily unavailable' 
                  : 'Please try again later'}
              </p>
            </>
          ) : (
            <>
              <ImageIcon className="h-16 w-16 text-amber-400/50 mb-4" />
              <p className="text-amber-300/70 text-lg">Story Image</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryImageSection;
