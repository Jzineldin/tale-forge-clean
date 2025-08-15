/**
 * Tale Forge Unified Optimization Framework - Resource Orchestrator
 * 
 * This file implements the ResourceOrchestrator class that manages resource allocation
 * and optimization across different adapters in the optimization system.
 */

import { 
  OptimizerType, 
  OptimizationEventType,
  PerformanceMetric,
  ResourcePriority
} from './types';
import { EventEmitter } from '../utils/EventEmitter';
import { ConfigManager } from '../config/ConfigManager';

/**
 * Resource allocation status
 */
export enum ResourceAllocationStatus {
  PENDING = 'pending',
  ALLOCATED = 'allocated',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Resource allocation request
 */
export interface ResourceAllocationRequest {
  taskId: string;
  adapterType: OptimizerType;
  priority: ResourcePriority;
  estimatedDuration: number;
  estimatedMemory: number;
  estimatedCPU: number;
  estimatedNetwork: number;
  dependencies: string[];
  metadata?: Record<string, any>;
}

/**
 * Resource allocation response
 */
export interface ResourceAllocationResponse {
  taskId: string;
  allocationId: string;
  status: ResourceAllocationStatus;
  allocatedResources: {
    memory: number;
    cpu: number;
    network: number;
  };
  estimatedCompletionTime: number;
  queuePosition?: number;
}

/**
 * Resource usage metrics
 */
export interface ResourceUsageMetrics {
  totalMemory: number;
  availableMemory: number;
  totalCPU: number;
  availableCPU: number;
  activeTasks: number;
  queuedTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageTaskDuration: number;
  memoryUtilization: number;
  cpuUtilization: number;
}

/**
 * Resource orchestrator configuration
 */
export interface ResourceOrchestratorConfig {
  maxConcurrentTasks: number;
  maxMemoryPerTask: number;
  maxCPUPerTask: number;
  maxNetworkPerTask: number;
  queueTimeout: number;
  retryAttempts: number;
  fallbackStrategy: 'skip' | 'queue' | 'reduce_quality';
  monitoringInterval: number;
}

/**
 * Resource orchestrator class
 */
export class ResourceOrchestrator {
  private adapters: Map<OptimizerType, any> = new Map();
  private activeAllocations: Map<string, ResourceAllocationResponse> = new Map();
  private taskQueue: ResourceAllocationRequest[] = [];
  private completedTasks: Map<string, ResourceAllocationResponse> = new Map();
  private failedTasks: Map<string, ResourceAllocationResponse> = new Map();
  private metrics: PerformanceMetric[] = [];
  private config: ResourceOrchestratorConfig;
  private eventEmitter: EventEmitter;
  private configManager: ConfigManager;
  private monitoringInterval: NodeJS.Timeout | null = null;

  /**
   * Constructor
   * 
   * @param eventEmitter The event emitter instance
   * @param configManager The configuration manager instance
   */
  constructor(eventEmitter: EventEmitter, configManager: ConfigManager) {
    this.eventEmitter = eventEmitter;
    this.configManager = configManager;
    this.config = this.loadConfig();
    this.startMonitoring();
  }

  /**
   * Load configuration from ConfigManager
   */
  private loadConfig(): ResourceOrchestratorConfig {
    const baseConfig = this.configManager.getOptimizerConfig(OptimizerType.PERFORMANCE);
    return {
      maxConcurrentTasks: baseConfig.options.maxConcurrentTasks || 10,
      maxMemoryPerTask: baseConfig.options.maxMemoryPerTask || 100 * 1024 * 1024, // 100MB
      maxCPUPerTask: baseConfig.options.maxCPUPerTask || 50, // 50% CPU
      maxNetworkPerTask: baseConfig.options.maxNetworkPerTask || 10 * 1024 * 1024, // 10MB/s
      queueTimeout: baseConfig.options.queueTimeout || 30000, // 30 seconds
      retryAttempts: baseConfig.options.retryAttempts || 3,
      fallbackStrategy: baseConfig.options.fallbackStrategy || 'queue',
      monitoringInterval: baseConfig.options.monitoringInterval || 5000 // 5 seconds
    };
  }

  /**
   * Register an optimization adapter
   * 
   * @param adapterType The type of adapter
   * @param adapter The adapter instance
   */
  public registerAdapter(adapterType: OptimizerType, adapter: any): void {
    this.adapters.set(adapterType, adapter);
    this.emitEvent(OptimizationEventType.INITIALIZED, {
      adapterType,
      message: `Adapter ${adapterType} registered`
    });
  }

  /**
   * Allocate resources for a task
   * 
   * @param task The optimization task
   * @returns Resource allocation response
   */
  public async allocateResources(task: ResourceAllocationRequest): Promise<ResourceAllocationResponse> {
    try {
      // Validate task
      this.validateTask(task);

      // Check if resources are available
      const availableResources = this.checkResourceAvailability(task);
      
      if (availableResources.canAllocate) {
        // Allocate immediately
        return this.allocateImmediate(task);
      } else {
        // Queue the task
        return this.queueTask(task);
      }
    } catch (error) {
      this.emitEvent(OptimizationEventType.FAILED, {
        taskId: task.taskId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Validate task parameters
   */
  private validateTask(task: ResourceAllocationRequest): void {
    if (!task.taskId) {
      throw new Error('Task ID is required');
    }
    if (!task.adapterType) {
      throw new Error('Adapter type is required');
    }
    if (task.estimatedMemory > this.config.maxMemoryPerTask) {
      throw new Error(`Memory requirement exceeds limit: ${task.estimatedMemory} > ${this.config.maxMemoryPerTask}`);
    }
    if (task.estimatedCPU > this.config.maxCPUPerTask) {
      throw new Error(`CPU requirement exceeds limit: ${task.estimatedCPU} > ${this.config.maxCPUPerTask}`);
    }
    if (task.estimatedNetwork > this.config.maxNetworkPerTask) {
      throw new Error(`Network requirement exceeds limit: ${task.estimatedNetwork} > ${this.config.maxNetworkPerTask}`);
    }
  }

  /**
   * Check resource availability
   */
  private checkResourceAvailability(task: ResourceAllocationRequest): { canAllocate: boolean; reason?: string } {
    const currentUsage = this.getCurrentResourceUsage();
    const activeTasks = this.activeAllocations.size;
    
    if (activeTasks >= this.config.maxConcurrentTasks) {
      return { canAllocate: false, reason: 'Max concurrent tasks reached' };
    }
    
    if (currentUsage.memoryUtilization + (task.estimatedMemory / this.getTotalMemory()) > 0.9) {
      return { canAllocate: false, reason: 'Insufficient memory' };
    }
    
    if (currentUsage.cpuUtilization + (task.estimatedCPU / 100) > 0.9) {
      return { canAllocate: false, reason: 'Insufficient CPU' };
    }
    
    return { canAllocate: true };
  }

  /**
   * Allocate resources immediately
   */
  private allocateImmediate(task: ResourceAllocationRequest): ResourceAllocationResponse {
    const allocationId = this.generateAllocationId();
    const response: ResourceAllocationResponse = {
      taskId: task.taskId,
      allocationId,
      status: ResourceAllocationStatus.ALLOCATED,
      allocatedResources: {
        memory: task.estimatedMemory,
        cpu: task.estimatedCPU,
        network: task.estimatedNetwork
      },
      estimatedCompletionTime: Date.now() + task.estimatedDuration
    };
    
    this.activeAllocations.set(task.taskId, response);
    
    this.emitEvent(OptimizationEventType.STARTED, {
      taskId: task.taskId,
      allocationId,
      message: 'Resources allocated immediately'
    });
    
    return response;
  }

  /**
   * Queue a task for later allocation
   */
  private queueTask(task: ResourceAllocationRequest): ResourceAllocationResponse {
    const allocationId = this.generateAllocationId();
    const queuePosition = this.taskQueue.length + 1;
    
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => a.priority - b.priority);
    
    const response: ResourceAllocationResponse = {
      taskId: task.taskId,
      allocationId,
      status: ResourceAllocationStatus.PENDING,
      allocatedResources: {
        memory: 0,
        cpu: 0,
        network: 0
      },
      estimatedCompletionTime: Date.now() + (task.estimatedDuration * queuePosition),
      queuePosition
    };
    
    this.emitEvent(OptimizationEventType.METRIC_RECORDED, {
      taskId: task.taskId,
      allocationId,
      message: 'Task queued',
      queuePosition
    });
    
    return response;
  }

  /**
   * Release resources after task completion
   * 
   * @param taskId The task ID
   */
  public releaseResources(taskId: string): void {
    const allocation = this.activeAllocations.get(taskId);
    if (!allocation) {
      throw new Error(`No active allocation found for task ${taskId}`);
    }
    
    allocation.status = ResourceAllocationStatus.COMPLETED;
    this.completedTasks.set(taskId, allocation);
    this.activeAllocations.delete(taskId);
    
    // Process next task in queue
    this.processQueue();
    
    this.emitEvent(OptimizationEventType.COMPLETED, {
      taskId,
      allocationId: allocation.allocationId,
      message: 'Resources released'
    });
  }

  /**
   * Process the task queue
   */
  private processQueue(): void {
    if (this.taskQueue.length === 0) return;
    
    const availableSlots = this.config.maxConcurrentTasks - this.activeAllocations.size;
    
    for (let i = 0; i < availableSlots && this.taskQueue.length > 0; i++) {
      const nextTask = this.taskQueue.shift();
      if (nextTask) {
        const response = this.allocateImmediate(nextTask);
        this.emitEvent(OptimizationEventType.METRIC_RECORDED, {
          taskId: nextTask.taskId,
          allocationId: response.allocationId,
          message: 'Task dequeued and allocated'
        });
      }
    }
  }

  /**
   * Get current resource usage metrics
   */
  public getResourceUsage(): ResourceUsageMetrics {
    const totalMemory = this.getTotalMemory();
    const totalCPU = 100; // 100% CPU
    
    const currentMemory = this.getCurrentMemoryUsage();
    const currentCPU = this.getCurrentCPUUsage();
    
    return {
      totalMemory,
      availableMemory: totalMemory - currentMemory,
      totalCPU,
      availableCPU: totalCPU - currentCPU,
      activeTasks: this.activeAllocations.size,
      queuedTasks: this.taskQueue.length,
      completedTasks: this.completedTasks.size,
      failedTasks: this.failedTasks.size,
      averageTaskDuration: this.calculateAverageTaskDuration(),
      memoryUtilization: currentMemory / totalMemory,
      cpuUtilization: currentCPU / totalCPU
    };
  }

  /**
   * Prioritize tasks based on constraints
   * 
   * @param tasks Array of tasks to prioritize
   * @returns Prioritized tasks
   */
  public prioritizeTasks(tasks: ResourceAllocationRequest[]): ResourceAllocationRequest[] {
    return tasks.sort((a, b) => {
      // First by priority (lower number = higher priority)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // Then by estimated duration (shorter tasks first)
      if (a.estimatedDuration !== b.estimatedDuration) {
        return a.estimatedDuration - b.estimatedDuration;
      }
      
      // Finally by resource requirements (lower requirements first)
      const aTotal = a.estimatedMemory + a.estimatedCPU + a.estimatedNetwork;
      const bTotal = b.estimatedMemory + b.estimatedCPU + b.estimatedNetwork;
      
      return aTotal - bTotal;
    });
  }

  /**
   * Handle resource constraints
   * 
   * @param strategy The strategy to use
   */
  public handleResourceConstraint(strategy: string): void {
    switch (strategy) {
      case 'skip':
        // Skip lowest priority tasks
        this.skipLowestPriorityTasks();
        break;
      case 'queue':
        // Queue all tasks
        this.queueAllTasks();
        break;
      case 'reduce_quality':
        // Reduce quality for non-critical tasks
        this.reduceQualityForNonCriticalTasks();
        break;
      default:
        this.emitEvent(OptimizationEventType.FAILED, {
          message: `Unknown resource constraint strategy: ${strategy}`
        });
    }
  }

  /**
   * Skip lowest priority tasks
   */
  private skipLowestPriorityTasks(): void {
    const lowestPriorityTasks = this.taskQueue.filter(task => task.priority === ResourcePriority.LOW);
    lowestPriorityTasks.forEach(task => {
      const response: ResourceAllocationResponse = {
        taskId: task.taskId,
        allocationId: this.generateAllocationId(),
        status: ResourceAllocationStatus.CANCELLED,
        allocatedResources: { memory: 0, cpu: 0, network: 0 },
        estimatedCompletionTime: 0
      };
      
      this.failedTasks.set(task.taskId, response);
      this.taskQueue = this.taskQueue.filter(t => t.taskId !== task.taskId);
      
      this.emitEvent(OptimizationEventType.FAILED, {
        taskId: task.taskId,
        message: 'Task skipped due to resource constraints'
      });
    });
  }

  /**
   * Queue all tasks
   */
  private queueAllTasks(): void {
    // Already handled by default queue mechanism
    this.emitEvent(OptimizationEventType.METRIC_RECORDED, {
      message: 'All tasks queued due to resource constraints'
    });
  }

  /**
   * Reduce quality for non-critical tasks
   */
  private reduceQualityForNonCriticalTasks(): void {
    this.taskQueue.forEach(task => {
      if (task.priority > ResourcePriority.HIGH) {
        task.estimatedMemory *= 0.7;
        task.estimatedCPU *= 0.7;
        task.estimatedNetwork *= 0.7;
      }
    });
    
    this.emitEvent(OptimizationEventType.METRIC_RECORDED, {
      message: 'Quality reduced for non-critical tasks'
    });
  }

  /**
   * Get current resource usage
   */
  private getCurrentResourceUsage(): { memoryUtilization: number; cpuUtilization: number } {
    let totalMemory = 0;
    let totalCPU = 0;
    
    this.activeAllocations.forEach(allocation => {
      totalMemory += allocation.allocatedResources.memory;
      totalCPU += allocation.allocatedResources.cpu;
    });
    
    return {
      memoryUtilization: totalMemory / this.getTotalMemory(),
      cpuUtilization: totalCPU / 100
    };
  }

  /**
   * Get total system memory
   */
  private getTotalMemory(): number {
    // In a real implementation, this would query system memory
    // For now, return a reasonable default
    return 1024 * 1024 * 1024; // 1GB
  }

  /**
   * Get current memory usage
   */
  private getCurrentMemoryUsage(): number {
    let total = 0;
    this.activeAllocations.forEach(allocation => {
      total += allocation.allocatedResources.memory;
    });
    return total;
  }

  /**
   * Get current CPU usage
   */
  private getCurrentCPUUsage(): number {
    let total = 0;
    this.activeAllocations.forEach(allocation => {
      total += allocation.allocatedResources.cpu;
    });
    return total;
  }

  /**
   * Calculate average task duration
   */
  private calculateAverageTaskDuration(): number {
    if (this.completedTasks.size === 0) return 0;
    
    let totalDuration = 0;
    this.completedTasks.forEach(task => {
      totalDuration += task.estimatedCompletionTime;
    });
    
    return totalDuration / this.completedTasks.size;
  }

  /**
   * Generate unique allocation ID
   */
  private generateAllocationId(): string {
    return `alloc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.monitorResources();
    }, this.config.monitoringInterval);
  }

  /**
   * Monitor resource usage
   */
  private monitorResources(): void {
    const usage = this.getResourceUsage();
    
    // Record metrics
    this.recordMetric('active_tasks', usage.activeTasks, 'count');
    this.recordMetric('queued_tasks', usage.queuedTasks, 'count');
    this.recordMetric('memory_utilization', usage.memoryUtilization * 100, 'percent');
    this.recordMetric('cpu_utilization', usage.cpuUtilization * 100, 'percent');
    
    // Check for resource constraints
    if (usage.memoryUtilization > 0.9 || usage.cpuUtilization > 0.9) {
      this.emitEvent(OptimizationEventType.THRESHOLD_EXCEEDED, {
        memoryUtilization: usage.memoryUtilization,
        cpuUtilization: usage.cpuUtilization,
        message: 'Resource utilization threshold exceeded'
      });
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(name: string, value: number, unit: string): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now()
    };
    
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Emit an optimization event
   */
  private emitEvent(type: OptimizationEventType, data?: any): void {
    const event = {
      type,
      optimizerType: OptimizerType.PERFORMANCE,
      timestamp: Date.now(),
      data
    };
    
    this.eventEmitter.emit(type, event);
  }

  /**
   * Get performance metrics
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Reset the orchestrator
   */
  public reset(): void {
    this.activeAllocations.clear();
    this.taskQueue.length = 0;
    this.completedTasks.clear();
    this.failedTasks.clear();
    this.metrics.length = 0;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.startMonitoring();
    
    this.emitEvent(OptimizationEventType.INITIALIZED, {
      message: 'Resource orchestrator reset'
    });
  }

  /**
   * Stop the orchestrator
   */
  public stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.emitEvent(OptimizationEventType.FAILED, {
      message: 'Resource orchestrator stopped'
    });
  }
}