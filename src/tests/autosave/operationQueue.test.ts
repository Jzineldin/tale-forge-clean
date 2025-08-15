import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
  asyncMockFn
} from './setup/jest.setup';

import {
  OperationQueue,
  // OperationResult,
  // OperationExecutor,
  useOperationQueue
} from '@/lib/storage/operationQueue';

import {
  OperationType,
  OperationStatus,
  // addOperation,
  // updateOperation,
  // getPendingOperations,
  // getFailedOperations
} from '@/lib/storage/indexedDB';

import {
  setupTestEnvironment,
  createTestOperationQueueItem,
  // flushPromises,
  TEST_STORES
} from './helpers/testUtils';

import { indexedDBMock } from './mocks/indexedDBMock';

describe('Operation Queue Tests', () => {
  // Setup and teardown
  let teardown: () => void;
  
  beforeEach(() => {
    teardown = setupTestEnvironment();
  });
  
  afterEach(() => {
    teardown();
  });
  
  describe('OperationQueue Class', () => {
    test('should add an operation to the queue', async () => {
      const operationQueue = OperationQueue.getInstance();
      
      const operationId = await operationQueue.addOperation(
        OperationType.INSERT,
        TEST_STORES.STORIES,
        '1',
        { id: '1', title: 'Test Story' }
      );
      
      // Check that the operation was added to IndexedDB
      const operations = indexedDBMock.getAllItems(TEST_STORES.OPERATION_QUEUE);
      expect(operations).toHaveLength(1);
      
      // Type assertion for the operation
      const operation = operations[0] as any;
      expect(operation.id).toBe(operationId);
      expect(operation.operationType).toBe(OperationType.INSERT);
      expect(operation.targetTable).toBe(TEST_STORES.STORIES);
      expect(operation.recordId).toBe('1');
      expect(operation.status).toBe(OperationStatus.PENDING);
    });
    
    test('should process the queue when executor is set', async () => {
      const operationQueue = OperationQueue.getInstance();
      
      // Add operations to the queue
      await operationQueue.addOperation(
        OperationType.INSERT,
        TEST_STORES.STORIES,
        '1',
        { id: '1', title: 'Test Story 1' }
      );
      
      await operationQueue.addOperation(
        OperationType.UPDATE,
        TEST_STORES.STORIES,
        '2',
        { id: '2', title: 'Test Story 2' }
      );
      
      // Set executor
      const executor = asyncMockFn();
      operationQueue.setExecutor(executor);
      
      // Process queue
      const results = await operationQueue.processQueue();
      
      // Executor should be called for each operation
      expect(executor).toBeCalled();
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      
      // Operations should be removed from the queue
      const operations = indexedDBMock.getAllItems(TEST_STORES.OPERATION_QUEUE);
      expect(operations).toHaveLength(0);
    });
    
    test('should handle errors during processing', async () => {
      const operationQueue = OperationQueue.getInstance();
      
      // Add operations to the queue
      await operationQueue.addOperation(
        OperationType.INSERT,
        TEST_STORES.STORIES,
        '1',
        { id: '1', title: 'Test Story 1' }
      );
      
      await operationQueue.addOperation(
        OperationType.UPDATE,
        TEST_STORES.STORIES,
        '2',
        { id: '2', title: 'Test Story 2' }
      );
      
      // Set executor that fails for the second operation
      const executor = jest.fn().mockImplementation((operation) => {
        if (operation.recordId === '2') {
          return Promise.reject(new Error('Test error'));
        }
        return Promise.resolve();
      });
      
      operationQueue.setExecutor(executor);
      
      // Process queue
      const results = await operationQueue.processQueue();
      
      // Executor should be called for each operation
      expect(executor).toBeCalled();
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBeDefined();
      
      // Failed operation should be marked as failed
      const operations = indexedDBMock.getAllItems(TEST_STORES.OPERATION_QUEUE);
      expect(operations).toHaveLength(1);
      
      // Type assertion for the operation
      const failedOp = operations[0] as any;
      expect(failedOp.recordId).toBe('2');
      expect(failedOp.status).toBe(OperationStatus.FAILED);
      expect(failedOp.retryCount).toBe(1);
    });
    
    test('should retry failed operations', async () => {
      const operationQueue = OperationQueue.getInstance();
      
      // Add a failed operation
      const operation = createTestOperationQueueItem(
        '1',
        OperationType.UPDATE,
        TEST_STORES.STORIES,
        '1',
        OperationStatus.FAILED
      );
      
      operation.retryCount = 1;
      // Add error property
      (operation as any).error = 'Previous error';
      
      indexedDBMock.addItem(TEST_STORES.OPERATION_QUEUE, operation);
      
      // Set executor
      const executor = asyncMockFn();
      operationQueue.setExecutor(executor);
      
      // Retry operation
      const result = await operationQueue.retryOperation('1');
      
      // Executor should be called
      expect(executor).toBeCalled();
      expect(result.success).toBe(true);
      
      // Operation should be removed from the queue
      const operations = indexedDBMock.getAllItems(TEST_STORES.OPERATION_QUEUE);
      expect(operations).toHaveLength(0);
    });
    
    test('should retry all failed operations', async () => {
      const operationQueue = OperationQueue.getInstance();
      
      // Add failed operations
      const operation1 = createTestOperationQueueItem(
        '1',
        OperationType.UPDATE,
        TEST_STORES.STORIES,
        '1',
        OperationStatus.FAILED
      );
      
      const operation2 = createTestOperationQueueItem(
        '2',
        OperationType.DELETE,
        TEST_STORES.STORIES,
        '2',
        OperationStatus.FAILED
      );
      
      indexedDBMock.addItem(TEST_STORES.OPERATION_QUEUE, operation1);
      indexedDBMock.addItem(TEST_STORES.OPERATION_QUEUE, operation2);
      
      // Set executor
      const executor = asyncMockFn();
      operationQueue.setExecutor(executor);
      
      // Retry all failed operations
      const results = await operationQueue.retryAllFailedOperations();
      
      // Executor should be called for each operation
      expect(executor).toBeCalled();
      expect(results).toHaveLength(2);
      
      // Operations should be removed from the queue
      const operations = indexedDBMock.getAllItems(TEST_STORES.OPERATION_QUEUE);
      expect(operations).toHaveLength(0);
    });
    
    test('should get pending operation count', async () => {
      const operationQueue = OperationQueue.getInstance();
      
      // Add operations
      await operationQueue.addOperation(
        OperationType.INSERT,
        TEST_STORES.STORIES,
        '1',
        { id: '1', title: 'Test Story 1' }
      );
      
      await operationQueue.addOperation(
        OperationType.UPDATE,
        TEST_STORES.STORIES,
        '2',
        { id: '2', title: 'Test Story 2' }
      );
      
      // Get pending operation count
      const count = await operationQueue.getPendingOperationCount();
      
      expect(count).toBe(2);
    });
    
    test('should get failed operation count', async () => {
      const operationQueue = OperationQueue.getInstance();
      
      // Add failed operations
      const operation1 = createTestOperationQueueItem(
        '1',
        OperationType.UPDATE,
        TEST_STORES.STORIES,
        '1',
        OperationStatus.FAILED
      );
      
      const operation2 = createTestOperationQueueItem(
        '2',
        OperationType.DELETE,
        TEST_STORES.STORIES,
        '2',
        OperationStatus.FAILED
      );
      
      indexedDBMock.addItem(TEST_STORES.OPERATION_QUEUE, operation1);
      indexedDBMock.addItem(TEST_STORES.OPERATION_QUEUE, operation2);
      
      // Get failed operation count
      const count = await operationQueue.getFailedOperationCount();
      
      expect(count).toBe(2);
    });
    
    test('should check if there are pending operations', async () => {
      const operationQueue = OperationQueue.getInstance();
      
      // Initially there should be no pending operations
      const initialHasPending = await operationQueue.hasPendingOperations();
      expect(initialHasPending).toBe(false);
      
      // Add an operation
      await operationQueue.addOperation(
        OperationType.INSERT,
        TEST_STORES.STORIES,
        '1',
        { id: '1', title: 'Test Story' }
      );
      
      // Now there should be pending operations
      const hasPending = await operationQueue.hasPendingOperations();
      expect(hasPending).toBe(true);
    });
  });
  
  describe('useOperationQueue Hook', () => {
    test('should provide operation queue functionality', async () => {
      const {
        setExecutor,
        addOperation,
        processQueue,
        // retryOperation,
        // retryAllFailedOperations,
        getPendingOperationCount,
        // getFailedOperationCount,
        hasPendingOperations
      } = useOperationQueue();
      
      // Set executor
      const executor = asyncMockFn();
      setExecutor(executor);
      
      // Add operation
      await addOperation(
        OperationType.INSERT,
        TEST_STORES.STORIES,
        '1',
        { id: '1', title: 'Test Story' }
      );
      
      // Check that the operation was added
      const hasPendingOps = await hasPendingOperations();
      expect(hasPendingOps).toBe(true);
      
      const pendingCount = await getPendingOperationCount();
      expect(pendingCount).toBe(1);
      
      // Process queue
      const results = await processQueue();
      
      // Executor should be called
      expect(executor).toBeCalled();
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      
      // No more pending operations
      const finalHasPending = await hasPendingOperations();
      expect(finalHasPending).toBe(false);
    });
  });
  
  describe('Operation Executor', () => {
    test('should execute insert operations', async () => {
      const operationQueue = OperationQueue.getInstance();
      
      // Mock the executor to track calls
      const executorSpy = jest.fn().mockResolvedValue(undefined);
      operationQueue.setExecutor(executorSpy);
      
      // Add an insert operation
      await operationQueue.addOperation(
        OperationType.INSERT,
        TEST_STORES.STORIES,
        '1',
        { id: '1', title: 'Test Story' }
      );
      
      // Process queue
      await operationQueue.processQueue();
      
      // Executor should be called with the insert operation
      expect(executorSpy).toBeCalled();
      const operation = executorSpy.calls[0][0];
      expect(operation.operationType).toBe(OperationType.INSERT);
      expect(operation.targetTable).toBe(TEST_STORES.STORIES);
      expect(operation.recordId).toBe('1');
    });
    
    test('should execute update operations', async () => {
      const operationQueue = OperationQueue.getInstance();
      
      // Mock the executor to track calls
      const executorSpy = jest.fn().mockResolvedValue(undefined);
      operationQueue.setExecutor(executorSpy);
      
      // Add an update operation
      await operationQueue.addOperation(
        OperationType.UPDATE,
        TEST_STORES.STORIES,
        '1',
        { id: '1', title: 'Updated Story' }
      );
      
      // Process queue
      await operationQueue.processQueue();
      
      // Executor should be called with the update operation
      expect(executorSpy).toBeCalled();
      const operation = executorSpy.calls[0][0];
      expect(operation.operationType).toBe(OperationType.UPDATE);
      expect(operation.targetTable).toBe(TEST_STORES.STORIES);
      expect(operation.recordId).toBe('1');
      expect(operation.payload.title).toBe('Updated Story');
    });
    
    test('should execute delete operations', async () => {
      const operationQueue = OperationQueue.getInstance();
      
      // Mock the executor to track calls
      const executorSpy = jest.fn().mockResolvedValue(undefined);
      operationQueue.setExecutor(executorSpy);
      
      // Add a delete operation
      await operationQueue.addOperation(
        OperationType.DELETE,
        TEST_STORES.STORIES,
        '1',
        { id: '1' }
      );
      
      // Process queue
      await operationQueue.processQueue();
      
      // Executor should be called with the delete operation
      expect(executorSpy).toBeCalled();
      const operation = executorSpy.calls[0][0];
      expect(operation.operationType).toBe(OperationType.DELETE);
      expect(operation.targetTable).toBe(TEST_STORES.STORIES);
      expect(operation.recordId).toBe('1');
    });
  });
});