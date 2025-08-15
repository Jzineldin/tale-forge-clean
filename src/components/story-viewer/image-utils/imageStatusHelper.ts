
import { Clock, AlertCircle, RefreshCw, ImageIcon, Wand2, Sparkles, LucideIcon } from 'lucide-react';

export interface ImageStatusDisplay {
    icon: LucideIcon;
    text: string;
    subtext: string;
    spinning: boolean;
    showRetry: boolean;
}

export const getImageStatusDisplay = (
    imageGenerationStatus?: string,
    isRealImageUrl?: boolean,
    imageLoaded?: boolean,
    imageError?: boolean
): ImageStatusDisplay => {
    if (imageGenerationStatus === 'in_progress') {
        return { 
            icon: Wand2, 
            text: 'AI is crafting your image...', 
            subtext: 'Our AI is working through 30 steps to create the perfect scene for your story',
            spinning: true,
            showRetry: false
        };
    }
    if (imageGenerationStatus === 'pending') {
        return { 
            icon: Clock, 
            text: 'Image generation queued...', 
            subtext: 'Your request is in the queue - AI will start creating your image shortly',
            spinning: false,
            showRetry: false
        };
    }
    if (imageGenerationStatus === 'failed') {
        return { 
            icon: AlertCircle, 
            text: 'Image generation failed', 
            subtext: 'Something went wrong with the AI generation - click retry to try again',
            spinning: false,
            showRetry: true
        };
    }
    if (imageError) {
        return { 
            icon: AlertCircle, 
            text: 'Failed to load image', 
            subtext: 'The image was generated but couldn\'t be displayed - click retry to reload',
            spinning: false,
            showRetry: true
        };
    }
    if (imageGenerationStatus === 'completed' && isRealImageUrl && !imageLoaded) {
        return { 
            icon: Sparkles, 
            text: 'Loading your artwork...', 
            subtext: 'Your unique image has been created and is now loading',
            spinning: true,
            showRetry: false
        };
    }
    if (imageGenerationStatus === 'completed' && !isRealImageUrl) {
        return { 
            icon: RefreshCw, 
            text: 'Image ready, refreshing...', 
            subtext: 'Generation complete! If the image doesn\'t appear, click refresh',
            spinning: true,
            showRetry: true
        };
    }
    return { 
        icon: ImageIcon, 
        text: 'No image available', 
        subtext: 'Image will appear when AI generation begins',
        spinning: false,
        showRetry: false
    };
};
