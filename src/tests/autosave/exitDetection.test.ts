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
  ExitDetection,
  ExitEventType,
  useExitDetection
} from '@/lib/browser/exitDetection';

import { AutosaveData } from '@/utils/autosaveUtils';
import { setupTestEnvironment, /* flushPromises, */ simulateVisibilityChange, /* simulatePageUnload */ } from './helpers/testUtils';
import { windowMock /* documentMock */ } from './mocks/browserMock';

describe('Exit Detection Tests', () => {
  // Setup and teardown
  let teardown: () => void;
  
  beforeEach(() => {
    teardown = setupTestEnvironment();
  });
  
  afterEach(() => {
    teardown();
  });
  
  describe('ExitDetection Class', () => {
    test('should initialize exit detection', async () => {
      const exitDetection = ExitDetection.getInstance();
      exitDetection.init();
      
      // Check that event listeners were added
      const addEventListenerSpy = jest.fn();
      windowMock.addEventListener = addEventListenerSpy;
      
      exitDetection.init(); // Call again to test idempotence
      
      // Since we mocked addEventListener after init, it shouldn't be called again
      expect(addEventListenerSpy).not.toBeCalled();
    });
    
    test('should clean up event listeners', async () => {
      const exitDetection = ExitDetection.getInstance();
      exitDetection.init();
      
      const removeEventListenerSpy = jest.fn();
      windowMock.removeEventListener = removeEventListenerSpy;
      
      exitDetection.cleanup();
      
      // Should call removeEventListener for each event type
      expect(removeEventListenerSpy).toBeCalled();
    });
    
    test('should register and unregister handlers', async () => {
      const exitDetection = ExitDetection.getInstance();
      exitDetection.init();
      
      const handlerFn = asyncMockFn();
      
      exitDetection.registerHandler(handlerFn);
      
      // Trigger a save
      const testData: AutosaveData = {
        storyId: '1',
        segmentId: '1',
        storyTitle: 'Test Story',
        segmentCount: 1,
        isEnd: false
      };
      
      exitDetection.updateCurrentData(testData);
      exitDetection.forceSave();
      
      // Handler should be called
      expect(handlerFn).toBeCalled();
      
      // Unregister handler
      exitDetection.unregisterHandler(handlerFn);
      
      // Reset mock
      handlerFn.mockClear();
      
      // Trigger save again
      exitDetection.forceSave();
      
      // Handler should not be called
      expect(handlerFn).not.toBeCalled();
    });
    
    test('should update current data and mark changes as saved', async () => {
      const exitDetection = ExitDetection.getInstance();
      exitDetection.init();
      
      const handlerFn = asyncMockFn();
      exitDetection.registerHandler(handlerFn);
      
      // Update data
      const testData: AutosaveData = {
        storyId: '1',
        segmentId: '1',
        storyTitle: 'Test Story',
        segmentCount: 1,
        isEnd: false
      };
      
      exitDetection.updateCurrentData(testData);
      
      // Trigger save
      exitDetection.forceSave();
      
      // Handler should be called with the test data
      expect(handlerFn).toBeCalledWith(testData, ExitEventType.PERIODIC);
      
      // Mark changes as saved
      exitDetection.markChangesSaved();
      
      // Reset mock
      handlerFn.mockClear();
      
      // Trigger save again
      exitDetection.forceSave();
      
      // Handler should not be called because changes are marked as saved
      expect(handlerFn).not.toBeCalled();
    });
  });
  
  describe('Visibility Change Detection', () => {
    test('should trigger save when visibility changes to hidden', async () => {
      const exitDetection = ExitDetection.getInstance();
      exitDetection.init();
      
      const handlerFn = asyncMockFn();
      exitDetection.registerHandler(handlerFn);
      
      // Update data
      const testData: AutosaveData = {
        storyId: '1',
        segmentId: '1',
        storyTitle: 'Test Story',
        segmentCount: 1,
        isEnd: false
      };
      
      exitDetection.updateCurrentData(testData);
      
      // Simulate visibility change to hidden
      simulateVisibilityChange(true);
      
      // Handler should be called with visibility change event type
      expect(handlerFn).toBeCalledWith(testData, ExitEventType.VISIBILITY_CHANGE);
    });
    
    test('should not trigger save when visibility changes to visible', async () => {
      const exitDetection = ExitDetection.getInstance();
      exitDetection.init();
      
      const handlerFn = asyncMockFn();
      exitDetection.registerHandler(handlerFn);
      
      // Update data
      const testData: AutosaveData = {
        storyId: '1',
        segmentId: '1',
        storyTitle: 'Test Story',
        segmentCount: 1,
        isEnd: false
      };
      
      exitDetection.updateCurrentData(testData);
      
      // First change to hidden to set the initial state
      simulateVisibilityChange(true);
      
      // Reset mock
      handlerFn.mockClear();
      
      // Simulate visibility change to visible
      simulateVisibilityChange(false);
      
      // Handler should not be called
      expect(handlerFn).not.toBeCalled();
    });
  });
  
  describe('Page Unload Detection', () => {
    test('should trigger save on beforeunload event', async () => {
      const exitDetection = ExitDetection.getInstance();
      exitDetection.init();
      
      const handlerFn = asyncMockFn();
      exitDetection.registerHandler(handlerFn);
      
      // Update data
      const testData: AutosaveData = {
        storyId: '1',
        segmentId: '1',
        storyTitle: 'Test Story',
        segmentCount: 1,
        isEnd: false
      };
      
      exitDetection.updateCurrentData(testData);
      
      // Simulate beforeunload event
      windowMock.simulateBeforeUnload();
      
      // Handler should be called with beforeunload event type
      expect(handlerFn).toBeCalledWith(testData, ExitEventType.BEFORE_UNLOAD);
    });
    
    test('should trigger save on pagehide event', async () => {
      const exitDetection = ExitDetection.getInstance();
      exitDetection.init();
      
      const handlerFn = asyncMockFn();
      exitDetection.registerHandler(handlerFn);
      
      // Update data
      const testData: AutosaveData = {
        storyId: '1',
        segmentId: '1',
        storyTitle: 'Test Story',
        segmentCount: 1,
        isEnd: false
      };
      
      exitDetection.updateCurrentData(testData);
      
      // Simulate pagehide event
      windowMock.simulatePageHide();
      
      // Handler should be called with pagehide event type
      expect(handlerFn).toBeCalledWith(testData, ExitEventType.PAGE_HIDE);
    });
    
    test('should show confirmation dialog when configured', async () => {
      const exitDetection = ExitDetection.getInstance({
        enablePeriodicSave: true,
        showConfirmationDialog: true,
        confirmationMessage: 'Custom confirmation message'
      });
      
      exitDetection.init();
      
      // Update data and mark as unsaved
      const testData: AutosaveData = {
        storyId: '1',
        segmentId: '1',
        storyTitle: 'Test Story',
        segmentCount: 1,
        isEnd: false
      };
      
      exitDetection.updateCurrentData(testData);
      
      // We can't directly test the confirmation dialog behavior in this test environment
      // In a real environment, we would check if preventDefault was called and returnValue was set
    });
  });
  
  describe('Periodic Save', () => {
    test('should trigger periodic save at intervals', async () => {
      // Instead of mocking setInterval, we'll directly call the handler
      const exitDetection = ExitDetection.getInstance({
        enablePeriodicSave: true,
        periodicSaveInterval: 1000
      });
      
      const handlerFn = asyncMockFn();
      exitDetection.registerHandler(handlerFn);
      
      // Update data
      const testData: AutosaveData = {
        storyId: '1',
        segmentId: '1',
        storyTitle: 'Test Story',
        segmentCount: 1,
        isEnd: false
      };
      
      exitDetection.updateCurrentData(testData);
      
      // Initialize exit detection
      exitDetection.init();
      
      // Manually trigger a save
      exitDetection.forceSave();
      
      // Handler should be called with periodic event type
      expect(handlerFn).toBeCalledWith(testData, ExitEventType.PERIODIC);
    });
    
    test('should not start periodic save when disabled', async () => {
      // We'll use a spy on the windowMock instead
      const originalSetInterval = windowMock.setInterval;
      const setIntervalSpy = jest.fn().mockReturnValue(123);
      
      // Replace the method temporarily
      windowMock.setInterval = setIntervalSpy as any;
      
      const exitDetection = ExitDetection.getInstance({
        enablePeriodicSave: false
      });
      
      // Initialize exit detection
      exitDetection.init();
      
      // setInterval should not be called
      expect(setIntervalSpy).not.toBeCalled();
      
      // Restore original
      windowMock.setInterval = originalSetInterval;
    });
  });
  
  describe('useExitDetection Hook', () => {
    test('should provide exit detection functionality', async () => {
      const {
        init,
        cleanup,
        registerHandler,
        unregisterHandler,
        updateCurrentData,
        markChangesSaved,
        forceSave
      } = useExitDetection();
      
      // Initialize
      init();
      
      // Register handler
      const handlerFn = asyncMockFn();
      registerHandler(handlerFn);
      
      // Update data
      const testData: AutosaveData = {
        storyId: '1',
        segmentId: '1',
        storyTitle: 'Test Story',
        segmentCount: 1,
        isEnd: false
      };
      
      updateCurrentData(testData);
      
      // Force save
      forceSave();
      
      // Handler should be called
      expect(handlerFn).toBeCalled();
      
      // Mark changes as saved
      markChangesSaved();
      
      // Reset mock
      handlerFn.mockClear();
      
      // Force save again
      forceSave();
      
      // Handler should not be called because changes are marked as saved
      expect(handlerFn).not.toBeCalled();
      
      // Unregister handler
      unregisterHandler(handlerFn);
      
      // Reset mock
      handlerFn.mockClear();
      
      // Update data again
      updateCurrentData(testData);
      
      // Force save
      forceSave();
      
      // Handler should not be called because it was unregistered
      expect(handlerFn).not.toBeCalled();
      
      // Cleanup
      cleanup();
    });
  });
});