

import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useOptimizedStoryViewer } from '@/hooks/useOptimizedStoryViewer';
import StoryHeader from '@/components/story-viewer/StoryHeader';
import StoryContinuation from '@/components/story-viewer/StoryContinuation';
import StoryRealtimeStatus from '@/components/story-viewer/StoryRealtimeStatus';
import StoryFullAudioPlayer from '@/components/story-viewer/StoryFullAudioPlayer';
import UnifiedStoryCompletion from '@/components/story-viewer/UnifiedStoryCompletion';
import { Button } from '@/components/ui/button';

const StoryViewer = () => {
    const {
        story,
        isLoading,
        error,
        segments,
        lastSegment,
        canContinue,
        handleSelectChoice,
        handlePublish,
        handleManualRefresh,
        mutation,
        publishMutation,
        realtimeStatus,
        connectionHealth,
        refetchStory,
    } = useOptimizedStoryViewer();

    console.log('StoryViewer Debug:', {
        storyId: story?.id,
        isCompleted: story?.is_completed,
        isPublic: story?.is_public,
        audioStatus: story?.audio_generation_status,
        segmentsCount: segments?.length,
        realtimeStatus,
        connectionHealth,
    });

    if (isLoading) {
        console.log('[GS:LOG] LoadingState:render=LoadingOverlay');
        return <LoadingOverlay message="Loading your magical story..." />;
    }

    if (error) {
        return (
            <div className="text-destructive text-center p-8">
                <h2 className="text-xl font-semibold mb-2">Unable to Load Story</h2>
                <p className="text-gray-300">Something went wrong while loading your story. Please try refreshing the page.</p>
            </div>
        );
    }
    
    if (!story) {
        return <div className="text-center p-8">Story not found.</div>;
    }
    
    return (
        <div className="min-h-screen w-full relative">
            {/* Same beautiful background as landing page */}
            <div className="scene-bg"></div>

            <div className="relative z-10 container mx-auto p-4 md:p-6">
            <StoryRealtimeStatus
                realtimeStatus={realtimeStatus}
                connectionHealth={connectionHealth}
                refetchStory={refetchStory}
                onManualRefresh={handleManualRefresh}
                isLoading={isLoading}
            />

            <StoryHeader 
                story={story}
                onPublish={handlePublish}
                isPublishing={publishMutation.isPending}
            />
            
            <StoryFullAudioPlayer story={story} />

            {/* Two-Column Layout for Story Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
                
                {/* LEFT COLUMN: MAIN STORY CANVAS */}
                <div className="lg:col-span-8">
                    <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl p-6 md:p-8 shadow-xl">
                        
                        {/* --- Top Controls --- */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                            <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 px-3 py-1 rounded-full w-full sm:w-auto text-center">
                                <span className="text-sm font-medium text-white" style={{textShadow: '0 1px 2px rgba(0,0,0,0.6)'}}>STORY PROGRESSION: {segments?.length || 0}/8</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button disabled className="text-sm font-semibold text-slate-500 cursor-not-allowed">HIDE HISTORY</button>
                                <button disabled className="text-sm font-semibold text-slate-500 cursor-not-allowed">PLAY STORY</button>
                            </div>
                        </div>

                        {/* --- Chapter Title (Thematic Font) --- */}
                        <h1 className="font-['Cinzel'] text-3xl md:text-4xl text-center font-bold text-white mb-4" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>
                            CHAPTER {segments?.length || 0}
                        </h1>

                        {/* --- Story Text (Readable Sans-Serif, Larger Size) --- */}
                        {lastSegment && (
                            <p className="text-base md:text-lg text-white leading-relaxed mb-6" style={{textShadow: '0 1px 2px rgba(0,0,0,0.6)'}}>
                                {lastSegment.segment_text}
                            </p>
                        )}

                        {/* --- Image --- */}
                        {lastSegment && lastSegment.image_url && (
                            <div className="w-full aspect-video rounded-xl overflow-hidden mb-8 glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 flex items-center justify-center">
                                <img src={lastSegment.image_url} alt="Story Illustration" className="w-full h-full object-cover" />
                            </div>
                        )}

                        {/* --- Choices Section --- */}
                        {!story.is_completed && lastSegment && lastSegment.choices && (
                            <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl p-6">
                                <h2 className="text-lg font-semibold text-center text-white mb-1" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>What Happens Next?</h2>
                                <p className="text-sm text-white/70 text-center mb-4" style={{textShadow: '0 1px 2px rgba(0,0,0,0.6)'}}>Choose your path and continue the adventure!</p>

{/* CHOICE-INTEGRITY: one-line renderer source/version log */}
                                {(() => {
                                  if (typeof window !== 'undefined' && lastSegment?.id) {
                                    const meta = (window as any).__CHOICE_META__?.[lastSegment.id];
                                    console.info('[CHOICE_RENDER]', { choices: lastSegment.choices, source: meta?.source, engineVersion: meta?.engineVersion });
                                  }
                                  return null;
                                })()}

                                {/* Dev-only diagnostics button */}
                                {(typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') && (
                                  <div className="text-right mb-2">
                                    <button
                                      onClick={() => {
                                        const flows = (window as any).__CHOICE_FLOWS__ || [];
                                        console.log('[CHOICE_DIAGNOSTICS] last 3 choice flows:', flows);
                                        try {
                                          console.table(flows.map((f: any) => ({
                                            time: f.timestamp,
                                            segmentId: f.segmentId,
                                            source: f.source,
                                            engine: f.engineVersion,
                                            valid: f.validationPassed
                                          })));
                                        } catch (_e) {
                                          // Swallow console.table incompatibility in some environments
                                        }
                                      }}
                                      className="text-xs text-slate-300 underline"
                                    >
                                      Dev: Choice diagnostics
                                    </button>
                                  </div>
                                )}
                                <div className="space-y-3">
                                    {lastSegment.choices.map((choice: string, index: number) => (
                                        <Button
                                            key={index}
                                            onClick={() => {
                                                console.log('Choice selected:', choice);
                                                handleSelectChoice && handleSelectChoice();
                                            }}
                                            disabled={mutation.isPending}
                                            variant="secondary"
                                            className="w-full text-left p-4 h-auto justify-start"
                                        >
                                            <span className="font-medium text-white">
                                                <span className="text-amber-400 mr-2">{index + 1}.</span>
                                                {choice}
                                            </span>
                                        </Button>
                                    ))}
                                </div>
                                
                                <div className="flex items-center justify-center mt-6">
                                    <input type="checkbox" id="skip-image-gen" className="h-4 w-4 rounded bg-slate-700 border-slate-500 text-yellow-500 focus:ring-yellow-500" />
                                    <label htmlFor="skip-image-gen" className="ml-2 text-sm text-slate-300">Skip image generation for next segment</label>
                                </div>
                            </div>
                        )}

                        {/* Show continuation only if story is not completed */}
                        {!story.is_completed && (
                            <StoryContinuation
                                lastSegment={lastSegment}
                                canContinue={canContinue}
                                onSelectChoice={handleSelectChoice}
                                isLoading={mutation.isPending}
                            />
                        )}

                        {/* Show unified completion section when story is completed */}
                        {story.is_completed && (
                            <UnifiedStoryCompletion
                                storyId={story.id}
                                segments={segments}
                                fullStoryAudioUrl={story.full_story_audio_url || ''}
                                audioGenerationStatus={story.audio_generation_status || 'not_started'}
                                isPublic={story.is_public || false}
                                storyTitle={story.title || 'Untitled Story'}
                                story={story}
                            />
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: UNIFIED STORY LOG SIDEBAR */}
                <div className="lg:col-span-4">
                    <div className="bg-slate-800/50 border border-yellow-500/20 rounded-xl p-6 shadow-lg backdrop-blur-sm lg:sticky lg:top-24">
                        
                        {/* New Unified Title */}
                        <h2 className="font-['Cinzel'] text-2xl text-yellow-400 mb-4">Story Log</h2>

                        {/* STATS SECTION (No longer in a separate box) */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6 border-b border-yellow-500/10 pb-6">
                            <div className="text-left">
                                <span className="text-2xl font-semibold text-white">{segments?.length || 0}</span>
                                <p className="text-sm text-slate-400">Chapters</p>
                            </div>
                            <div className="text-left">
                                <span className="text-2xl font-semibold text-white">
                                    {segments?.reduce((total, segment) => total + (segment.segment_text?.split(' ').length || 0), 0) || 0}
                                </span>
                                <p className="text-sm text-slate-400">Words</p>
                            </div>
                        </div>

                        {/* HISTORY LIST */}
                        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {segments?.slice().reverse().map((segment, index) => (
                                <div key={segment.id} className="p-3 bg-slate-900/60 rounded-lg border-l-4 border-yellow-500/50">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-semibold text-white">Chapter {segments.length - index}</h3>
                                        {lastSegment && segment.id === lastSegment.id && (
                                            <span className="text-xs bg-green-500/20 text-green-300 font-medium px-2 py-0.5 rounded-full">Current</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-300 line-clamp-2">
                                        {segment.segment_text}
                                    </p>
                                    <div className="text-xs text-slate-400 mt-2">{segment.segment_text?.split(' ').length || 0} words</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default StoryViewer;
