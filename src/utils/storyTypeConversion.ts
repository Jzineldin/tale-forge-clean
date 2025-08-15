
import { StorySegment } from '@/hooks/useStoryDisplay/types';
import { StorySegmentRow } from '@/types/stories';

export const convertStorySegmentToRow = (segment: StorySegment): StorySegmentRow => {
  return {
    id: segment.id,
    story_id: segment.story_id,
    segment_text: segment.segment_text,
    image_url: segment.image_url || '',
    image_generation_status: segment.image_generation_status,
    choices: segment.choices || [],
    is_end: segment.is_end,
    parent_segment_id: null, // StorySegment type doesn't have parent_segment_id, so default to null
    triggering_choice_text: segment.triggering_choice_text || null,
    created_at: segment.created_at,
    audio_url: segment.audio_url || null,
    audio_duration: segment.audio_duration || null,
  };
};

export const convertStorySegmentsToRows = (segments: StorySegment[]): StorySegmentRow[] => {
  return segments.map(convertStorySegmentToRow);
};
