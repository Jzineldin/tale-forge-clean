
import React, { useState } from 'react';
import { Story } from '@/types/stories';
import { Button } from '@/components/ui/button';
import { VoiceSelector } from '@/components/VoiceSelector';
import { useGenerateFullStoryAudio } from '@/hooks/useGenerateFullStoryAudio';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic } from 'lucide-react';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
interface StoryGenerationManagerProps {
    story: Story;
}

const StoryGenerationManager: React.FC<StoryGenerationManagerProps> = ({ story }) => {
    const [selectedVoice, setSelectedVoice] = useState('jbHveVx08UsDYum4fcml'); // Default to Kevin - Founder
    
    const generateAudioMutation = useGenerateFullStoryAudio();

    const handleGenerateAudio = () => generateAudioMutation.mutate({ storyId: story.id, voiceId: selectedVoice });

    const isAnyJobRunning = generateAudioMutation.isPending;

    const canGenerateAudio = story.audio_generation_status === 'not_started' || story.audio_generation_status === 'failed';

    // Only show this component if the story is completed and audio hasn't been generated yet
    // This prevents duplicate voice selectors
    if (!story.is_completed || !canGenerateAudio || story.audio_generation_status === 'in_progress') {
        return null;
    }

    return (
        <Card className="my-6">
            <CardHeader>
                <CardTitle>Generate Audio Narration</CardTitle>
                <CardDescription>Your story is complete! Now you can generate audio narration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4 p-4 border rounded-lg bg-secondary/30">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Mic className="h-5 w-5" />Select Voice for Narration</h3>
                    <p className="text-sm text-muted-foreground">
                        Choose a voice for the complete story narration.
                    </p>
                    {story.audio_generation_status === 'failed' && <p className="text-sm text-destructive">Previous audio generation failed. Please try again.</p>}
                    <VoiceSelector selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice} disabled={!canGenerateAudio || isAnyJobRunning} />
                    <Button 
                        onClick={handleGenerateAudio} 
                        disabled={!canGenerateAudio || isAnyJobRunning}
                        className="w-full"
                        size="lg"
                    >
                        {generateAudioMutation.isPending ? <><LoadingSpinner size="sm" className="mr-2 h-4 w-4 " /> Generating Audio...</> : 'Generate Audio Narration'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
export default StoryGenerationManager;
