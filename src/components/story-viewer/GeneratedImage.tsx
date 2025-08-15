
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { validateImageUrl } from './image-utils/imageUrlValidator';
import { getImageStatusDisplay } from './image-utils/imageStatusHelper';
import { useStorySegmentRealtime } from '@/hooks/useStorySegmentRealtime';
import ImageOverlay from './image-utils/ImageOverlay';

interface GeneratedImageProps {
    imageUrl?: string;
    imageGenerationStatus?: string;
    segmentId: string;
    altText: string;
    className?: string;
    showDebugInfo?: boolean;
}


const GeneratedImage: React.FC<GeneratedImageProps> = ({
    imageUrl,
    imageGenerationStatus,
    segmentId,
    altText,
    className = "",
    showDebugInfo = false
}) => {
    // Debug logging removed for production
    
    const [error, setError] = useState(false);
    
    // Always call the hook, but let it handle fallback logic internally
    useStorySegmentRealtime(segmentId);

    const urlValidation = validateImageUrl(imageUrl);
    const { isRealImageUrl } = urlValidation;
    
    // bust cache + trigger React remount
    const signedSrc = imageUrl ? `${imageUrl}?v=${Date.now()}` : '';

    useEffect(() => setError(false), [signedSrc]);
    
    // Show placeholder or loading state when no real image URL
    if (!isRealImageUrl) {
        return (
            <div className={`relative overflow-hidden bg-muted border aspect-square w-full ${className}`}>
                <ImageOverlay
                    status={getImageStatusDisplay(imageGenerationStatus, false, false, false)}
                    onRetry={() => setError(false)}
                    showDebugInfo={showDebugInfo}
                    imageGenerationStatus={imageGenerationStatus || ''}
                    imageUrl={imageUrl || ''}
                    isRealImageUrl={false}
                    urlContainsSupabase={false}
                    urlContainsStorage={false}
                    urlStartsWithHttp={false}
                    imageLoaded={false}
                    imageError={false}
                />
            </div>
        );
    }

    const status = getImageStatusDisplay(imageGenerationStatus, isRealImageUrl, !error && !!signedSrc, error);
    
    // Show overlay when image isn't ready
    const showOverlay = imageGenerationStatus !== 'completed' || error;

    return (
        <div className={`relative overflow-hidden bg-muted border aspect-square w-full ${className}`}>
            {/* Always render image if we have a real URL */}
            {signedSrc && !error && (
                <img 
                    key={signedSrc}        // ★ forces remount when src changes
                    src={signedSrc}
                    alt={altText}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={() => setError(true)}
                    crossOrigin="anonymous"
                    loading="eager"
                />
            )}
            
            {/* Show overlay when needed */}
            {showOverlay && (
                <ImageOverlay
                    status={status}
                    onRetry={() => setError(false)}
                    showDebugInfo={showDebugInfo}
                    imageGenerationStatus={imageGenerationStatus || ''}
                    imageUrl={imageUrl || ''}
                    isRealImageUrl={isRealImageUrl}
                    urlContainsSupabase={urlValidation.urlContainsSupabase}
                    urlContainsStorage={urlValidation.urlContainsStorage}
                    urlStartsWithHttp={urlValidation.urlStartsWithHttp}
                    imageLoaded={!error && !!signedSrc}
                    imageError={error}
                />
            )}

            {/* Force refresh button for debugging */}
            {(import.meta.env.DEV || showDebugInfo) && (
                <div className="absolute top-2 right-2 z-50">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setError(false)}
                        className="bg-white/90 hover:bg-white text-xs"
                    >
                        <RefreshCw className="h-3 w-3" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default GeneratedImage;
