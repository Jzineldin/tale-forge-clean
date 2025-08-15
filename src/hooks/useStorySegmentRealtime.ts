
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
  table: string;
}

interface StorySegmentUpdate {
  id: string;
  image_url?: string;
  image_generation_status?: string;
  audio_url?: string;
  audio_generation_status?: string;
  choices?: string[];
  [key: string]: unknown;
}

export const useStorySegmentRealtime = (segmentId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Don't set up subscription for fallback or invalid segment IDs
    if (!segmentId || segmentId === 'fallback') {
      return;
    }

    console.log(`[Realtime] Setting up subscription for segment: ${segmentId}`);

    const channel = supabase
      .channel(`story_segment_${segmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'story_segments',
          filter: `id=eq.${segmentId}`,
        },
        (payload: RealtimePayload) => {
          console.log(`[Realtime] Segment ${segmentId} updated:`, {
            eventType: payload.eventType,
            newData: payload.new,
            oldData: payload.old,
            table: payload.table
          });
          
          const updatedSegment = payload.new as StorySegmentUpdate;
          
          console.log(`[Realtime] Processing update for segment ${segmentId}:`, {
            hasImageUrl: !!updatedSegment.image_url,
            imageGenerationStatus: updatedSegment.image_generation_status,
            hasChoices: !!(updatedSegment.choices && updatedSegment.choices.length > 0),
            choicesCount: updatedSegment.choices?.length || 0,
            choices: updatedSegment.choices
          });
          
          // Only invalidate specific queries, not the entire story
          // This prevents choices from being lost during image updates
          queryClient.invalidateQueries({ 
            queryKey: ['story_segment', segmentId] 
          });
          
          // Update the story query cache directly instead of invalidating
          // This preserves existing data while updating only changed fields
          queryClient.setQueryData(
            ['story', updatedSegment.story_id],
            (oldData: any) => {
              if (!oldData) {
                console.log(`[Realtime] No existing data for story ${updatedSegment.story_id}`);
                return oldData;
              }
              
              console.log(`[Realtime] Updating cache for story ${updatedSegment.story_id}:`, {
                existingSegmentsCount: oldData.story_segments?.length || 0,
                targetSegmentId: segmentId
              });
              
              // Update only the specific segment that changed, preserving existing choices
              const updatedSegments = oldData.story_segments?.map((segment: any) => {
                if (segment.id === segmentId) {
                  // PATCH: Preserve existing choices if new data doesn't have them
                  const existingChoices = segment.choices || [];
                  const newChoices = updatedSegment.choices || [];
                  
                  // CRITICAL FIX: Only use new choices if they actually exist and are not empty
                  // If the real-time update doesn't include choices (like image updates), keep existing ones
                  const preservedChoices = (newChoices && newChoices.length > 0) ? newChoices : existingChoices;
                  
                  console.log(`[Realtime] Merging segment data for ${segmentId}:`, {
                    existingChoices,
                    newChoices,
                    preservedChoices,
                    willPreserve: (newChoices && newChoices.length > 0) ? false : true,
                    reason: (newChoices && newChoices.length > 0) ? 'new choices provided' : 'no new choices, preserving existing'
                  });
                  
                  // Only update fields that are actually provided in the update
                  const mergedSegment = { ...segment };
                  
                  // Update image-related fields if provided
                  if (updatedSegment.image_url !== undefined) {
                    mergedSegment.image_url = updatedSegment.image_url;
                  }
                  if (updatedSegment.image_generation_status !== undefined) {
                    mergedSegment.image_generation_status = updatedSegment.image_generation_status;
                  }
                  if (updatedSegment.audio_url !== undefined) {
                    mergedSegment.audio_url = updatedSegment.audio_url;
                  }
                  if (updatedSegment.audio_generation_status !== undefined) {
                    mergedSegment.audio_generation_status = updatedSegment.audio_generation_status;
                  }
                  
                  // Always preserve choices (either existing or new)
                  mergedSegment.choices = preservedChoices;
                  
                  return mergedSegment;
                }
                return segment;
              }) || [];
              
              const result = {
                ...oldData,
                story_segments: updatedSegments
              };
              
              console.log(`[Realtime] Cache update completed for story ${updatedSegment.story_id}:`, {
                updatedSegmentsCount: result.story_segments?.length || 0,
                targetSegmentChoices: result.story_segments?.find((s: any) => s.id === segmentId)?.choices,
                targetSegmentImageUrl: result.story_segments?.find((s: any) => s.id === segmentId)?.image_url
              });
              
              return result;
            }
          );
        }
      )
      .subscribe();

    return () => {
      console.log(`[Realtime] Cleaning up subscription for segment: ${segmentId}`);
      supabase.removeChannel(channel);
    };
  }, [segmentId, queryClient]);
};
