
import React from 'react';

interface ImageDebugInfoProps {
    imageGenerationStatus?: string;
    imageUrl?: string;
    isRealImageUrl?: boolean;
    urlContainsSupabase?: boolean;
    urlContainsStorage?: boolean;
    urlStartsWithHttp?: boolean;
    imageLoaded?: boolean;
    imageError?: boolean;
}

const ImageDebugInfo: React.FC<ImageDebugInfoProps> = ({
    imageGenerationStatus,
    imageUrl,
    isRealImageUrl,
    urlContainsSupabase,
    urlContainsStorage,
    urlStartsWithHttp,
    imageLoaded,
    imageError
}) => {
    return (
        <div className="absolute bottom-2 left-2 right-2 text-xs text-muted-foreground text-center bg-background/80 rounded p-2 space-y-1">
            <div>Status: {imageGenerationStatus || 'none'}</div>
            <div>URL: {imageUrl ? (imageUrl.length > 50 ? imageUrl.substring(0, 50) + '...' : imageUrl) : 'none'}</div>
            <div>Real URL: {isRealImageUrl ? 'Yes' : 'No'}</div>
            <div>Contains Supabase: {urlContainsSupabase ? 'Yes' : 'No'}</div>
            <div>Contains Storage: {urlContainsStorage ? 'Yes' : 'No'}</div>
            <div>Starts with HTTP: {urlStartsWithHttp ? 'Yes' : 'No'}</div>
            <div>Loaded: {imageLoaded ? 'Yes' : 'No'}</div>
            <div>Error: {imageError ? 'Yes' : 'No'}</div>
            {isRealImageUrl && (
                <div className="mt-1">
                    <a 
                        href={imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary underline text-xs"
                    >
                        Test URL
                    </a>
                </div>
            )}
        </div>
    );
};

export default ImageDebugInfo;
