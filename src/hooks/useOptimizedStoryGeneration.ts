/**
 * Optimized Story Generation Hook for TaleForge
 * 
 * This hook provides enhanced story generation capabilities with:
 * - Intelligent provider selection and fallbacks
 * - Performance monitoring and caching
 * - Real-time status updates
 * - Error handling and retry logic
 * - Cost tracking and optimization
 */

import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { aiWorkflowOptimizer, WorkflowStep } from '@/utils/aiWorkflowOptimizer';
import { performanceMonitor } from '@/lib/performance';
import { AIProviderErrorHandler, AIProviderType } from '@/utils/aiProviderErrorHandler';
import { supabase } from '@/integrations/supabase/client';
import type { StoryGenerationRequest, StorySegment, AIProviderError } from '@/types/ai';

interface UseOptimizedStoryGenerationOptions {
  enableCaching?: boolean;
  maxRetries?: number;
  timeout?: number;
  onProgress?: (step: WorkflowStep) => void;
  onError?: (error: AIProviderError) => void;
  onSuccess?: (result: StorySegment) => void;
}

interface StoryGenerationState {
  isGenerating: boolean;
  currentStep?: WorkflowStep | null;
  progress: number;
  error: AIProviderError | null;
  estimatedTimeRemaining: number;
}

export const useOptimizedStoryGeneration = (options: UseOptimizedStoryGenerationOptions = {}) => {
  const {
    onProgress,
    onError,
    onSuccess
  } = options;

  const queryClient = useQueryClient();
  const [state, setState] = useState<StoryGenerationState>({
    isGenerating: false,
    progress: 0,
    error: null,
    estimatedTimeRemaining: 0
  });

  const workflowIdRef = useRef<string>('');
  const startTimeRef = useRef<number>(0);

  // Generate story text using optimized workflow
  const generateStoryText = useCallback(async (request: StoryGenerationRequest): Promise<StorySegment> => {
    const workflowId = `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    workflowIdRef.current = workflowId;
    startTimeRef.current = Date.now();

    const steps: Omit<WorkflowStep, 'id' | 'status' | 'startTime' | 'endTime' | 'duration'>[] = [
      {
        type: 'text',
        provider: aiWorkflowOptimizer.getBestProvider('text'),
        result: request
      }
    ];

    if (!request.skipImage) {
      steps.push({
        type: 'image',
        provider: aiWorkflowOptimizer.getBestProvider('image'),
        result: { prompt: request.prompt || '' }
      });
    }

    if (!request.skipAudio) {
      steps.push({
        type: 'audio',
        provider: aiWorkflowOptimizer.getBestProvider('audio'),
        result: { text: request.prompt || '' }
      });
    }

    try {
      const results = await aiWorkflowOptimizer.executeWorkflow(
        workflowId,
        steps,
        async (step) => {
          // Update progress
          const currentStep = aiWorkflowOptimizer.getWorkflowStatus(workflowId)?.find(s => s.id === step.id);
          if (currentStep) {
            setState(prev => ({
              ...prev,
              currentStep: currentStep,
              progress: (steps.findIndex(s => s.type === step.type) + 1) / steps.length * 100
            }));
            onProgress?.(currentStep);
          }

          // Execute the actual generation based on step type
          switch (step.type) {
            case 'text':
              return await generateTextSegment(request);
            case 'image':
              return await generateImage(request.prompt || '');
            case 'audio':
              return await generateAudio(request.prompt || '');
            default:
              throw new Error(`Unknown step type: ${step.type}`);
          }
        }
      );

      // Combine results into StorySegment
      const textResult = results[0] as any;
      const imageResult = !request.skipImage ? results[1] as string : null;
      const audioResult = !request.skipAudio ? results[2] as string : null;

      const storySegment: StorySegment = {
        id: '',
        storyId: request.storyId || '',
        text: textResult.segmentText,
        imageUrl: imageResult || '',
        choices: textResult.choices || [],
        isEnd: textResult.isEnd || false,
        imagePrompt: textResult.imagePrompt || '',
        generationMetadata: {
          textGenerationTime: results[0]?.duration || 0,
          imageGenerationTime: imageResult ? results[1]?.duration || 0 : 0,
          audioGenerationTime: audioResult ? results[2]?.duration || 0 : 0,
          imageProvider: !request.skipImage ? steps[1]?.provider as any : undefined
        }
      };

      onSuccess?.(storySegment);
      return storySegment;

    } catch (error) {
      const providerError = AIProviderErrorHandler.handleProviderError(
        AIProviderType.OPENAI_GPT,
        'story-generation',
        error as Error,
        { request, workflowId }
      );

      
      setState(prev => ({ 
        ...prev, 
        error: {
          code: 'GENERATION_ERROR',
          message: error instanceof Error ? error.message : 'Story generation failed',
          provider: 'openai-gpt' as AIProviderType,
          operation: 'story_generation',
          originalError: error instanceof Error ? error : new Error('Unknown error'),
          retryable: true,
          userMessage: 'Story generation failed. Please try again.'
        }
      }));
      onError?.({
        code: 'GENERATION_ERROR',
        message: error instanceof Error ? error.message : 'Story generation failed',
        provider: 'openai-gpt' as AIProviderType,
        operation: 'story_generation',
        originalError: error instanceof Error ? error : new Error('Unknown error'),
        retryable: true,
        userMessage: 'Story generation failed. Please try again.'
      });
      throw providerError;
    } finally {
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        currentStep: null,
        progress: 0,
        estimatedTimeRemaining: 0
      }));
    }
  }, [onProgress, onError, onSuccess]);

  // Generate text segment
  const generateTextSegment = async (request: StoryGenerationRequest): Promise<any> => {
    const response = await fetch('/api/generate-story-segment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Text generation failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  };

  // Generate image
  const generateImage = async (prompt: string): Promise<string> => {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.imageUrl;
  };

  // Generate audio
  const generateAudio = async (text: string): Promise<string> => {
    const response = await fetch('/api/generate-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`Audio generation failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.audioUrl;
  };

  // Mutation for story generation
  const mutation = useMutation({
    mutationFn: generateStoryText,
    onMutate: () => {
      setState(prev => ({ 
        ...prev, 
        isGenerating: true, 
        error: null, 
        progress: 0,
        estimatedTimeRemaining: 0
      }));
    },
    onSuccess: (result) => {
      // Invalidate and refetch stories
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['story', result.storyId] });
      
      toast.success('Story generated successfully!');
      
      // Log performance metrics
      const totalTime = Date.now() - startTimeRef.current;
      performanceMonitor.recordMetric('story-generation-total', 'storyGenerationTime', totalTime);
    },
    onError: (error: AIProviderError) => {
      toast.error(error.message);
      
      // Log error metrics
      performanceMonitor.recordMetric('story-generation-error', 'errorCount', 1);
    }
  });

  // Get current workflow status
  const getWorkflowStatus = useCallback(() => {
    return aiWorkflowOptimizer.getWorkflowStatus(workflowIdRef.current);
  }, []);

  // Get provider status
  const getProviderStatus = useCallback(() => {
    return aiWorkflowOptimizer.getProviderStatus();
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    aiWorkflowOptimizer.clearCache();
    toast.success('Cache cleared');
  }, []);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    return aiWorkflowOptimizer.getPerformanceMetrics();
  }, []);

  return {
    // State
    isGenerating: state.isGenerating,
    currentStep: state.currentStep,
    progress: state.progress,
    error: state.error,
    estimatedTimeRemaining: state.estimatedTimeRemaining,

    // Actions
    generateStory: mutation.mutate,
    generateStoryAsync: mutation.mutateAsync,
    reset: mutation.reset,

    // Status
    getWorkflowStatus,
    getProviderStatus,
    getPerformanceMetrics,

    // Cache management
    clearCache,

    // Mutation state
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess
  };
}; 