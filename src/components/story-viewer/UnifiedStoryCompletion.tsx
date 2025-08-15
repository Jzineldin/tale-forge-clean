import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui/button';
import { Edit, Download, Share2, Globe, Play } from 'lucide-react';
import { toast } from 'sonner';

import { usePublishStory } from '@/hooks/usePublishStory';
import { StorySegmentRow } from '@/types/stories';
import { supabase } from '@/integrations/supabase/client';
import EnhancedSlideshow from './EnhancedSlideshow';
import VoiceSelectorSection from './VoiceSelectorSection';
import StoryTheaterModal from '@/components/StoryTheaterModal';
import FloatingActionBar from '@/components/FloatingActionBar';
import ChapterCard from './ChapterCard';
import EnhancedStorySharing from '@/components/story-display/EnhancedStorySharing';
import { StoryExporter } from '@/utils/storyExporter';

interface UnifiedStoryCompletionProps {
    storyId: string;
    segments: StorySegmentRow[];
    fullStoryAudioUrl?: string;
    audioGenerationStatus?: string;
    isPublic?: boolean;
    onExit?: () => void;
    storyTitle?: string;
    story?: any; // Add story object for video compilation
}

const UnifiedStoryCompletion: React.FC<UnifiedStoryCompletionProps> = ({
    storyId,
    segments,
    fullStoryAudioUrl,
    audioGenerationStatus,
    onExit,
    story
}) => {
    const [showSlideshow, setShowSlideshow] = useState(false);
    const [theaterMode, setTheaterMode] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);
    const firstImage = segments?.[0]?.image_url;
    const [currentAudioUrl, setCurrentAudioUrl] = useState(fullStoryAudioUrl);
    const [currentSegments, setCurrentSegments] = useState(segments);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { publishStory } = usePublishStory();
    
    // Update segments when props change (for real-time updates)
    useEffect(() => {
        setCurrentSegments(segments);
    }, [segments]);

    // Listen for real-time updates on story segments
    useEffect(() => {
        const channel = supabase
            .channel(`story-segments-${storyId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'story_segments',
                    filter: `story_id=eq.${storyId}`
                },
                (payload) => {
                    console.log('🔄 Real-time segment update:', payload);
                    // Update the specific segment in our local state
                    setCurrentSegments(prev => 
                        prev.map(segment => 
                            segment.id === payload.new.id 
                                ? { ...segment, ...payload.new }
                                : segment
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [storyId]);
    
    const publishStoryMutation = usePublishStory();


    const handleAudioGenerated = (audioUrl: string) => {
        setCurrentAudioUrl(audioUrl);
    };


    const handleTheaterMode = () => {
        setTheaterMode(true);
    };

    const handleSlideshowClose = () => {
        setShowSlideshow(false);
    };

    const handlePublishStory = () => {
        if (story?.is_public) {
            // Already published, just show a message
            toast.info('Story is already published to Discover!', {
                action: {
                    label: 'View in Discover',
                    onClick: () => window.open('/discover', '_blank')
                }
            });
        } else {
            // Show confirmation dialog
            setShowPublishConfirm(true);
        }
    };

    const confirmPublishStory = () => {
        publishStoryMutation.mutate(storyId);
        setShowPublishConfirm(false);
    };

    const handleShareStory = () => {
        setShowShareDialog(true);
    };

    const handleDownloadPDF = async () => {
        try {
            toast.info('Generating PDF... This may take a moment.');
            await StoryExporter.exportAsPDF(storyId, story?.title || 'Untitled Story');
            toast.success('PDF-ready file created! Open in browser and print to PDF.');
        } catch (error) {
            console.error('Failed to export PDF:', error);
            toast.error('Failed to export PDF');
        }
    };

    const handleEditStory = () => {
        navigate(`/create`, { 
            state: { 
                resumeStoryId: storyId,
                resumeStoryTitle: story?.title || 'Untitled Story'
            } 
        });
    };
    
    // Create story object for theater modal with audio data
    const storyForTheater = { 
      segments: currentSegments,
      full_story_audio_url: currentAudioUrl || null,
      audio_generation_status: audioGenerationStatus || 'not_started'
    };

    // Check if the story belongs to the current user
    const isUserOwnStory = user && story?.user_id === user.id;

    return (
        <>
            <div className="min-h-screen w-full relative">
                {/* Same beautiful background as landing page */}
                <div className="scene-bg"></div>

                <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>
                        🎉 Story Complete!
                    </h1>
                    <p className="text-lg text-white/90 mb-6" style={{textShadow: '0 1px 2px rgba(0,0,0,0.6)'}}>
                        Your adventure has reached its conclusion! Here's your complete story.
                    </p>
                    {onExit && (
                        <Button
                            onClick={onExit}
                            variant="orange-amber"
                            size="lg"
                            className="font-bold"
                        >
                            ← Back to Home
                        </Button>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Story Content - 2 columns */}
                    <div className="lg:col-span-2">
                        <div className="glass-enhanced backdrop-blur-lg bg-black/30 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-2xl font-bold text-amber-200 mb-6" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>
                                Your Complete Story
                            </h2>
                            <div className="space-y-6">
                                {currentSegments.map((segment, index) => (
                                    <ChapterCard
                                        key={segment.id}
                                        chapter={segment}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actions Sidebar - 1 column */}
                    <div className="lg:col-span-1">
                        <div className="glass-enhanced backdrop-blur-lg bg-black/30 border border-amber-500/30 rounded-2xl p-6 shadow-xl lg:sticky lg:top-24">
                            <h3 className="text-xl font-bold text-amber-200 mb-6" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>
                                Actions
                            </h3>
                            <div className="space-y-4">
                                <Button
                                    onClick={handleTheaterMode}
                                    variant="orange-amber"
                                    size="lg"
                                    className="w-full font-bold"
                                >
                                    ▶️ Watch Story
                                </Button>

                                {/* Voice Generation Section */}
                                <div className="border-t border-amber-500/20 pt-4">
                                    <h4 className="text-sm font-bold text-amber-200 mb-3" style={{textShadow: '0 1px 2px rgba(0,0,0,0.6)'}}>
                                        Add Voice Narration
                                    </h4>
                                    <VoiceSelectorSection
                                        storyId={storyId}
                                        fullStoryAudioUrl={currentAudioUrl}
                                        audioGenerationStatus={audioGenerationStatus}
                                        onAudioGenerated={handleAudioGenerated}
                                    />
                                </div>

                                {/* Edit Button - Only for user's own stories */}
                                {isUserOwnStory && (
                                    <Button
                                        onClick={handleEditStory}
                                        variant="yellow-orange"
                                        size="lg"
                                        className="w-full font-bold"
                                    >
                                        <Edit className="h-5 w-5 mr-2" />
                                        Edit Story
                                    </Button>
                                )}

                                <Button
                                    onClick={handleDownloadPDF}
                                    variant="yellow-orange"
                                    size="lg"
                                    className="w-full font-bold"
                                >
                                    <Download className="h-5 w-5 mr-2" />
                                    Download PDF
                                </Button>

                                <Button
                                    onClick={handleShareStory}
                                    variant="yellow-orange"
                                    size="lg"
                                    className="w-full font-bold"
                                >
                                    <Share2 className="h-5 w-5 mr-2" />
                                    Share Story
                                </Button>

                                {/* Publishing Button - Only for user's own stories */}
                                {isUserOwnStory && (
                                    <Button
                                        onClick={handlePublishStory}
                                        variant="yellow-orange"
                                        size="lg"
                                        className="w-full font-bold"
                                        disabled={publishStoryMutation.isPending}
                                    >
                                        <Globe className="h-5 w-5 mr-2" />
                                        {story?.is_public ? 'Published to Discover' : 'Publish to Discover'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>

            {/* Story Theater Modal */}
            {theaterMode && <StoryTheaterModal story={storyForTheater} onClose={() => setTheaterMode(false)} />}

            {/* Legacy Slideshow Modal */}
            <EnhancedSlideshow
                segments={currentSegments}
                fullStoryAudioUrl={currentAudioUrl || ''}
                isOpen={showSlideshow}
                onClose={handleSlideshowClose}
            />

            {/* Enhanced Story Sharing Dialog */}
            {showShareDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-amber-500/40 rounded-xl p-6 max-w-lg w-full shadow-2xl relative">
                        <button
                            onClick={() => setShowShareDialog(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-2 transition-all duration-200"
                        >
                            ✕
                        </button>
                        <EnhancedStorySharing
                            storyId={storyId}
                            storyTitle={story?.title || 'Untitled Story'}
                            storyDescription={story?.description || 'Check out this amazing story!'}
                            isPublic={story?.is_public || false}
                            onShare={handlePublishStory}
                            inDialog={true}
                        />
                    </div>
                </div>
            )}

            {/* Publish to Discover Confirmation Dialog */}
            {showPublishConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-amber-500/40 rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <div className="text-center">
                            <div className="text-4xl mb-4">🌟</div>
                            <h3 className="text-2xl font-bold text-amber-200 mb-4">Publish to Discover?</h3>
                            <p className="text-slate-300 mb-6 leading-relaxed">
                                Your story will be added to the public <strong className="text-amber-300">Discover</strong> library where everyone can read and enjoy it.
                                This helps build our community of storytellers!
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowPublishConfirm(false)}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={confirmPublishStory}
                                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold"
                                    disabled={publishStoryMutation.isPending}
                                >
                                    {publishStoryMutation.isPending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            <Globe className="h-4 w-4 mr-2" />
                                            Publish to Discover
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UnifiedStoryCompletion;
