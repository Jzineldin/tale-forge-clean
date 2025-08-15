/**
 * Offline operation queue with persistence
 * 
 * This module provides utilities for storing and managing database operations
 * that need to be performed when the user is back online.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  OperationType,
  // STORES,
  addOperation,
  updateOperation,
  deleteOperation,
  getPendingOperations,
  getFailedOperations,
  OperationQueueItem as IndexedDBOperationQueueItem,
  OperationStatus
} from './indexedDB';

// Re-export these types for use in other modules
export type OperationQueueItem = IndexedDBOperationQueueItem;
export { OperationStatus };

// Interface for operation result
export interface OperationResult {
  success: boolean;
  operationId: string;
  error?: Error;
}

// Interface for operation executor
export interface OperationExecutor {
  (operation: OperationQueueItem): Promise<void>;
}

// Configuration options for operation queue
export interface OperationQueueOptions {
  // Maximum number of retry attempts for failed operations
  maxRetryAttempts?: number;
  // Base delay for exponential backoff in milliseconds
  baseRetryDelay?: number;
  // Maximum delay for exponential backoff in milliseconds
  maxRetryDelay?: number;
  // Whether to automatically retry failed operations
  autoRetry?: boolean;
}

// Default options
const DEFAULT_OPTIONS: OperationQueueOptions = {
  maxRetryAttempts: 5,
  baseRetryDelay: 1000, // 1 second
  maxRetryDelay: 60000, // 1 minute
  autoRetry: true
};

// Class for managing operation queue
export class OperationQueue {
  private static instance: OperationQueue;
  private options: OperationQueueOptions;
  private executor: OperationExecutor | null = null;
  private isProcessing: boolean = false;
  private processingPromise: Promise<OperationResult[]> | null = null;

  private constructor(options: OperationQueueOptions = DEFAULT_OPTIONS) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Get the singleton instance of OperationQueue
   */
  public static getInstance(options?: OperationQueueOptions): OperationQueue {
    if (!OperationQueue.instance) {
      OperationQueue.instance = new OperationQueue(options);
    } else if (options) {
      // Update options if provided
      OperationQueue.instance.options = { ...OperationQueue.instance.options, ...options };
    }
    return OperationQueue.instance;
  }

  /**
   * Set the operation executor
   */
  public setExecutor(executor: OperationExecutor): void {
    this.executor = executor;
  }

  /**
   * Add an operation to the queue
   */
  public async addOperation(
    operationType: OperationType,
    targetTable: string,
    recordId: string,
    payload: any
  ): Promise<string> {
    const operation: OperationQueueItem = {
      id: uuidv4(),
      operationType,
      targetTable,
      recordId,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      status: OperationStatus.PENDING
    };

    await addOperation(operation);
    console.log(`Operation added to queue: ${operation.id} (${operationType} on ${targetTable})`);
    
    return operation.id;
  }

  /**
   * Process all pending operations
   */
  public async processQueue(): Promise<OperationResult[]> {
    if (this.isProcessing && this.processingPromise) {
      console.log('Queue is already being processed');
      return this.processingPromise;
    }

    if (!this.executor) {
      throw new Error('No operation executor set');
    }

    this.isProcessing = true;
    
    this.processingPromise = this._processQueue();
    const results = await this.processingPromise;
    
    this.isProcessing = false;
    this.processingPromise = null;
    
    return results;
  }

  /**
   * Internal method to process the queue
   */
  private async _processQueue(): Promise<OperationResult[]> {
    const pendingOperations = await getPendingOperations();
    console.log(`Processing ${pendingOperations.length} pending operations`);

    if (pendingOperations.length === 0) {
      return [];
    }

    // Sort operations by creation time
    const sortedOperations = pendingOperations.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const results: OperationResult[] = [];

    // Process operations sequentially
    for (const operation of sortedOperations) {
      try {
        // Mark operation as in progress
        operation.status = OperationStatus.IN_PROGRESS;
        await updateOperation(operation);

        // Execute operation
        await this.executor!(operation);

        // Mark operation as completed
        operation.status = OperationStatus.COMPLETED;
        await updateOperation(operation);

        // Delete completed operation from queue
        await deleteOperation(operation.id);

        results.push({
          success: true,
          operationId: operation.id
        });

        console.log(`Operation ${operation.id} completed successfully`);
      } catch (error) {
        console.error(`Error processing operation ${operation.id}:`, error);

        // Update retry count and status
        operation.retryCount++;
        operation.status = OperationStatus.FAILED;
        operation.error = (error as Error).message;
        await updateOperation(operation);

        results.push({
          success: false,
          operationId: operation.id,
          error: error as Error
        });

        // Check if we should retry
        if (this.options.autoRetry && operation.retryCount < (this.options.maxRetryAttempts || 5)) {
          this.scheduleRetry(operation);
        }
      }
    }

    return results;
  }

  /**
   * Schedule a retry for a failed operation with exponential backoff
   */
  private scheduleRetry(operation: OperationQueueItem): void {
    const baseDelay = this.options.baseRetryDelay || 1000;
    const maxDelay = this.options.maxRetryDelay || 60000;
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      baseDelay * Math.pow(2, operation.retryCount - 1),
      maxDelay
    );

    console.log(`Scheduling retry for operation ${operation.id} in ${delay}ms`);

    setTimeout(async () => {
      try {
        // Check if operation is still failed
        const currentOperation = await getPendingOperations();
        const failedOp = currentOperation.find(op => op.id === operation.id);
        
        if (failedOp && failedOp.status === OperationStatus.FAILED) {
          // Reset status to pending
          failedOp.status = OperationStatus.PENDING;
          await updateOperation(failedOp);
          
          // Process the queue
          if (!this.isProcessing) {
            this.processQueue().catch(error => {
              console.error('Error processing queue during retry:', error);
            });
          }
        }
      } catch (error) {
        console.error(`Error scheduling retry for operation ${operation.id}:`, error);
      }
    }, delay);
  }

  /**
   * Retry a specific failed operation
   */
  public async retryOperation(operationId: string): Promise<OperationResult> {
    if (!this.executor) {
      throw new Error('No operation executor set');
    }

    const failedOperations = await getFailedOperations();
    const operation = failedOperations.find(op => op.id === operationId);

    if (!operation) {
      throw new Error(`Operation ${operationId} not found or not failed`);
    }

    try {
      // Mark operation as pending
      operation.status = OperationStatus.PENDING;
      await updateOperation(operation);

      // Process the queue
      if (!this.isProcessing) {
        await this.processQueue();
      }

      return {
        success: true,
        operationId
      };
    } catch (error) {
      return {
        success: false,
        operationId,
        error: error as Error
      };
    }
  }

  /**
   * Retry all failed operations
   */
  public async retryAllFailedOperations(): Promise<OperationResult[]> {
    const failedOperations = await getFailedOperations();
    
    if (failedOperations.length === 0) {
      return [];
    }

    console.log(`Retrying ${failedOperations.length} failed operations`);

    // Mark all failed operations as pending
    for (const operation of failedOperations) {
      operation.status = OperationStatus.PENDING;
      await updateOperation(operation);
    }

    // Process the queue
    if (!this.isProcessing) {
      return await this.processQueue();
    }

    return failedOperations.map(op => ({
      success: true,
      operationId: op.id
    }));
  }

  /**
   * Get the count of pending operations
   */
  public async getPendingOperationCount(): Promise<number> {
    const pendingOperations = await getPendingOperations();
    return pendingOperations.length;
  }

  /**
   * Get the count of failed operations
   */
  public async getFailedOperationCount(): Promise<number> {
    const failedOperations = await getFailedOperations();
    return failedOperations.length;
  }

  /**
   * Check if there are any pending operations
   */
  public async hasPendingOperations(): Promise<boolean> {
    const count = await this.getPendingOperationCount();
    return count > 0;
  }
}

/**
 * Hook for using operation queue in components
 */
export const useOperationQueue = (options?: OperationQueueOptions) => {
  const operationQueue = OperationQueue.getInstance(options);

  const setExecutor = (executor: OperationExecutor) => {
    operationQueue.setExecutor(executor);
  };

  const addOperation = async (
    operationType: OperationType,
    targetTable: string,
    recordId: string,
    payload: any
  ): Promise<string> => {
    return await operationQueue.addOperation(operationType, targetTable, recordId, payload);
  };

  const processQueue = async (): Promise<OperationResult[]> => {
    return await operationQueue.processQueue();
  };

  const retryOperation = async (operationId: string): Promise<OperationResult> => {
    return await operationQueue.retryOperation(operationId);
  };

  const retryAllFailedOperations = async (): Promise<OperationResult[]> => {
    return await operationQueue.retryAllFailedOperations();
  };

  const getPendingOperationCount = async (): Promise<number> => {
    return await operationQueue.getPendingOperationCount();
  };

  const getFailedOperationCount = async (): Promise<number> => {
    return await operationQueue.getFailedOperationCount();
  };

  const hasPendingOperations = async (): Promise<boolean> => {
    return await operationQueue.hasPendingOperations();
  };

  return {
    setExecutor,
    addOperation,
    processQueue,
    retryOperation,
    retryAllFailedOperations,
    getPendingOperationCount,
    getFailedOperationCount,
    hasPendingOperations
  };
};