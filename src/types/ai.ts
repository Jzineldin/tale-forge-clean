// AI Provider Types for TaleForge Multi-Modal AI Integration

// OpenAI GPT-4o-mini Response Format
export interface OpenAIStoryResponse {
  segmentText: string;
  choices: string[];
  isEnd: boolean;
  imagePrompt: string;
}

// AI Provider Response Types
export interface AIProviderResponse {
  success: boolean;
  data: any;
  error?: AIProviderError;
}

export interface OpenAIResponse extends AIProviderResponse {
  data: OpenAIStoryResponse;
}

export interface OVHAIResponse extends AIProviderResponse {
  data: {
    imageUrl: string;
    generationTime: number;
  };
}

export interface DALLEResponse extends AIProviderResponse {
  data: {
    imageUrl: string;
    revised_prompt?: string;
  };
}

export interface OpenAITTSResponse extends AIProviderResponse {
  data: {
    audioUrl: string;
    duration: number;
  };
}

// AI Provider Error Types
import { AIProviderType } from '@/utils/aiProviderErrorHandler';

export interface AIProviderError {
  // Core properties
  provider: AIProviderType;
  operation: string;
  originalError: Error;
  
  // Error classification
  code?: string;
  retryable: boolean;
  
  // User-facing information
  message?: string;
  userMessage: string;
  
  // Debug information
  details?: Record<string, any>;
  debugInfo?: any;
}

// Story Generation Request Types
export interface StoryGenerationRequest {
  prompt?: string;
  genre?: string;
  storyMode?: string;
  storyId?: string;
  parentSegmentId?: string;
  choice?: string;
  customization?: StoryCustomization;
  previousSegments?: string[];
  userChoice?: string;
  skipImage?: boolean;
  skipAudio?: boolean;
}

export interface StoryCustomization {
  characterName?: string;
  setting?: string;
  tone?: 'adventurous' | 'mysterious' | 'lighthearted' | 'dramatic';
  length?: 'short' | 'medium' | 'long';
}

// Image Generation Parameters
export interface ImageGenerationParams {
  prompt: string;
  style?: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  provider?: 'ovh-ai' | 'dall-e';
}

// Audio Generation Parameters
export interface AudioGenerationParams {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number;
  model?: 'tts-1' | 'tts-1-hd';
}

// Story Generation Pipeline Types
export interface StoryGenerationResult {
  segment: StorySegment;
  imageUrl?: string;
  audioUrl?: string;
  generationTime: number;
  providers: {
    text: 'openai';
    image: 'ovh-ai' | 'dall-e';
    audio: 'openai-tts';
  };
}

// Import and re-export the consolidated StorySegment interface
import { StorySegment } from './stories';
export type { StorySegment };

// Story State Types
export interface StoryState {
  currentSegment: StorySegment | null;
  storyHistory: StorySegment[];
  isGenerating: boolean;
  generationStatus: GenerationStatus;
  pendingAction: 'start' | 'choice' | null;
  pendingParams: StoryGenerationRequest | null;
  error: AIProviderError | null;
}

export interface GenerationStatus {
  text: 'idle' | 'generating' | 'completed' | 'failed';
  image: 'idle' | 'generating' | 'completed' | 'failed';
  audio: 'idle' | 'generating' | 'completed' | 'failed';
}

// Story Actions for hooks
export interface StoryActions {
  startStory: (params: StoryGenerationRequest) => Promise<void>;
  makeChoice: (choice: string) => Promise<void>;
  setCurrentSegment: (segment: StorySegment) => void;
  addToHistory: (segment: StorySegment) => void;
  resetStory: () => void;
  setPendingAction: (action: 'start' | 'choice' | null, params?: StoryGenerationRequest) => void;
}

// Real-time Story Update Types
export interface StoryUpdateEvent {
  type: 'segment_generated' | 'image_generated' | 'audio_generated' | 'story_completed' | 'error';
  storyId: string;
  segmentId?: string;
  data: any;
  timestamp: number;
}

// Supabase Realtime Payload Types
export interface SupabaseRealtimePayload {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Record<string, any>;
  old?: Record<string, any>;
  errors?: any[];
}

export interface StorySegmentRealtimePayload extends SupabaseRealtimePayload {
  new?: {
    id: string;
    story_id: string;
    segment_text: string;
    image_url: string;
    image_generation_status: 'not_started' | 'in_progress' | 'completed' | 'failed';
    choices: string[];
    is_end: boolean;
    parent_segment_id?: string;
    triggering_choice_text?: string;
    created_at: string;
    audio_url?: string;
    audio_duration?: number;
  };
}

export interface StoryRealtimePayload extends SupabaseRealtimePayload {
  new?: {
    id: string;
    title?: string;
    created_at: string;
    is_public: boolean;
    is_completed: boolean;
    story_mode?: string;
    thumbnail_url?: string;
    segment_count: number;
    published_at?: string;
    full_story_audio_url?: string;
    audio_generation_status: 'not_started' | 'in_progress' | 'completed' | 'failed';
    shotstack_render_id?: string;
    shotstack_video_url?: string;
    shotstack_status?: 'not_started' | 'submitted' | 'queued' | 'rendering' | 'saving' | 'done' | 'failed';
  };
}

// AI Provider Configuration
export interface AIProviderConfig {
  name: string;
  enabled: boolean;
  priority: number;
  config: Record<string, unknown>;
}

export interface StoryGenerationOptions {
  prompt?: string;
  storyMode?: string;
  choice?: string;
  parentSegmentId?: string;
  skipImage?: boolean;
  skipAudio?: boolean;
  maxSegments?: number;
  genre?: string;
  characterName?: string;
}

export interface AIProviderSettings {
  textProvider: string;
  imageProvider: string;
  audioProvider: string;
  settings: Record<string, unknown>;
}
