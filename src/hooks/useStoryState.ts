
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StorySegment, StoryGenerationRequest, AIProviderError } from '@/types/ai';

/**
 * Global state interface for managing story generation and AI provider interactions
 * in TaleForge's interactive storytelling system.
 * 
 * This state manages:
 * - Current story and segment data for real-time story creation
 * - Story progression history for branching narratives
 * - API usage tracking for cost control and rate limiting
 * - AI provider error handling and fallback mechanisms
 * - Pending action management for interrupted workflows
 */
interface StoryState {
  /** Current active story ID being generated or viewed */
  currentStoryId: string | null;
  /** Currently displayed story segment with text, choices, and metadata */
  currentSegment: StorySegment | null;
  /** Complete history of story segments for branching narrative context */
  storyHistory: StorySegment[];
  /** Counter for AI API calls made in current session (for cost control) */
  apiUsageCount: number;
  /** Whether to show cost confirmation dialog before expensive AI operations */
  showCostDialog: boolean;
  /** Pending AI generation action ('start' for new story, 'choice' for continuation) */
  pendingAction: 'start' | 'choice' | null;
  /** Parameters for pending AI generation request (genre, choices, context) */
  pendingParams: StoryGenerationRequest | null;
  /** Current AI provider error or null if no error */
  error: AIProviderError | null;
  
  /** Set the current active story ID */
  setCurrentStory: (storyId: string) => void;
  /** Update the currently displayed story segment */
  setCurrentSegment: (segment: StorySegment) => void;
  /** Add a new segment to the story history for context retention */
  addToHistory: (segment: StorySegment) => void;
  /** Increment API usage counter for cost tracking */
  incrementApiUsage: () => void;
  /** Control display of cost confirmation dialog */
  setShowCostDialog: (show: boolean) => void;
  /** Set pending action and parameters for interrupted AI workflows */
  setPendingAction: (action: 'start' | 'choice' | null, params?: StoryGenerationRequest) => void;
  /** Set or clear AI provider error state */
  setError: (error: AIProviderError | null) => void;
  /** Reset all state (used when starting fresh story or clearing errors) */
  resetState: () => void;
}

/**
 * Zustand store for managing TaleForge's story generation state.
 * 
 * This hook provides global state management for:
 * - Real-time story generation with multiple AI providers (OpenAI GPT-4o-mini, OVH AI Endpoints, DALL-E)
 * - Story segment history for maintaining narrative context across branching choices
 * - API usage tracking and cost control for AI generation workflows
 * - Error handling for AI provider failures and fallback mechanisms
 * - Pending action management for resuming interrupted story generation
 * 
 * The state is persisted to localStorage to maintain story context across browser sessions.
 * 
 * @example
 * ```typescript
 * const { currentSegment, setCurrentSegment, addToHistory, error } = useStoryState();
 * 
 * // Update current segment after AI generation
 * setCurrentSegment(newSegment);
 * addToHistory(newSegment);
 * 
 * // Handle AI provider errors
 * if (error) {
 *   console.error('AI generation failed:', error.message);
 * }
 * ```
 */

export const useStoryState = create<StoryState>()(
  persist(
    (set, _get) => ({
      currentStoryId: null as string | null,
      currentSegment: null as StorySegment | null,
      storyHistory: [] as StorySegment[],
      apiUsageCount: 0,
      showCostDialog: false,
      pendingAction: null as 'start' | 'choice' | null,
      pendingParams: null as StoryGenerationRequest | null,
      error: null as AIProviderError | null,

      setCurrentStory: (storyId) => set({ currentStoryId: storyId }),
      
      setCurrentSegment: (segment) => set({ currentSegment: segment }),
      
      addToHistory: (segment) => set((state) => ({
        storyHistory: [...state.storyHistory, segment]
      })),
      
      incrementApiUsage: () => set((state) => ({
        apiUsageCount: state.apiUsageCount + 1
      })),
      
      setShowCostDialog: (show) => set({ showCostDialog: show }),
      
      setPendingAction: (action, params) => set({
        pendingAction: action,
        pendingParams: params || null
      }),
      
      setError: (error) => set({ error }),
      
      resetState: () => set({
        currentStoryId: null,
        currentSegment: null,
        storyHistory: [],
        showCostDialog: false,
        pendingAction: null,
        pendingParams: null,
        error: null
      })
    }),
    {
      name: 'story-state',
      partialize: (state) => ({
        apiUsageCount: state.apiUsageCount,
        storyHistory: state.storyHistory
      })
    }
  )
);
