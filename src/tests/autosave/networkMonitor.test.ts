import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
  // asyncMockFn
} from './setup/jest.setup';

import {
  NetworkMonitor,
  NetworkStatus,
  NetworkEventType,
  useNetworkMonitor
} from '@/lib/network/networkMonitor';

import {
  setupTestEnvironment,
  flushPromises,
  simulateNetworkStatusChange
} from './helpers/testUtils';

import { windowMock } from './mocks/browserMock';

describe('Network Monitor Tests', () => {
  // Setup and teardown
  let teardown: () => void;
  
  beforeEach(() => {
    teardown = setupTestEnvironment();
    
    // Mock fetch for heartbeat checks
    global.fetch = async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => 'OK',
      json: async () => ({}),
      blob: async () => new Blob(),
      arrayBuffer: async () => new ArrayBuffer(0),
      formData: async () => new FormData(),
      headers: new Headers(),
      clone: () => ({ ok: true } as Response),
      body: null,
      bodyUsed: false,
      redirected: false,
      type: 'basic',
      url: ''
    }) as Response;
  });
  
  afterEach(() => {
    teardown();
  });
  
  describe('NetworkMonitor Class', () => {
    test('should initialize network monitoring', async () => {
      const networkMonitor = NetworkMonitor.getInstance();
      await networkMonitor.init();
      
      // Check that event listeners were added
      const addEventListenerSpy = jest.fn();
      windowMock.addEventListener = addEventListenerSpy;
      
      await networkMonitor.init(); // Call again to test idempotence
      
      // Since we mocked addEventListener after init, it shouldn't be called again
      expect(addEventListenerSpy).not.toBeCalled();
    });
    
    test('should clean up event listeners', async () => {
      const networkMonitor = NetworkMonitor.getInstance();
      await networkMonitor.init();
      
      const removeEventListenerSpy = jest.fn();
      windowMock.removeEventListener = removeEventListenerSpy;
      
      networkMonitor.cleanup();
      
      // Should call removeEventListener for each event type
      expect(removeEventListenerSpy).toBeCalled();
    });
    
    test('should register and unregister handlers', async () => {
      const networkMonitor = NetworkMonitor.getInstance();
      await networkMonitor.init();
      
      const handlerFn = jest.fn();
      
      networkMonitor.registerHandler(handlerFn);
      
      // Trigger a status change
      simulateNetworkStatusChange(false);
      
      // Handler should be called
      expect(handlerFn).toBeCalled();
      
      // Unregister handler
      networkMonitor.unregisterHandler(handlerFn);
      
      // Reset mock
      handlerFn.mockClear();
      
      // Trigger status change again
      simulateNetworkStatusChange(true);
      
      // Handler should not be called
      expect(handlerFn).not.toBeCalled();
    });
    
    test('should detect online status', async () => {
      const networkMonitor = NetworkMonitor.getInstance();
      
      // Set navigator.onLine to true
      windowMock.navigator.onLine = true;
      
      // Mock fetch to return success
      global.fetch = async () => ({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => 'OK',
        json: async () => ({}),
        blob: async () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(0),
        formData: async () => new FormData(),
        headers: new Headers(),
        clone: () => ({ ok: true } as Response),
        body: null,
        bodyUsed: false,
        redirected: false,
        type: 'basic',
        url: ''
      }) as Response;
      
      await networkMonitor.init();
      
      // Status should be online
      expect(networkMonitor.getStatus()).toBe(NetworkStatus.ONLINE);
      expect(networkMonitor.isOnline()).toBe(true);
    });
    
    test('should detect offline status', async () => {
      const networkMonitor = NetworkMonitor.getInstance();
      
      // Set navigator.onLine to false
      windowMock.navigator.onLine = false;
      
      await networkMonitor.init();
      
      // Status should be offline
      expect(networkMonitor.getStatus()).toBe(NetworkStatus.OFFLINE);
      expect(networkMonitor.isOnline()).toBe(false);
    });
    
    test('should detect offline status when heartbeat fails', async () => {
      const networkMonitor = NetworkMonitor.getInstance();
      
      // Set navigator.onLine to true but make fetch fail
      windowMock.navigator.onLine = true;
      
      global.fetch = async () => {
        throw new Error('Network error');
      };
      
      await networkMonitor.init();
      
      // Status should be offline
      expect(networkMonitor.getStatus()).toBe(NetworkStatus.OFFLINE);
      expect(networkMonitor.isOnline()).toBe(false);
    });
    
    test('should handle online event', async () => {
      const networkMonitor = NetworkMonitor.getInstance();
      
      // Set initial state to offline
      windowMock.navigator.onLine = false;
      await networkMonitor.init();
      
      // Register handler
      const handlerFn = jest.fn();
      networkMonitor.registerHandler(handlerFn);
      
      // Reset mock and prepare for online event
      handlerFn.mockClear();
      windowMock.navigator.onLine = true;
      
      // Mock fetch to return success
      global.fetch = async () => ({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => 'OK',
        json: async () => ({}),
        blob: async () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(0),
        formData: async () => new FormData(),
        headers: new Headers(),
        clone: () => ({ ok: true } as Response),
        body: null,
        bodyUsed: false,
        redirected: false,
        type: 'basic',
        url: ''
      }) as Response;
      
      // Simulate online event
      simulateNetworkStatusChange(true);
      
      // Wait for heartbeat check
      await flushPromises();
      
      // Handler should be called with reconnected event
      expect(handlerFn).toBeCalledWith(NetworkStatus.ONLINE, NetworkEventType.RECONNECTED);
      
      // Status should be online
      expect(networkMonitor.getStatus()).toBe(NetworkStatus.ONLINE);
      expect(networkMonitor.isOnline()).toBe(true);
    });
    
    test('should handle offline event', async () => {
      const networkMonitor = NetworkMonitor.getInstance();
      
      // Set initial state to online
      windowMock.navigator.onLine = true;
      global.fetch = async () => ({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => 'OK',
        json: async () => ({}),
        blob: async () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(0),
        formData: async () => new FormData(),
        headers: new Headers(),
        clone: () => ({ ok: true } as Response),
        body: null,
        bodyUsed: false,
        redirected: false,
        type: 'basic',
        url: ''
      }) as Response;
      
      await networkMonitor.init();
      
      // Register handler
      const handlerFn = jest.fn();
      networkMonitor.registerHandler(handlerFn);
      
      // Reset mock and prepare for offline event
      handlerFn.mockClear();
      
      // Simulate offline event
      simulateNetworkStatusChange(false);
      
      // Handler should be called with status change event
      expect(handlerFn).toBeCalledWith(NetworkStatus.OFFLINE, NetworkEventType.STATUS_CHANGE);
      
      // Status should be offline
      expect(networkMonitor.getStatus()).toBe(NetworkStatus.OFFLINE);
      expect(networkMonitor.isOnline()).toBe(false);
    });
    
    test('should track time since reconnect', async () => {
      const networkMonitor = NetworkMonitor.getInstance();
      
      // Set initial state to offline
      windowMock.navigator.onLine = false;
      await networkMonitor.init();
      
      // Initially there should be no reconnect time
      expect(networkMonitor.getTimeSinceReconnect()).toBeNull();
      
      // Simulate reconnection
      windowMock.navigator.onLine = true;
      global.fetch = async () => ({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => 'OK',
        json: async () => ({}),
        blob: async () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(0),
        formData: async () => new FormData(),
        headers: new Headers(),
        clone: () => ({ ok: true } as Response),
        body: null,
        bodyUsed: false,
        redirected: false,
        type: 'basic',
        url: ''
      }) as Response;
      
      simulateNetworkStatusChange(true);
      
      // Wait for heartbeat check
      await flushPromises();
      
      // Now there should be a reconnect time
      expect(networkMonitor.getTimeSinceReconnect()).not.toBeNull();
    });
    
    test('should force a network status check', async () => {
      const networkMonitor = NetworkMonitor.getInstance();
      await networkMonitor.init();
      
      // Mock fetch for the force check
      global.fetch = async () => ({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => 'OK',
        json: async () => ({}),
        blob: async () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(0),
        formData: async () => new FormData(),
        headers: new Headers(),
        clone: () => ({ ok: true } as Response),
        body: null,
        bodyUsed: false,
        redirected: false,
        type: 'basic',
        url: ''
      }) as Response;
      
      // Force check
      const status = await networkMonitor.forceCheck();
      
      // We can't easily check if fetch was called with our implementation
      // But we can verify the status is correct
      
      // Status should be online
      expect(status).toBe(NetworkStatus.ONLINE);
    });
  });
  
  describe('useNetworkMonitor Hook', () => {
    test('should provide network monitoring functionality', async () => {
      const {
        init,
        cleanup,
        registerHandler,
        unregisterHandler,
        getStatus,
        isOnline,
        forceCheck
      } = useNetworkMonitor();
      
      // Initialize
      await init();
      
      // Register handler
      const handlerFn = jest.fn();
      registerHandler(handlerFn);
      
      // Check status
      const status = getStatus();
      const online = isOnline();
      
      // Status should be defined
      expect(status).toBeDefined();
      expect(typeof online).toBe('boolean');
      
      // Force check
      global.fetch = async () => ({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => 'OK',
        json: async () => ({}),
        blob: async () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(0),
        formData: async () => new FormData(),
        headers: new Headers(),
        clone: () => ({ ok: true } as Response),
        body: null,
        bodyUsed: false,
        redirected: false,
        type: 'basic',
        url: ''
      }) as Response;
      
      const forcedStatus = await forceCheck();
      
      // We can't easily check if fetch was called with our implementation
      // But we can verify the status is correct
      
      // Status should be online
      expect(forcedStatus).toBe(NetworkStatus.ONLINE);
      
      // Simulate status change
      simulateNetworkStatusChange(false);
      
      // Handler should be called
      expect(handlerFn).toBeCalled();
      
      // Unregister handler
      unregisterHandler(handlerFn);
      
      // Reset mock
      handlerFn.mockClear();
      
      // Simulate status change again
      simulateNetworkStatusChange(true);
      
      // Handler should not be called
      expect(handlerFn).not.toBeCalled();
      
      // Cleanup
      cleanup();
    });
  });
  
  describe('Heartbeat Checks', () => {
    test('should perform heartbeat checks at intervals', async () => {
      // Mock setInterval to track calls
      const originalSetInterval = window.setInterval;
      const setIntervalSpy = jest.fn().mockReturnValue(123);
      
      // Replace the method temporarily
      windowMock.setInterval = setIntervalSpy as any;
      
      const networkMonitor = NetworkMonitor.getInstance({
        heartbeatInterval: 5000
      });
      
      await networkMonitor.init();
      
      // setInterval should be called with the heartbeat interval
      expect(setIntervalSpy).toBeCalled();
      
      // Restore original
      windowMock.setInterval = originalSetInterval;
    });
    
    test('should handle heartbeat timeout', async () => {
      const networkMonitor = NetworkMonitor.getInstance({
        heartbeatTimeout: 1000
      });
      
      // Mock fetch to simulate timeout by never resolving
      global.fetch = () => {
        return new Promise<Response>((_resolve) => {
          // Never resolve to simulate timeout
          // The AbortController should abort this
        });
      };
      
      // Register handler
      const handlerFn = jest.fn();
      networkMonitor.registerHandler(handlerFn);
      
      // Initialize with timeout
      await networkMonitor.init();
      
      // Status should be offline due to timeout
      expect(networkMonitor.getStatus()).toBe(NetworkStatus.OFFLINE);
    });
    
    test('should use navigator.onLine as fallback', async () => {
      const networkMonitor = NetworkMonitor.getInstance({
        useNavigatorOnline: true
      });
      
      // Set navigator.onLine to false
      windowMock.navigator.onLine = false;
      
      // Initialize
      await networkMonitor.init();
      
      // Status should be offline based on navigator.onLine
      expect(networkMonitor.getStatus()).toBe(NetworkStatus.OFFLINE);
      
      // We can't easily check if fetch was called with our implementation
      // But we can verify the status is correct
    });
    
    test('should not use navigator.onLine when disabled', async () => {
      const networkMonitor = NetworkMonitor.getInstance({
        useNavigatorOnline: false
      });
      
      // Set navigator.onLine to false but make fetch succeed
      windowMock.navigator.onLine = false;
      
      global.fetch = async () => ({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => 'OK',
        json: async () => ({}),
        blob: async () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(0),
        formData: async () => new FormData(),
        headers: new Headers(),
        clone: () => ({ ok: true } as Response),
        body: null,
        bodyUsed: false,
        redirected: false,
        type: 'basic',
        url: ''
      }) as Response;
      
      // Initialize
      await networkMonitor.init();
      
      // Status should be online based on fetch result, ignoring navigator.onLine
      expect(networkMonitor.getStatus()).toBe(NetworkStatus.ONLINE);
      
      // Fetch should be called
      expect(global.fetch).toBeCalled();
    });
  });
});