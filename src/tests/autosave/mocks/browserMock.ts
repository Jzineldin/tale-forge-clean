/**
 * Mock implementation of browser APIs for testing
 */

// Types of events we can simulate
export enum MockEventType {
  VISIBILITY_CHANGE = 'visibilitychange',
  BEFORE_UNLOAD = 'beforeunload',
  PAGE_HIDE = 'pagehide',
  ONLINE = 'online',
  OFFLINE = 'offline'
}

// Event listener type
type EventListener = (event: any) => void;

// Event listener registry
interface EventListenerRegistry {
  [eventType: string]: EventListener[];
}

// Mock window implementation
export class WindowMock {
  private static instance: WindowMock;
  private eventListeners: EventListenerRegistry = {};
  private _visibilityState: 'visible' | 'hidden' = 'visible';
  private _online: boolean = true;
  private _localStorage: Record<string, string> = {};
  private _sessionStorage: Record<string, string> = {};
  private _indexedDB: any = null;

  private constructor() {
    // Initialize event listeners
    this.eventListeners = {
      [MockEventType.VISIBILITY_CHANGE]: [],
      [MockEventType.BEFORE_UNLOAD]: [],
      [MockEventType.PAGE_HIDE]: [],
      [MockEventType.ONLINE]: [],
      [MockEventType.OFFLINE]: []
    };
  }

  /**
   * Get the singleton instance of WindowMock
   */
  public static getInstance(): WindowMock {
    if (!WindowMock.instance) {
      WindowMock.instance = new WindowMock();
    }
    return WindowMock.instance;
  }

  /**
   * Reset all mock data
   */
  public reset(): void {
    this.eventListeners = {
      [MockEventType.VISIBILITY_CHANGE]: [],
      [MockEventType.BEFORE_UNLOAD]: [],
      [MockEventType.PAGE_HIDE]: [],
      [MockEventType.ONLINE]: [],
      [MockEventType.OFFLINE]: []
    };
    this._visibilityState = 'visible';
    this._online = true;
    this._localStorage = {};
    this._sessionStorage = {};
  }

  /**
   * Add an event listener
   */
  public addEventListener(eventType: string, listener: EventListener): void {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    this.eventListeners[eventType].push(listener);
  }

  /**
   * Remove an event listener
   */
  public removeEventListener(eventType: string, listener: EventListener): void {
    if (!this.eventListeners[eventType]) {
      return;
    }
    this.eventListeners[eventType] = this.eventListeners[eventType].filter(l => l !== listener);
  }

  /**
   * Dispatch an event
   */
  public dispatchEvent(eventType: string, eventData: any = {}): void {
    if (!this.eventListeners[eventType]) {
      return;
    }
    
    const event = {
      type: eventType,
      target: this,
      ...eventData
    };
    
    this.eventListeners[eventType].forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in ${eventType} event listener:`, error);
      }
    });
  }

  /**
   * Simulate visibility change
   */
  public simulateVisibilityChange(isHidden: boolean): void {
    this._visibilityState = isHidden ? 'hidden' : 'visible';
    this.dispatchEvent(MockEventType.VISIBILITY_CHANGE);
  }

  /**
   * Simulate beforeunload event
   */
  public simulateBeforeUnload(): void {
    const event = {
      type: MockEventType.BEFORE_UNLOAD,
      preventDefault: () => {},
      returnValue: undefined
    };
    
    this.eventListeners[MockEventType.BEFORE_UNLOAD].forEach(listener => {
      try {
        const result = listener(event);
        if (result !== undefined) {
          event.returnValue = result;
        }
      } catch (error) {
        console.error('Error in beforeunload event listener:', error);
      }
    });
  }

  /**
   * Simulate pagehide event
   */
  public simulatePageHide(): void {
    this.dispatchEvent(MockEventType.PAGE_HIDE);
  }

  /**
   * Simulate online event
   */
  public simulateOnline(): void {
    this._online = true;
    this.dispatchEvent(MockEventType.ONLINE);
  }

  /**
   * Simulate offline event
   */
  public simulateOffline(): void {
    this._online = false;
    this.dispatchEvent(MockEventType.OFFLINE);
  }

  /**
   * Get visibility state
   */
  public get visibilityState(): 'visible' | 'hidden' {
    return this._visibilityState;
  }

  /**
   * Get online status
   */
  public get navigator(): { onLine: boolean } {
    return {
      onLine: this._online
    };
  }

  /**
   * Get localStorage
   */
  public get localStorage(): Storage {
    return {
      getItem: (key: string) => this._localStorage[key] || null,
      setItem: (key: string, value: string) => { this._localStorage[key] = value; },
      removeItem: (key: string) => { delete this._localStorage[key]; },
      clear: () => { this._localStorage = {}; },
      key: (index: number) => Object.keys(this._localStorage)[index] || null,
      length: Object.keys(this._localStorage).length
    };
  }

  /**
   * Get sessionStorage
   */
  public get sessionStorage(): Storage {
    return {
      getItem: (key: string) => this._sessionStorage[key] || null,
      setItem: (key: string, value: string) => { this._sessionStorage[key] = value; },
      removeItem: (key: string) => { delete this._sessionStorage[key]; },
      clear: () => { this._sessionStorage = {}; },
      key: (index: number) => Object.keys(this._sessionStorage)[index] || null,
      length: Object.keys(this._sessionStorage).length
    };
  }

  /**
   * Set indexedDB mock
   */
  public setIndexedDB(mock: any): void {
    this._indexedDB = mock;
  }

  /**
   * Get indexedDB
   */
  public get indexedDB(): any {
    return this._indexedDB;
  }

  /**
   * Mock setInterval
   */
  public setInterval(_callback: (...args: unknown[]) => void, _ms: number): number {
    // In tests, we don't actually want to wait
    // Just return a fake timer ID
    return 123;
  }

  /**
   * Mock clearInterval
   */
  public clearInterval(_id: number): void {
    // Do nothing in tests
  }

  /**
   * Mock setTimeout
   */
  public setTimeout(_callback: (...args: unknown[]) => void, _ms: number): number {
    // In tests, we can optionally execute the callback immediately
    // or just return a fake timer ID
    return 456;
  }

  /**
   * Mock clearTimeout
   */
  public clearTimeout(_id: number): void {
    // Do nothing in tests
  }
}

// Export singleton instance
export const windowMock = WindowMock.getInstance();

// Mock document implementation
export class DocumentMock {
  private static instance: DocumentMock;
  private _visibilityState: 'visible' | 'hidden' = 'visible';

  private constructor() {}

  /**
   * Get the singleton instance of DocumentMock
   */
  public static getInstance(): DocumentMock {
    if (!DocumentMock.instance) {
      DocumentMock.instance = new DocumentMock();
    }
    return DocumentMock.instance;
  }

  /**
   * Reset mock data
   */
  public reset(): void {
    this._visibilityState = 'visible';
  }

  /**
   * Get visibility state
   */
  public get visibilityState(): 'visible' | 'hidden' {
    return this._visibilityState;
  }

  /**
   * Set visibility state
   */
  public set visibilityState(value: 'visible' | 'hidden') {
    this._visibilityState = value;
  }
}

// Export singleton instance
export const documentMock = DocumentMock.getInstance();

// Setup function to install mocks
export function setupBrowserMocks(): () => void {
  // Save original globals
  const originalWindow = global.window;
  const originalDocument = global.document;
  
  // Install mocks
  Object.defineProperty(global, 'window', {
    value: windowMock
  });
  
  Object.defineProperty(global, 'document', {
    value: documentMock
  });
  
  // Return function to restore originals
  return function teardownBrowserMocks() {
    Object.defineProperty(global, 'window', {
      value: originalWindow
    });
    
    Object.defineProperty(global, 'document', {
      value: originalDocument
    });
  };
}