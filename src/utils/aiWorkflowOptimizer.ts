/**
 * AI Workflow Optimizer for TaleForge
 * 
 * This system optimizes the multi-modal AI workflow by:
 * - Managing provider fallbacks intelligently
 * - Caching responses to reduce API calls
 * - Implementing retry logic with exponential backoff
 * - Monitoring performance and costs
 * - Providing real-time status updates
 */

import { trackAIGeneration } from '@/lib/performance';

export interface AIWorkflowConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  enableCaching: boolean;
  cacheExpiry: number;
  costLimit: number;
}

export interface AIProviderStatus {
  provider: string;
  isHealthy: boolean;
  responseTime: number;
  errorRate: number;
  lastUsed: Date;
  costThisSession: number;
}

export interface WorkflowStep {
  id: string;
  type: 'text' | 'image' | 'audio';
  provider: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
  result?: any;
}

export class AIWorkflowOptimizer {
  private static instance: AIWorkflowOptimizer;
  private providerStatus: Map<string, AIProviderStatus> = new Map();
  private workflowCache: Map<string, any> = new Map();
  private activeWorkflows: Map<string, WorkflowStep[]> = new Map();
  private config: AIWorkflowConfig;

  private constructor() {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000,
      enableCaching: true,
      cacheExpiry: 5 * 60 * 1000, // 5 minutes
      costLimit: 100 // $100 limit per session
    };
    
    this.initializeProviders();
  }

  static getInstance(): AIWorkflowOptimizer {
    if (!AIWorkflowOptimizer.instance) {
      AIWorkflowOptimizer.instance = new AIWorkflowOptimizer();
    }
    return AIWorkflowOptimizer.instance;
  }

  private initializeProviders(): void {
    const providers = [
      { name: 'openai-gpt', type: 'text' },
      { name: 'ovh-ai', type: 'text' },
      { name: 'openai-dalle', type: 'image' },
      { name: 'ovh-sdxl', type: 'image' },
      { name: 'openai-tts', type: 'audio' }
    ];

    providers.forEach(provider => {
      this.providerStatus.set(provider.name, {
        provider: provider.name,
        isHealthy: true,
        responseTime: 0,
        errorRate: 0,
        lastUsed: new Date(),
        costThisSession: 0
      });
    });
  }

  /**
   * Execute an AI workflow with optimization
   */
  async executeWorkflow<T>(
    workflowId: string,
    steps: Omit<WorkflowStep, 'id' | 'status' | 'startTime' | 'endTime' | 'duration'>[],
    executor: (step: WorkflowStep) => Promise<T>
  ): Promise<T[]> {
    const workflowSteps: WorkflowStep[] = steps.map((step, index) => ({
      ...step,
      id: `${workflowId}-${index}`,
      status: 'pending'
    }));

    this.activeWorkflows.set(workflowId, workflowSteps);
    const results: T[] = [];

    try {
      for (const step of workflowSteps) {
        const result = await this.executeStep(step, executor);
        results.push(result);
      }
    } finally {
      this.activeWorkflows.delete(workflowId);
    }

    return results;
  }

  /**
   * Execute a single workflow step with retry logic and fallbacks
   */
  private async executeStep<T>(
    step: WorkflowStep,
    executor: (step: WorkflowStep) => Promise<T>
  ): Promise<T> {
    const tracker = trackAIGeneration(step.provider, step.type);
    step.status = 'running';
    step.startTime = new Date();

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        // Check if we have a cached result
        const cacheKey = this.generateCacheKey(step);
        if (this.config.enableCaching && this.workflowCache.has(cacheKey)) {
          const cached = this.workflowCache.get(cacheKey);
          if (Date.now() - cached.timestamp < this.config.cacheExpiry) {
            console.log(`🎯 Using cached result for ${step.id}`);
            step.status = 'completed';
            step.endTime = new Date();
            step.duration = step.endTime.getTime() - step.startTime!.getTime();
            tracker.success();
            return cached.data;
          }
        }

        // Execute the step
        const result = await Promise.race([
          executor(step),
          this.createTimeout(this.config.timeout)
        ]);

        // Cache the result
        if (this.config.enableCaching) {
          this.workflowCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
        }

        // Update provider status
        this.updateProviderStatus(step.provider, true, step.startTime!);

        step.status = 'completed';
        step.endTime = new Date();
        step.duration = step.endTime.getTime() - step.startTime!.getTime();
        step.result = result;

        tracker.success();
        return result;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Step ${step.id} failed (attempt ${attempt + 1}):`, error);

        // Update provider status
        this.updateProviderStatus(step.provider, false, step.startTime!);

        // Try fallback provider if available
        if (attempt === 0) {
          const fallbackProvider = this.getFallbackProvider(step.provider, step.type);
          if (fallbackProvider && fallbackProvider !== step.provider) {
            console.log(`🔄 Falling back to ${fallbackProvider} for ${step.id}`);
            step.provider = fallbackProvider;
            continue;
          }
        }

        // Wait before retry
        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }

    // All attempts failed
    step.status = 'failed';
    step.endTime = new Date();
    step.duration = step.endTime.getTime() - step.startTime!.getTime();
    step.error = lastError?.message || 'Unknown error';

    tracker.error();
    throw lastError || new Error('Workflow step failed after all retries');
  }

  /**
   * Get the best available provider for a given type
   */
  getBestProvider(type: 'text' | 'image' | 'audio'): string {
    const providers = Array.from(this.providerStatus.values())
      .filter(p => this.getProviderType(p.provider) === type)
      .sort((a, b) => {
        // Prioritize healthy providers with lower error rates
        if (a.isHealthy !== b.isHealthy) return b.isHealthy ? 1 : -1;
        if (a.errorRate !== b.errorRate) return a.errorRate - b.errorRate;
        return a.responseTime - b.responseTime;
      });

    return providers[0]?.provider || this.getDefaultProvider(type);
  }

  /**
   * Get fallback provider for a given provider and type
   */
  private getFallbackProvider(provider: string, _type: 'text' | 'image' | 'audio'): string | null {
    const fallbacks: Record<string, string> = {
      'openai-gpt': 'ovh-ai',
      'ovh-ai': 'openai-gpt',
      'openai-dalle': 'ovh-sdxl',
      'ovh-sdxl': 'openai-dalle',
      'openai-tts': 'openai-tts' // No fallback for TTS currently
    };

    const fallback = fallbacks[provider];
    if (!fallback || fallback === provider) return null;

    const fallbackStatus = this.providerStatus.get(fallback);
    return fallbackStatus?.isHealthy ? fallback : null;
  }

  /**
   * Update provider status after operation
   */
  private updateProviderStatus(provider: string, success: boolean, startTime: Date): void {
    const status = this.providerStatus.get(provider);
    if (!status) return;

    const endTime = new Date();
    const responseTime = endTime.getTime() - startTime.getTime();

    // Update response time (exponential moving average)
    status.responseTime = status.responseTime * 0.7 + responseTime * 0.3;
    
    // Update error rate (exponential moving average)
    const errorRate = success ? 0 : 1;
    status.errorRate = status.errorRate * 0.9 + errorRate * 0.1;
    
    // Update health status
    status.isHealthy = status.errorRate < 0.5;
    status.lastUsed = endTime;

    this.providerStatus.set(provider, status);
  }

  /**
   * Generate cache key for a workflow step
   */
  private generateCacheKey(step: WorkflowStep): string {
    return `${step.type}-${step.provider}-${JSON.stringify(step.result || {})}`;
  }

  /**
   * Get provider type from provider name
   */
  private getProviderType(provider: string): 'text' | 'image' | 'audio' {
    if (provider.includes('gpt') || provider.includes('ovh-ai')) return 'text';
    if (provider.includes('dalle') || provider.includes('sdxl')) return 'image';
    if (provider.includes('tts')) return 'audio';
    return 'text'; // Default
  }

  /**
   * Get default provider for a type
   */
  private getDefaultProvider(type: 'text' | 'image' | 'audio'): string {
    const defaults = {
      text: 'ovh-ai',
      image: 'openai-dalle',
      audio: 'openai-tts'
    };
    return defaults[type];
  }

  /**
   * Create a timeout promise
   */
  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current workflow status
   */
  getWorkflowStatus(workflowId: string): WorkflowStep[] | undefined {
    return this.activeWorkflows.get(workflowId);
  }

  /**
   * Get provider status
   */
  getProviderStatus(): AIProviderStatus[] {
    return Array.from(this.providerStatus.values());
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.workflowCache.clear();
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      activeWorkflows: this.activeWorkflows.size,
      cacheSize: this.workflowCache.size,
      providerStatus: this.getProviderStatus()
    };
  }
}

// Export singleton instance
export const aiWorkflowOptimizer = AIWorkflowOptimizer.getInstance(); 