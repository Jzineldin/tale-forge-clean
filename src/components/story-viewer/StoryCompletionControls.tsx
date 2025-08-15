
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { VoiceSelector } from '@/components/VoiceSelector';
import { useGenerateFullStoryAudio } from '@/hooks/useGenerateFullStoryAudio';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Maximize2, Sparkles, Play, Eye } from 'lucide-react';
import { StorySegmentRow } from '@/types/stories';
import AudioPlayer from '@/components/AudioPlayer';
import FullStoryText from './FullStoryText';
import StorySlideshow from './StorySlideshow';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
interface StoryCompletionControlsProps {
    storyId: string;
    segments?: StorySegmentRow[];
    fullStoryAudioUrl?: string;
    audioGenerationStatus?: string;
    onRestart?: () => void;
}

const StoryCompletionControls: React.FC<StoryCompletionControlsProps> = ({ 
    storyId, 
    segments = [],
    fullStoryAudioUrl,
    audioGenerationStatus,
    onRestart 
}) => {
    const [selectedVoice, setSelectedVoice] = useState('jbHveVx08UsDYum4fcml'); // Default to Kevin - Founder
    const [showSlideshow, setShowSlideshow] = useState(false);
    
    const generateAudioMutation = useGenerateFullStoryAudio();

    console.log('StoryCompletionControls Debug:', {
        storyId,
        segmentsCount: segments.length,
        audioStatus: audioGenerationStatus,
        hasAudioUrl: !!fullStoryAudioUrl,
        segmentsWithImages: segments.filter(s => s.image_generation_status === 'completed').length
    });

    // Don't auto-launch slideshow - let user choose when to watch
    // This prevents blank page issues and gives users control
    useEffect(() => {
        if (fullStoryAudioUrl && audioGenerationStatus === 'completed') {
            console.log('🎵 Audio generation completed - slideshow ready');
            // Just log completion, don't auto-launch
        }
    }, [fullStoryAudioUrl, audioGenerationStatus]);

    const handleGenerateAudio = () => {
        generateAudioMutation.mutate({ storyId, voiceId: selectedVoice });
    };

    const handleWatchStory = () => {
        console.log('🎬 Launching slideshow experience');
        setShowSlideshow(true);
    };

    const isAnyJobRunning = generateAudioMutation.isPending || audioGenerationStatus === 'in_progress';
    const canGenerateAudio = audioGenerationStatus === 'not_started' || audioGenerationStatus === 'failed' || !audioGenerationStatus;
    const hasCompletedAudio = audioGenerationStatus === 'completed' && fullStoryAudioUrl;
    

    return (
        <>
            <div className="w-full max-w-4xl mx-auto space-y-6">
                {/* Story Complete Announcement */}
                <Card className="border-2 border-amber-500/30 bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl flex items-center justify-center gap-3 text-amber-200">
                            <Sparkles className="h-8 w-8 text-amber-400" />
                            🎉 Story Complete!
                        </CardTitle>
                        <CardDescription className="text-amber-300 text-lg mt-2">
                            Your adventure concluded with <strong>{segments.length} chapters</strong>, 
                            <strong> {segments.filter(s => s.image_generation_status === 'completed').length} images</strong>, and countless memories!
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* What's Next Section - Combined Share & Experience */}
                <Card className="border-amber-500/30 bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl text-amber-200 flex items-center gap-2">
                            <Eye className="h-6 w-6 text-amber-400" />
                            What's Next?
                        </CardTitle>
                        <CardDescription className="text-slate-300">
                            Experience your story in its full glory or start a new adventure
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Experience Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-amber-300">📖 Experience Your Story</h3>
                            <p className="text-slate-300 mb-4">
                                Watch your complete story as an immersive slideshow experience with images and narration
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button 
                                    onClick={handleWatchStory}
                                    size="lg"
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8 py-3 flex-1"
                                >
                                    <Eye className="mr-2 h-5 w-5" />
                                    🎬 Watch Your Story
                                </Button>
                                
                                {hasCompletedAudio && (
                                    <Button 
                                        onClick={handleWatchStory}
                                        size="lg"
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-3 flex-1"
                                    >
                                        <Play className="mr-2 h-5 w-5" />
                                        🎵 Watch with Audio
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        <Separator className="bg-slate-600" />
                        
                        {/* New Adventure Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-amber-300">✨ Ready for More?</h3>
                            {onRestart && (
                                <Button 
                                    onClick={onRestart} 
                                    variant="outline" 
                                    className="w-full border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Start a New Story
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Audio Generation Section */}
                {canGenerateAudio && (
                    <Card className="border-amber-500/30 bg-slate-800/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-amber-300">🔊 Add Voice Narration</CardTitle>
                            <CardDescription className="text-slate-300">Generate professional voice narration for the full slideshow experience</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <VoiceSelector selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice} />
                            <Button 
                                onClick={handleGenerateAudio} 
                                disabled={isAnyJobRunning}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                                size="lg"
                            >
                                {generateAudioMutation.isPending ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2 h-4 w-4 " /> 
                                        Starting Generation...
                                    </>
                                ) : (
                                    <>
                                        🎙️ Generate Voice Narration
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-amber-200/70 text-center">
                                This will generate audio for your entire story (~2-5 minutes)
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Loading State */}
                {audioGenerationStatus === 'in_progress' && (
                    <Card className="border-blue-500/30 bg-slate-800/80 backdrop-blur-sm">
                        <CardContent className="text-center p-6">
                            <LoadingSpinner size="md" className="h-8 w-8  mx-auto mb-3 text-blue-400" />
                            <p className="text-blue-300 font-medium">Generating full story audio...</p>
                            <p className="text-sm text-blue-200/70 mt-1">This may take a few minutes. The slideshow will auto-launch when ready!</p>
                        </CardContent>
                    </Card>
                )}

                {/* Failed State */}
                {audioGenerationStatus === 'failed' && (
                    <Card className="border-red-500/30 bg-slate-800/80 backdrop-blur-sm">
                        <CardContent className="p-4 text-center">
                            <div className="p-4 border border-red-500/30 rounded-lg bg-red-900/20">
                                <span className="text-red-300">Audio generation failed. You can still watch your story without audio, or try generating audio again.</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Generated Audio Player */}
                {hasCompletedAudio && (
                    <Card key={`audio-${fullStoryAudioUrl}-${Date.now()}`} className="border-green-500/30 bg-slate-800/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-green-300">🎵 Your Story Audio is Ready!</CardTitle>
                            <CardDescription className="text-slate-300">Your story now has professional voice narration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <AudioPlayer src={fullStoryAudioUrl} />
                            
                            <Button 
                                onClick={handleWatchStory}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                                size="lg"
                            >
                                <Maximize2 className="mr-2 h-4 w-4" />
                                🎬 Launch Full Slideshow Experience
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Full Story Text - Collapsible */}
                {segments.length > 0 && (
                    <FullStoryText segments={segments} />
                )}
            </div>

            {/* Enhanced Slideshow Modal */}
            <StorySlideshow
                segments={segments}
                fullStoryAudioUrl={fullStoryAudioUrl || ''}
                isOpen={showSlideshow}
                onClose={() => setShowSlideshow(false)}
            />
        </>
    );
}

export default StoryCompletionControls;
