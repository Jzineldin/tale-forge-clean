
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, ImageIcon, Loader2, Wand2 } from 'lucide-react';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
interface ImageStatusOverlayProps {
    imageGenerationStatus?: string;
    imageError?: boolean;
    segmentId?: string;
    imageUrl?: string;
    imageLoaded?: boolean;
    onRetry?: () => void;
}

// Realistic AI image generation steps
const AI_GENERATION_STEPS = [
    { step: 1, text: "Initializing AI neural networks...", icon: "🧠" },
    { step: 2, text: "Processing your story context...", icon: "📖" },
    { step: 3, text: "Understanding scene composition...", icon: "🎨" },
    { step: 4, text: "Analyzing genre and mood...", icon: "🎭" },
    { step: 5, text: "Setting up diffusion model...", icon: "⚙️" },
    { step: 6, text: "Creating initial noise pattern...", icon: "🌀" },
    { step: 7, text: "Beginning denoising process...", icon: "✨" },
    { step: 8, text: "Refining basic shapes...", icon: "🔲" },
    { step: 9, text: "Adding character details...", icon: "👤" },
    { step: 10, text: "Developing background elements...", icon: "🏞️" },
    { step: 11, text: "Enhancing lighting and shadows...", icon: "💡" },
    { step: 12, text: "Improving texture details...", icon: "🖌️" },
    { step: 13, text: "Balancing color harmony...", icon: "🎨" },
    { step: 14, text: "Refining facial expressions...", icon: "😊" },
    { step: 15, text: "Adding atmospheric effects...", icon: "🌫️" },
    { step: 16, text: "Enhancing magical elements...", icon: "✨" },
    { step: 17, text: "Improving scene composition...", icon: "📐" },
    { step: 18, text: "Fine-tuning proportions...", icon: "📏" },
    { step: 19, text: "Adding dynamic lighting...", icon: "🔆" },
    { step: 20, text: "Enhancing depth perception...", icon: "🎯" },
    { step: 21, text: "Polishing surface details...", icon: "💎" },
    { step: 22, text: "Optimizing visual flow...", icon: "🌊" },
    { step: 23, text: "Adding story-specific elements...", icon: "📚" },
    { step: 24, text: "Refining artistic style...", icon: "🖼️" },
    { step: 25, text: "Enhancing emotional impact...", icon: "❤️" },
    { step: 26, text: "Fine-tuning color grading...", icon: "🌈" },
    { step: 27, text: "Adding final touches...", icon: "✍️" },
    { step: 28, text: "Quality enhancement pass...", icon: "⭐" },
    { step: 29, text: "Preparing high-resolution output...", icon: "📸" },
    { step: 30, text: "Finalizing your unique artwork...", icon: "🎉" }
];

const ImageStatusOverlay: React.FC<ImageStatusOverlayProps> = ({
    imageGenerationStatus,
    imageError,
    segmentId,
    imageUrl,
    imageLoaded,
    onRetry
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showError, setShowError] = useState(false);

    // Delay showing error state to prevent premature error messages
    useEffect(() => {
        if (imageError) {
            const timer = setTimeout(() => {
                setShowError(true);
            }, 5000); // Wait 5 seconds before showing error
            return () => clearTimeout(timer);
        } else {
            setShowError(false);
        }
        return undefined;
    }, [imageError]);

    // Initialize timing when generation starts
    useEffect(() => {
        if (imageGenerationStatus === 'in_progress' && !startTime) {
            setStartTime(Date.now());
            setCurrentStep(1);
        }
    }, [imageGenerationStatus, startTime]);

    // Update elapsed time every second
    useEffect(() => {
        let interval: number | undefined;
        
        if (imageGenerationStatus === 'in_progress' && startTime) {
            interval = window.setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [imageGenerationStatus, startTime]);

    // Progress through steps realistically
    useEffect(() => {
        if (imageGenerationStatus !== 'in_progress') return;

        const stepInterval = window.setInterval(() => {
            setCurrentStep(prev => {
                // Progress faster initially, slower later (realistic AI behavior)
                const progress = elapsedTime / 45; // Assume 45 second total
                const targetStep = Math.min(30, Math.floor(progress * 30) + 1);
                
                // Don't jump more than 1 step at a time for smooth progression
                return Math.min(targetStep, prev + 1);
            });
        }, 1500); // Update every 1.5 seconds

        return () => clearInterval(stepInterval);
    }, [imageGenerationStatus, elapsedTime]);

    const getStatusDisplay = () => {
        if (imageGenerationStatus === 'in_progress') {
            const currentStepData = AI_GENERATION_STEPS[currentStep - 1];
            const progressPercentage = (currentStep / 30) * 100;
            
            return { 
                icon: Wand2, 
                text: 'AI is crafting your image...', 
                spinning: true, 
                showRetry: false,
                description: currentStepData.text,
                showProgress: true,
                progress: progressPercentage,
                step: currentStep,
                stepEmoji: currentStepData.icon
            };
        }
        if (imageGenerationStatus === 'not_started' || imageGenerationStatus === 'pending') {
            return { 
                icon: Clock, 
                text: 'Image generation queued...', 
                spinning: false, 
                showRetry: false,
                description: 'Waiting for AI to start generating',
                showProgress: false
            };
        }
        if (imageGenerationStatus === 'failed') {
            return { 
                icon: AlertCircle, 
                text: 'Image generation failed', 
                spinning: false, 
                showRetry: true,
                description: 'There was an error generating your image',
                showProgress: false
            };
        }
        if (imageError && showError) {
            return { 
                icon: AlertCircle, 
                text: 'Failed to load image', 
                spinning: false, 
                showRetry: true,
                description: 'The image could not be displayed',
                showProgress: false
            };
        }
        // Don't show error state immediately - give image time to load
        if (imageUrl && imageGenerationStatus === 'completed' && !imageLoaded && !imageError) {
            return { 
                icon: Loader2, 
                text: 'Loading image...', 
                spinning: true, 
                showRetry: false,
                description: 'Downloading your generated image',
                showProgress: false
            };
        }
        // Give more time for images to load before showing any error
        if (imageUrl && !imageLoaded && !imageError) {
            return { 
                icon: Loader2, 
                text: 'Loading image...', 
                spinning: true, 
                showRetry: false,
                description: 'Downloading your generated image',
                showProgress: false
            };
        }
        // If image is completed and loaded, don't show overlay
        if (imageGenerationStatus === 'completed' && imageLoaded && !imageError) {
            return null;
        }
        return { 
            icon: ImageIcon, 
            text: 'Processing...', 
            spinning: true, 
            showRetry: false,
            description: 'Preparing your image',
            showProgress: false
        };
    };

    const handleRetryImage = async () => {
        console.log(`[ImageStatusOverlay ${segmentId}] Retrying image generation/loading`);
        
        // Reset step progress for retry
        setCurrentStep(1);
        setStartTime(null);
        setElapsedTime(0);
        
        if (onRetry) {
            onRetry();
        }
    };

    const status = getStatusDisplay();
    
    // If status is null, don't render the overlay (image is completed and loaded)
    if (!status) {
        return null;
    }
    
    const IconComponent = status.icon;

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/95 backdrop-blur-sm">
            <div className="text-center space-y-4 max-w-sm mx-auto p-6">
                {/* Main icon and status */}
                <div className="relative">
                    <IconComponent className={`h-10 w-10 text-primary mx-auto ${status.spinning ? 'animate-spin' : ''}`} />
                    {status.showProgress && (
                        <div className="absolute -bottom-2 -right-2 bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-white">
                            {status.stepEmoji}
                        </div>
                    )}
                </div>

                {/* Status text */}
                <div>
                    <p className="text-sm font-medium text-foreground">
                        {status.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {status.description}
                    </p>
                </div>

                {/* AI Generation Progress */}
                {status.showProgress && (
                    <div className="space-y-3">
                        {/* Progress bar */}
                        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                                                         <div 
                                className="h-full bg-gradient-to-r from-amber-400 to-purple-400 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${status.progress || 0}%` }}
                            />
                        </div>
                        
                        {/* Step counter and time */}
                                                 <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>Step {status.step || 1}/30</span>
                            <span>{Math.floor(status.progress || 0)}% complete</span>
                            <span>{elapsedTime}s</span>
                        </div>

                        {/* Current step description with animation */}
                        <div className="bg-slate-800/60 rounded-lg p-3 border border-amber-500/30">
                            <div className="flex items-center gap-2">
                                <span className="text-lg animate-pulse">{status.stepEmoji}</span>
                                <span className="text-xs text-amber-300 font-medium">
                                    {status.description}
                                </span>
                            </div>
                        </div>

                        {/* Estimated time remaining */}
                        {elapsedTime > 0 && (status.progress || 0) > 10 && (
                            <div className="text-xs text-purple-300">
                                ⏱️ Est. {Math.max(0, Math.floor(45 - elapsedTime))} seconds remaining
                            </div>
                        )}
                    </div>
                )}

                {/* Retry button */}
                {status.showRetry && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRetryImage}
                        className="mt-4"
                    >
                        <LoadingSpinner size="sm" className="h-3 w-3 mr-1" />
                        Retry
                    </Button>
                )}
            </div>
            
            {/* Debug info in development */}
            {import.meta.env.DEV && (
                <div className="absolute bottom-2 left-2 right-2 text-xs text-muted-foreground text-center bg-background/80 rounded p-2">
                    <div>Status: {imageGenerationStatus || 'none'}</div>
                    <div>URL: {imageUrl ? 'Present' : 'Missing'}</div>
                    <div>Loaded: {imageLoaded ? 'Yes' : 'No'}</div>
                    <div>Error: {imageError ? 'Yes' : 'No'}</div>
                    {status.showProgress && <div>Step: {status.step || 1}/30 ({Math.floor(status.progress || 0)}%)</div>}
                </div>
            )}
        </div>
    );
};

export default ImageStatusOverlay;
