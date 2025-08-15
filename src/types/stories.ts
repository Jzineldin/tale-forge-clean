
// Represents a single segment of a story from the database
export interface StorySegmentRow {
  id: string;
  story_id: string;
  segment_text: string;
  image_url: string;
  image_generation_status: string;
  choices: string[];
  is_end: boolean;
  parent_segment_id: string | null;
  triggering_choice_text: string | null;
  created_at: string;
  audio_url: string | null;
  audio_duration: number | null;
}

// Base type for a story record from the database
export interface Story {
  id: string;
  title: string | null;
  created_at: string;
  is_public: boolean;
  is_completed: boolean;
  story_mode: string | null;
  target_age?: string | null;
  thumbnail_url: string | null;
  segment_count: number;
  published_at?: string | null;
  full_story_audio_url: string | null;
  audio_generation_status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  shotstack_render_id?: string | null;
  shotstack_video_url?: string | null;
  shotstack_status?: 'not_started' | 'submitted' | 'queued' | 'rendering' | 'saving' | 'done' | 'failed';
  user_id?: string;
  description?: string | null;
  // Pre-fetched cover image URL to prevent N+1 queries
  cover_image_url?: string | null;
}

// Combines the Story with its segments, typically for detailed views
export interface StoryWithSegments extends Story {
    story_segments: StorySegmentRow[];
}

// Comprehensive StorySegment interface that consolidates all properties
export interface StorySegment {
  // Core properties
  id?: string;
  segmentId?: string;
  storyId: string;
  text: string;
  imageUrl: string;
  
  // Status and metadata
  choices: string[];
  isEnd: boolean;
  imageGenerationStatus?: string;
  parentSegmentId?: string;
  triggeringChoiceText?: string;
  
  // Optional properties for AI workflows
  imagePrompt?: string;
  generationMetadata?: Record<string, unknown>;
  
  // Database mapping helpers
  segment_text?: string;
  image_url?: string;
  is_end?: boolean;
  parent_segment_id?: string;
  triggering_choice_text?: string;
  image_generation_status?: string;
}
