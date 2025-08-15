
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VoiceSelector } from '@/components/VoiceSelector';
import { useGenerateFullStoryAudio } from '@/hooks/useGenerateFullStoryAudio';
import { Download, Share2, Globe } from 'lucide-react';
import { StorySegmentRow } from '@/types/stories';
import AudioPlayer from '@/components/AudioPlayer';
import StorySlideshow from './StorySlideshow';
import StoryTheaterModal from '@/components/StoryTheaterModal';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
interface StoryCompletionSectionProps {
    storyId: string;
    segments: StorySegmentRow[];
    fullStoryAudioUrl?: string;
    audioGenerationStatus?: string;
}

const StoryCompletionSection: React.FC<StoryCompletionSectionProps> = ({
    storyId,
    segments,
    fullStoryAudioUrl,
    audioGenerationStatus
}) => {
    const [selectedVoice, setSelectedVoice] = useState('jbHveVx08UsDYum4fcml'); // Default to Kevin - Founder
    const [showSlideshow, setShowSlideshow] = useState(false);
    const [theaterMode, setTheaterMode] = useState(false);
    const generateAudioMutation = useGenerateFullStoryAudio();

    const handleGenerateVoice = () => {
        generateAudioMutation.mutate({ storyId, voiceId: selectedVoice });
    };


    const handleTheaterMode = () => {
        setTheaterMode(true);
    };

    const isGenerating = generateAudioMutation.isPending || audioGenerationStatus === 'in_progress';
    const hasAudio = audioGenerationStatus === 'completed' && fullStoryAudioUrl;
    const canGenerate = !isGenerating && (!audioGenerationStatus || audioGenerationStatus === 'not_started' || audioGenerationStatus === 'failed');


    // Create story object for theater modal
    const story = { segments };

    return (
        <>
            <div className="container mx-auto px-4 py-12 text-white">
                {/* 1. HERO SECTION */}
                <div className="text-center mb-12">
                    <h1 className="font-['Cinzel'] text-5xl font-bold text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]">
                        Story Complete!
                    </h1>
                    <p className="text-lg text-gray-300 mt-2">
                        Your adventure has concluded. Behold the masterpiece you have forged.
                    </p>
                    <button className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-6 rounded-lg transition-transform duration-200 hover:scale-105">
                        Back to Home
                    </button>
                </div>

                {/* 2. TWO-COLUMN LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    
                    {/* LEFT COLUMN: STORY SHOWCASE */}
                    <div className="md:col-span-3">
                        <div className="bg-slate-800/50 border border-yellow-500/20 rounded-xl p-6 shadow-lg backdrop-blur-sm">
                            <h2 className="font-['Cinzel'] text-2xl text-yellow-400 mb-4">Your Complete Story</h2>
                            <div className="space-y-4">
                                {segments.map((segment, index) => (
                                    <div key={segment.id} className="p-4 bg-slate-900/60 rounded-lg">
                                        <p className="font-bold">Chapter {index + 1}</p>
                                        <p className="text-gray-300 text-sm">{segment.segment_text.substring(0, 150)}...</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: ACTION HUB */}
                    <div className="md:col-span-2">
                        <div className="bg-slate-800/50 border border-yellow-500/20 rounded-xl p-6 shadow-lg backdrop-blur-sm sticky top-24">
                            <h2 className="font-['Cinzel'] text-2xl text-yellow-400 mb-6">What's Next?</h2>
                            
                            {/* Experience Section */}
                            <div className="mb-6">
                                <h3 className="font-bold text-lg mb-2">Experience Your Story</h3>
                                <p className="text-sm text-gray-400 mb-3">Watch your story as an immersive slideshow with narration.</p>
                                <button onClick={handleTheaterMode} className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                                    ▶️ Watch Your Story
                                </button>
                            </div>

                            {/* Narration Section */}
                            <div className="mb-6">
                                <h3 className="font-bold text-lg mb-2">Story Narration</h3>
                                {canGenerate && (
                                    <div className="space-y-3">
                                        <VoiceSelector 
                                            selectedVoice={selectedVoice} 
                                            onVoiceChange={setSelectedVoice}
                                        />
                                        <Button 
                                            onClick={handleGenerateVoice}
                                            disabled={isGenerating}
                                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <LoadingSpinner size="sm" className="mr-2 h-4 w-4" />
                                                    Generating...
                                                </>
                                            ) : (
                                                '🎙️ Generate Voice'
                                            )}
                                        </Button>
                                    </div>
                                )}
                                {hasAudio && (
                                    <div className="mt-3">
                                        <AudioPlayer src={fullStoryAudioUrl} />
                                    </div>
                                )}
                            </div>
                            
                            {/* Save & Share Section */}
                            <div className="mb-6">
                                <h3 className="font-bold text-lg mb-2">Save & Share</h3>
                                <div className="flex gap-4">
                                    <button className="flex-1 bg-green-600 hover:bg-green-700 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                                        <Download className="h-4 w-4" />
                                        Download
                                    </button>
                                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                                        <Share2 className="h-4 w-4" />
                                        Share Link
                                    </button>
                                </div>
                            </div>
                            
                            {/* Publish Section */}
                            <div>
                                <h3 className="font-bold text-lg mb-2">Publish to Discover</h3>
                                <p className="text-sm text-gray-400 mb-3">Share your masterpiece with the world!</p>
                                <button className="w-full bg-orange-600 hover:bg-orange-700 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Publish Story
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Story Theater Modal */}
            {theaterMode && <StoryTheaterModal story={story} onClose={() => setTheaterMode(false)} />}

            {/* Legacy Slideshow Modal */}
            <StorySlideshow
                segments={segments}
                fullStoryAudioUrl={fullStoryAudioUrl || ''}
                isOpen={showSlideshow}
                onClose={() => setShowSlideshow(false)}
            />
        </>
    );
};

export default StoryCompletionSection;
