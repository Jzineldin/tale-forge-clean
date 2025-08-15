
import React from 'react';
import { StoryWithSegments } from '@/types/stories';
import AudioPlayer from '@/components/AudioPlayer';


import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
interface StoryFullAudioPlayerProps {
    story: StoryWithSegments;
}

const StoryFullAudioPlayer: React.FC<StoryFullAudioPlayerProps> = ({ story }) => {
    // Only show this component if the story is completed AND has audio but is NOT being shown in StoryCompletionControls
    // StoryCompletionControls handles the audio display for completed stories
    if (story.is_completed) {
        return null;
    }

    if (story.audio_generation_status === 'in_progress') {
        return (
            <div className="my-6 p-4 border rounded-lg flex items-center justify-center gap-3 bg-secondary/50 animate-pulse">
                <LoadingSpinner size="sm" className="h-5 w-5 " />
                <span className="text-muted-foreground">The full story audio is being generated... It will appear here when ready.</span>
            </div>
        );
    }

    if (story.audio_generation_status === 'completed' && story.full_story_audio_url) {
        return (
            <div className="my-6">
                <h2 className="text-xl font-semibold mb-3">Listen to the Full Story</h2>
                <AudioPlayer src={story.full_story_audio_url} />
            </div>
        );
    }
    
    if (story.audio_generation_status === 'failed') {
        return (
            <div className="my-6 p-4 border rounded-lg flex items-center justify-center gap-3 bg-destructive/20 text-destructive-foreground">
                <span>Audio generation failed. Please try again later.</span>
            </div>
        );
    }

    return null;
};

export default StoryFullAudioPlayer;
