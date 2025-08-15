import { useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { CostConfirmationDialog } from '@/components/CostConfirmationDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';

// Import refactored components
import ErrorDisplay from '@/components/story-display/ErrorDisplay';
import StoryDisplayLayout from '@/components/story-display/StoryDisplayLayout';
import StoryDisplayLoadingState from '@/components/story-display/StoryDisplayLoadingState';
import StoryCompletionHandler from '@/components/story-display/StoryCompletionHandler';
import StoryMainContent from '@/components/story-display/StoryMainContent';

// Import custom hooks
import { useStoryDisplay } from '@/hooks/useStoryDisplay';
import { useStoryChapterNavigation } from '@/hooks/useStoryDisplay/useStoryChapterNavigation';

// Import performance optimizations
import { 
  useMemoizedCallback
} from '@/utils/performanceOptimizations';

// Import enhanced error handling
// Enhanced error handler removed

const StoryDisplay: React.FC = () => {
  const { user } = useAuth();
  
  // Enhanced error handling
  // Enhanced error handling removed
  
  const {
    // State
    currentStorySegment,
    allStorySegments,
    segmentCount,
    skipImage,
    error,
    showHistory,
    viewMode,
    
    // Story generation state
    storyGeneration,
    showCostDialog,
    pendingAction,
    
    // Story data
    storyData,
    
    // URL params
    prompt,
    id, // Story ID from URL params
    
    // Actions
    setSkipImage,
    setError,
    setViewMode,
    setShowCostDialog,
    confirmGeneration,
    handleChoiceSelect,
    handleFinishStory,
    refreshStoryData,
    setCurrentStorySegment, // Add this for the global event listener
    showConfirmation,
    
    // Navigation - we'll modify this to avoid URL changes
    navigate
  } = useStoryDisplay();

  // Use the chapter navigation hook
  const { currentChapterIndex, handleChapterChange } = useStoryChapterNavigation(allStorySegments);

  // Global event listener for real-time image updates
  useEffect(() => {
    // Define the function that will handle the event
    const handleImageUpdate = (event: CustomEvent) => {
      const { segmentId, imageUrl } = event.detail;

      console.log(`🎨 Global event caught! Segment ${segmentId} has a new image.`);

      // Check if the update is for the segment we are currently viewing
      if (currentStorySegment && segmentId === currentStorySegment.id) {
        console.log('✨ It is for our current segment! Updating state and forcing re-render.');
        
        // CRITICAL: Create a NEW object to trigger React's re-render
        setCurrentStorySegment(prevSegment => {
          if (!prevSegment) return null;
          return {
            ...prevSegment,
            image_url: imageUrl,
            image_generation_status: 'completed', // Also update the status
          };
        });
      }
    };

    // Add the event listener when the component mounts
    window.addEventListener('story-image-updated', handleImageUpdate as EventListener);

    // IMPORTANT: Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('story-image-updated', handleImageUpdate as EventListener);
    };
  }, [currentStorySegment, setCurrentStorySegment]);

  // Memoized values for performance
  const storyTitle = useMemo(() => {
    return allStorySegments.length > 0 
      ? allStorySegments[0].segment_text.substring(0, 50) + '...' 
      : prompt.substring(0, 50) + '...';
  }, [allStorySegments, prompt]);

  const isStoryCompleted = useMemo(() => {
    return storyData?.is_completed || currentStorySegment?.is_end || allStorySegments.some(segment => segment.is_end);
  }, [storyData?.is_completed, currentStorySegment?.is_end, allStorySegments]);

  const shouldShowFullLoadingState = useMemo(() => {
    return storyGeneration.isGenerating && allStorySegments.length === 0 && !currentStorySegment;
  }, [storyGeneration.isGenerating, allStorySegments.length, currentStorySegment]);

  const metaTitle = `${storyTitle} | Tale Forge`;
  const metaDesc = `Interactive children's story — ${prompt.substring(0, 140)}...`;
  const canonical = typeof window !== 'undefined' ? window.location.href : `https://tale-forge.io/story/${id}`;

  // Debug logging removed to prevent infinite re-renders

  // Optimized callbacks with performance monitoring
  const handleSwitchToPlayer = useMemoizedCallback(async () => {
    console.log('🎬 Switching to player mode...');
    setViewMode('player');
  }, [setViewMode]);

  const handleSwitchToCreate = useMemoizedCallback(async () => {
    console.log('✏️ Switching to create mode...');
    setViewMode('create');
  }, [setViewMode]);

  useMemoizedCallback((index: number) => {
    console.log('Chapter navigated to:', index);
  }, []);

  useMemoizedCallback(async (_newAudioUrl: string) => {
    console.log('🎵 Audio generation completed, refreshing story data...');
    await refreshStoryData();
  }, [refreshStoryData]);

  // Handle save story functionality with error handling
  useMemoizedCallback(async () => {
    if (!id || !allStorySegments.length) {
      toast.error('No story to save');
      return;
    }

    try {
      // For authenticated users, check if story already exists in database
      if (user) {
        console.log('🔐 Authenticated user saving story:', id);
        
        // Check if story exists in database
        const { data: existingStory, error: checkError } = await supabase
          .from('stories')
          .select('id, user_id')
          .eq('id', id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingStory) {
          // Story exists - update user ownership if needed
          if (!existingStory.user_id) {
            const { error: updateError } = await supabase
              .from('stories')
              .update({ user_id: user.id })
              .eq('id', id);
            
            if (updateError) throw updateError;
            toast.success('Story saved to your account! 📖');
          } else {
            toast.success('Story is already in your library! 📚');
          }
        } else {
          // Story doesn't exist in database - create it
          const storyTitle = allStorySegments[0]?.segment_text?.substring(0, 100) + '...' || 'Untitled Story';
          
          const { error: createError } = await supabase
            .from('stories')
            .insert({
              id: id,
              title: storyTitle,
              user_id: user.id,
              is_completed: allStorySegments.some(s => s.is_end),
              segment_count: allStorySegments.length
            });
          
          if (createError) throw createError;
          toast.success('Story saved to your account! 📖');
        }
      } else {
        // For anonymous users, save to local storage
        console.log('👤 Anonymous user saving story locally:', id);
        
        const existingIds = JSON.parse(localStorage.getItem('anonymous_story_ids') || '[]');
        if (!existingIds.includes(id)) {
          existingIds.push(id);
          localStorage.setItem('anonymous_story_ids', JSON.stringify(existingIds));
          toast.success('Story saved locally! Sign up to save permanently. 💾');
        } else {
          toast.success('Story already saved locally! 📚');
        }
      }
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error('Failed to save story');
    }
  }, [id, allStorySegments, user]);

  // Handle exit without creating new URLs - go to home instead
  const handleExit = useMemoizedCallback(() => {
    console.log('🚪 Exiting story, navigating to home');
    // Clear any story state and go to home
    navigate('/', { replace: true });
  }, [navigate]);

  // Show error state
  if (error && !storyGeneration.isGenerating) {
    return (
      <ErrorDisplay 
        error={error}
        onRetry={() => setError(null)}
        onExit={handleExit}
      />
    );
  }

  if (shouldShowFullLoadingState) {
    return (
      <StoryDisplayLoadingState
        onExit={handleExit}
      />
    );
  }

  // Show start story button if no story content exists yet
  if (storyData?.id && allStorySegments.length === 0 && !currentStorySegment && !storyGeneration.isGenerating) {
    return (
      <StoryDisplayLayout>
        <Helmet>
          <title>{metaTitle}</title>
          <meta name="description" content={metaDesc} />
          <link rel="canonical" href={canonical} />
        </Helmet>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-2xl mx-auto p-8">
            <div className="mb-8">
              <h1 className="fantasy-heading text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Begin Your Adventure?
              </h1>
              <p className="fantasy-subtitle text-lg text-gray-300 mb-6">
                Your story seed is planted and ready to grow! Click the button below to start generating your magical tale.
              </p>
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 mb-6">
                <p className="text-amber-300 font-medium mb-2">Story Prompt:</p>
                <p className="text-white italic">"{prompt}"</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => showConfirmation('start')}
                className="fantasy-heading bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                🌱 Start Your Story
              </button>
              
              <button
                onClick={handleExit}
                className="fantasy-heading block mx-auto mt-4 text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
        
        <CostConfirmationDialog
          open={showCostDialog}
          onOpenChange={setShowCostDialog}
          onConfirm={confirmGeneration}
          pendingAction={pendingAction}
        />
      </StoryDisplayLayout>
    );
  }

  return (
    <StoryDisplayLayout>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Show unified completion interface if story is completed */}
      {storyData?.id && (
        <StoryCompletionHandler
          isStoryCompleted={isStoryCompleted}
          storyId={storyData.id}
          allStorySegments={allStorySegments}
          fullStoryAudioUrl={storyData?.full_story_audio_url || null}
          audioGenerationStatus={storyData?.audio_generation_status || 'not_started'}
          isPublic={storyData?.is_public || false}
          onExit={handleExit}
        />
      )}

      {/* Show main content if story is not completed */}
      {!isStoryCompleted && storyData?.id && (
        <StoryMainContent
          viewMode={viewMode}
          allStorySegments={allStorySegments}
          currentStorySegment={currentStorySegment}
          currentChapterIndex={currentChapterIndex}
          segmentCount={segmentCount}
          // maxSegments prop removed
          showHistory={showHistory}
          // audioPlaying prop removed
          isGenerating={storyGeneration.isGenerating}
          prompt={prompt}
          storyId={storyData.id}
          storyTitle={storyTitle}
          narrationAudioUrl={storyData?.full_story_audio_url || null}
          isStoryCompleted={isStoryCompleted}
          onSwitchToCreate={handleSwitchToCreate}
          onSwitchToPlayer={handleSwitchToPlayer}
          onChapterChange={handleChapterChange}
          // onToggleHistory prop removed
          // onToggleAudio prop removed
          onChoiceSelect={handleChoiceSelect}
          onFinishStory={handleFinishStory}
          // onChapterNavigate prop removed
          // onAudioGenerated prop removed
          skipImage={skipImage}
          onSkipImageChange={setSkipImage}
        />
      )}

      <CostConfirmationDialog
        open={showCostDialog}
        onOpenChange={setShowCostDialog}
        onConfirm={confirmGeneration}
        pendingAction={pendingAction}
      />
    </StoryDisplayLayout>
  );
};

export default StoryDisplay;
