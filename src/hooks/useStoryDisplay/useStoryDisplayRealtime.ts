
import { useStorySegmentRealtime } from './useStorySegmentRealtime';
import { StorySegment } from './types';

interface UseStoryDisplayRealtimeProps {
  storyId: string;
  currentStorySegment: StorySegment | null;
  setCurrentStorySegment: (segment: StorySegment | null) => void;
  setAllStorySegments: (segments: StorySegment[] | ((prev: StorySegment[]) => StorySegment[])) => void;
  onSegmentUpdate?: (segment: StorySegment) => void; // Add callback for direct communication
}

export const useStoryDisplayRealtime = (props: UseStoryDisplayRealtimeProps) => {
  // Set up real-time subscription for story segments with callback
  const realtimeProps = {
    storyId: props.storyId,
    currentStorySegment: props.currentStorySegment,
    setCurrentStorySegment: props.setCurrentStorySegment,
    setAllStorySegments: props.setAllStorySegments
  };
  
  // Only add callback if provided
  if (props.onSegmentUpdate) {
    (realtimeProps as any).onSegmentUpdate = props.onSegmentUpdate;
  }
  
  useStorySegmentRealtime(realtimeProps);
  
  // Additional real-time subscriptions can be added here
  // For example, story-level updates, user presence, etc.
};
