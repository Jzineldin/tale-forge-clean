
import React, { useState, useEffect } from 'react';
import { ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageStatusOverlay from './ImageStatusOverlay';

interface ImageDisplayProps {
    imageUrl?: string;
    imageGenerationStatus?: string;
    segmentId: string;
    altText: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
    imageUrl,
    imageGenerationStatus,
    segmentId,
    altText
}) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [forceRefresh, setForceRefresh] = useState(0);
    const [lastImageUrl, setLastImageUrl] = useState<string>('');
    
    // Listen for force refresh events
    useEffect(() => {
        const handleForceRefresh = (event: CustomEvent) => {
            if (event.detail.segmentId === segmentId) {
                console.log(`[ImageDisplay ${segmentId}] Received force refresh event`);
                setForceRefresh(prev => prev + 1);
                setImageLoaded(false);
                setImageError(false);
            }
        };
        
        window.addEventListener('force-image-refresh', handleForceRefresh as EventListener);
        
        return () => {
            window.removeEventListener('force-image-refresh', handleForceRefresh as EventListener);
        };
    }, [segmentId]);
    
    console.log(`[ImageDisplay ${segmentId}] Current state:`, {
        imageUrl: imageUrl || 'Missing',
        imageGenerationStatus,
        imageLoaded,
        imageError,
        forceRefresh
    });
    
    // Reset image loading state when URL changes significantly
    useEffect(() => {
        const cleanUrl = imageUrl?.split('?')[0] || '';
        const cleanLastUrl = lastImageUrl?.split('?')[0] || '';
        
        if (cleanUrl !== cleanLastUrl) {
            console.log(`[ImageDisplay ${segmentId}] URL changed, resetting state:`, {
                from: cleanLastUrl,
                to: cleanUrl
            });
            setImageLoaded(false);
            setImageError(false);
            setLastImageUrl(imageUrl || '');
        }
    }, [segmentId, imageUrl, lastImageUrl]);
    
    // Check if we have a real generated image URL (not placeholder)
    const isRealImageUrl = imageUrl && 
                          imageUrl !== '/placeholder.svg' && 
                          !imageUrl.includes('placeholder.svg') &&
                          !imageUrl.includes('unsplash.com') &&
                          !imageUrl.includes('via.placeholder.com') &&
                          (imageUrl.includes('supabase.co') || imageUrl.includes('fyihypkigbcmsxyvseca.supabase.co')); // Must be from Supabase storage
    
    // Show overlay if image is not completed, loading, or errored
    const shouldShowOverlay = imageGenerationStatus !== 'completed' || 
                             !isRealImageUrl ||
                             (isRealImageUrl && !imageLoaded && !imageError) ||
                             imageError;

    console.log(`[ImageDisplay ${segmentId}] URL Analysis:`, {
        isRealImageUrl,
        urlContainsSupabase: imageUrl?.includes('supabase.co'),
        urlContainsProjectId: imageUrl?.includes('fyihypkigbcmsxyvseca'),
        urlContainsStorage: imageUrl?.includes('/storage'),
        urlContainsStorageV: imageUrl?.includes('/storage/v'),
        imageUrl: imageUrl?.substring(0, 100) + '...',
        imageGenerationStatus,
        shouldShowOverlay
    });

    const handleImageLoad = () => {
        console.log(`[ImageDisplay ${segmentId}] ✅ Image loaded successfully`);
        setImageLoaded(true);
        setImageError(false);
    };

    const handleImageError = () => {
        console.error(`[ImageDisplay ${segmentId}] ❌ Image failed to load:`, imageUrl);
        setImageError(true);
        setImageLoaded(false);
    };

    const handleForceRefresh = () => {
        console.log(`[ImageDisplay ${segmentId}] 🔄 Force refreshing image`);
        setForceRefresh(prev => prev + 1);
        setImageLoaded(false);
        setImageError(false);
    };

    return (
        <div className="rounded-lg aspect-square col-span-1 relative bg-secondary overflow-hidden border">
            {/* Show the actual image if we have a real URL */}
            {isRealImageUrl && (
                <img 
                    key={`${imageUrl}-${forceRefresh}`} // Force re-render on refresh
                    src={`${imageUrl}${forceRefresh > 0 ? `?refresh=${forceRefresh}` : ''}`} 
                    alt={altText}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />
            )}
            
            {/* Show loading/error state overlay */}
            {shouldShowOverlay && (
                <ImageStatusOverlay 
                    imageGenerationStatus={imageGenerationStatus || ''}
                    imageError={imageError}
                    segmentId={segmentId}
                    imageUrl={imageUrl || ''}
                    imageLoaded={imageLoaded}
                    onRetry={handleForceRefresh}
                />
            )}
            
            {/* Show placeholder when no image is available and status is not completed */}
            {!isRealImageUrl && imageGenerationStatus !== 'completed' && !shouldShowOverlay && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center px-2">
                        No image available
                    </p>
                </div>
            )}

            {/* Debug refresh button for development */}
            {import.meta.env.DEV && imageGenerationStatus === 'completed' && (
                <div className="absolute top-2 right-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleForceRefresh}
                        className="bg-white/90 hover:bg-white"
                    >
                        <RefreshCw className="h-3 w-3" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ImageDisplay;
