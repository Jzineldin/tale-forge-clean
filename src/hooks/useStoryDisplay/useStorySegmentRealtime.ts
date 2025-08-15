
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StorySegment } from './types';
import { useConnectionHealth } from '@/hooks/realtime/useConnectionHealth';
import { usePollingManager } from '@/hooks/realtime/usePollingManager';

// CHOICE-INTEGRITY: client-side validation helpers for realtime merge policy
const CHOICE_GENERIC_RE = /(path|way|clue|guide)\b/i;
const CHOICE_GENERIC_VERBS = ['explore','investigate','follow','continue','go','look','search','enter','proceed','walk','run','discover'];

function extractStoryElementsForChoicesRT(text: string) {
  const characters = Array.from(new Set((text.match(/\b[A-Z][a-z]{2,}\b/g) || [])
    .filter(w => !['The','And','But','Then','When','Where','What','Who','How','Why'].includes(w))
  ));
  const objects = Array.from(new Set(
    (text.match(/\b(?:the|a|an)\s+([a-z]{3,})\b/gi) || [])
      .map(m => m.replace(/^(?:the|a|an)\s+/i, '').toLowerCase())
  ));
  const locationWords = ['castle','tower','house','cottage','cave','forest','woods','meadow','field','garden','village','town','city','kingdom','room','hall','chamber','bridge','road','path','trail','clearing','glade','grove','river','lake','mountain','valley'];
  const locations = Array.from(new Set(
    (text.match(new RegExp(`\\b(?:in|at|to|from|near|by|behind|under|over)\\s+(?:the|a|an)?\\s+(${locationWords.join('|')})\\b`, 'gi')) || [])
      .map(m => m.replace(/^(?:in|at|to|from|near|by|behind|under|over)\\s+(?:the|a|an)?\\s+/i, '').toLowerCase())
  ));
  return { characters, objects, locations };
}

function isSingleVerbOrGenericTwoWordRT(choice: string): boolean {
  const c = String(choice || '').replace(/[.!?]$/,'').trim();
  const words = c.split(/\\s+/);
  if (words.length === 1) return true;
  if (words.length <= 3) {
    const first = words[0].toLowerCase();
    const rest = words.slice(1).join(' ').toLowerCase();
    const last = words[words.length-1].toLowerCase();
    if (CHOICE_GENERIC_VERBS.includes(first) && ['path','way','clue','guide'].includes(last)) return true;
    if (CHOICE_GENERIC_VERBS.includes(first) && /^(?:the\\s+)?(path|way|clue|guide)$/.test(rest)) return true;
  }
  return false;
}

function containsForbiddenGenericTermsRT(choice: string, storyText: string): boolean {
  const lower = choice.toLowerCase();
  if (!CHOICE_GENERIC_RE.test(lower)) return false;
  // allow "Guide" as proper name
  if (/\\bGuide\\b/.test(choice) && !/\\bthe Guide\\b/i.test(choice)) return false;
  const el = extractStoryElementsForChoicesRT(storyText || '');
  const tokens = new Set([...el.characters, ...el.objects, ...el.locations].map(s => s.toLowerCase()));
  const words = lower.split(/\\s+/);
  const bound = words.some(w => tokens.has(w));
  return !bound;
}

function validateChoiceSetContractRT(storyText: string, choices: string[] | null | undefined): boolean {
  if (!Array.isArray(choices) || choices.length !== 3) return false;
  for (const ch of choices) {
    if (!ch || typeof ch !== 'string') return false;
    if (isSingleVerbOrGenericTwoWordRT(ch)) return false;
    if (containsForbiddenGenericTermsRT(ch, storyText)) return false;
  }
  return true;
}

interface UseStorySegmentRealtimeProps {
  storyId: string;
  currentStorySegment: StorySegment | null;
  setCurrentStorySegment: (segment: StorySegment) => void;
  setAllStorySegments: React.Dispatch<React.SetStateAction<StorySegment[]>>;
  onSegmentUpdate?: (segment: StorySegment) => void; // Add callback for direct communication
}

export const useStorySegmentRealtime = ({
  storyId,
  currentStorySegment,
  setCurrentStorySegment,
  setAllStorySegments,
  onSegmentUpdate
}: UseStorySegmentRealtimeProps) => {
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use enhanced connection health and polling
  const connectionHealth = useConnectionHealth();
  const pollingManager = usePollingManager(storyId);

  const handleRealtimeUpdate = useCallback((payload: any) => {
    console.log('🔥 Real-time segment update received:', {
      segmentId: payload.new?.id,
      imageUrl: payload.new?.image_url ? 'Present' : 'Missing',
      imageStatus: payload.new?.image_generation_status,
      hasImageUrl: !!payload.new?.image_url,
      imageUrlPreview: payload.new?.image_url?.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });

    if (payload.new && payload.new.id) {
      // Get current segment from the segments array instead of using the prop
      setAllStorySegments(prev => {
        const existingSegment = prev.find(seg => seg.id === payload.new.id);
        
        const existingChoices = existingSegment?.choices || [];
        const newChoices = payload.new.choices || [];
 
        // CHOICE-INTEGRITY: validate incoming vs existing and decide merge policy
        const storyTextRT = payload.new.segment_text || existingSegment?.segment_text || '';
        const serverValid = validateChoiceSetContractRT(storyTextRT, newChoices);
        const existingValid = validateChoiceSetContractRT(storyTextRT, existingChoices);
 
        let preservedChoices = existingChoices;
        let willPreserve = true;
        let reason = 'no new choices, preserving existing';
 
        if (newChoices && newChoices.length > 0) {
          if (serverValid) {
            // Accept server if valid
            preservedChoices = newChoices;
            willPreserve = false;
            reason = 'server choices valid';
          } else if (existingValid) {
            // Reject invalid server set and keep validated local
            willPreserve = true;
            reason = 'server choices invalid - preserving validated local choices';
            console.warn('[CHOICE-INTEGRITY] Realtime rejected server choices due to validation failure. Preserving local set.', {
              segmentId: payload.new.id,
              newChoices
            });
          } else {
            // Both invalid - keep existing to avoid churn
            willPreserve = true;
            reason = 'both server and local choices invalid - preserving existing';
            console.warn('[CHOICE-INTEGRITY] Both server and local choices invalid - preserving existing choices', {
              segmentId: payload.new.id,
              existingChoices,
              newChoices
            });
          }
        }
        
        console.log('🔄 Merging segment data with choice preservation:', {
          segmentId: payload.new.id,
          existingChoices,
          newChoices,
          preservedChoices,
          willPreserve,
          reason
        });

        const updatedSegment: StorySegment = {
          id: payload.new.id,
          storyId: payload.new.story_id,
          text: payload.new.segment_text || existingSegment?.text || '',
          imageUrl: payload.new.image_url || existingSegment?.imageUrl || '',
          audioUrl: payload.new.audio_url || existingSegment?.audioUrl || undefined,
          choices: preservedChoices, // Use preserved choices
          isEnd: payload.new.is_end !== undefined ? payload.new.is_end : existingSegment?.isEnd || false,
          story_id: payload.new.story_id,
          segment_text: payload.new.segment_text || existingSegment?.segment_text || '',
          image_url: payload.new.image_url || existingSegment?.image_url,
          audio_url: payload.new.audio_url || existingSegment?.audio_url,
          is_end: payload.new.is_end !== undefined ? payload.new.is_end : existingSegment?.is_end || false,
          image_generation_status: payload.new.image_generation_status || existingSegment?.image_generation_status || 'pending',
          audio_generation_status: payload.new.audio_generation_status || existingSegment?.audio_generation_status || 'not_started',
          triggering_choice_text: payload.new.triggering_choice_text || existingSegment?.triggering_choice_text,
          created_at: payload.new.created_at || existingSegment?.created_at,
          word_count: payload.new.word_count || existingSegment?.word_count,
          audio_duration: payload.new.audio_duration || existingSegment?.audio_duration
        };

        // Update current segment if it matches - use a ref to avoid dependency issues
        const currentSegmentId = currentStorySegment?.id;
        if (currentSegmentId === payload.new.id) {
          console.log('🔄 Updating current segment with real-time data:', {
            segmentId: payload.new.id,
            oldImageStatus: currentStorySegment?.image_generation_status,
            newImageStatus: updatedSegment.image_generation_status,
            oldImageUrl: currentStorySegment?.image_url,
            newImageUrl: updatedSegment.image_url,
            statusChanged: currentStorySegment?.image_generation_status !== updatedSegment.image_generation_status
          });
          
          // Call the callback function for direct communication
          if (onSegmentUpdate) {
            console.log('📢 Calling onSegmentUpdate callback with new segment data');
            onSegmentUpdate(updatedSegment);
          }
          
          // Also update the state directly (backup method)
          setCurrentStorySegment(updatedSegment);
        }

        // Force UI refresh for image updates
        if (payload.new.image_generation_status === 'completed' && payload.new.image_url) {
          console.log('✅ DISPATCHING GLOBAL EVENT: a new image is ready!');
          
          // THIS IS THE NEW, CRITICAL CODE:
          const event = new CustomEvent('story-image-updated', {
            detail: {
              segmentId: payload.new.id,
              imageUrl: payload.new.image_url,
              timestamp: new Date().toISOString()
            }
          });
          window.dispatchEvent(event);
          
          // Keep the existing event for backward compatibility
          window.dispatchEvent(new CustomEvent('force-image-refresh', {
            detail: {
              segmentId: payload.new.id,
              imageUrl: payload.new.image_url,
              timestamp: new Date().toISOString()
            }
          }));
        }

        return prev.map(segment => 
          segment.id === payload.new.id 
            ? updatedSegment 
            : segment
        );
      });
    }
  }, []); // Remove all dependencies to make it stable

  const setupSubscription = useCallback(() => {
    if (!storyId) {
      console.log('📡 No storyId provided, skipping subscription setup');
      return;
    }

    console.log('🔔 Setting up story segment real-time subscription for story:', storyId);

    // Clean up existing channel if any
    if (channelRef.current) {
      console.log('🧹 Cleaning up existing channel before creating new one');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`story-segments-${storyId}-${Date.now()}`) // Add timestamp to avoid conflicts
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'story_segments',
          filter: `story_id=eq.${storyId}`
        },
        handleRealtimeUpdate
      )
      .subscribe((status, err) => {
        // Only log important status changes, not every update
        if (status === 'SUBSCRIBED' || status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          console.log(`📡 Story segment subscription status: ${status} at ${new Date().toISOString()}`);
        }
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Story segment real-time subscription active - stopping fallback polling');
          connectionHealth.setHealthy();
          connectionHealth.updateConnectionTime();
          pollingManager.stopFallbackPolling();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription failed - WebSocket connection blocked by CSP or network issue');
          if (err) console.error('❌ Error details:', err);
          connectionHealth.setFailed();
          
          // Start aggressive fallback immediately due to connection failure
          pollingManager.startFallbackPolling();
          
          // Attempt reconnection with exponential backoff
          if (!connectionHealth.hasMaxReconnectAttemptsReached()) {
            const delay = connectionHealth.getReconnectDelay();
            console.log(`🔄 Attempting to reconnect story segment subscription in ${delay}ms (attempt ${connectionHealth.incrementReconnectAttempts()}/${connectionHealth.maxReconnectAttempts})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              setupSubscription();
            }, delay);
          } else {
            console.error('❌ Max reconnect attempts reached, relying on fallback polling only');
          }
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Real-time subscription timed out - likely due to slow image generation');
          connectionHealth.setFailed();
          
          // Start aggressive fallback immediately
          pollingManager.startFallbackPolling();
          pollingManager.forceRefresh();
          
          // Attempt reconnection with backoff
          if (!connectionHealth.hasMaxReconnectAttemptsReached()) {
            const delay = connectionHealth.getReconnectDelay();
            
            reconnectTimeoutRef.current = setTimeout(() => {
              setupSubscription();
            }, delay);
          } else {
            console.error('❌ Max reconnect attempts reached, relying on aggressive fallback polling');
          }
        } else if (status === 'CLOSED') {
          console.log('📪 Story segment subscription closed');
        } else if (status === 'CONNECTING') {
          console.log('🔄 Connecting to story segment subscription...');
        }
      });

    channelRef.current = channel;
  }, [storyId, handleRealtimeUpdate]); // Now handleRealtimeUpdate is stable

  useEffect(() => {
    setupSubscription();

    return () => {
      console.log('🧹 Cleaning up story segment subscription');
      
      // Clear any pending reconnection attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Remove the channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      // Stop any polling when component unmounts
      pollingManager.stopPolling();
    };
  }, [storyId, setupSubscription, pollingManager]); // Include dependencies

  // Return subscription status for debugging
  return {
    isSubscribed: channelRef.current !== null,
    connectionHealth: connectionHealth.connectionHealth,
    maxReconnectAttempts: connectionHealth.maxReconnectAttempts,
    isFallbackPolling: pollingManager.isFallbackPolling
  };
};
