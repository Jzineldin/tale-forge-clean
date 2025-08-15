/**
 * Tale Forge Unified Optimization Framework - Event Emitter
 * 
 * This file implements a simple event emitter for the optimization framework.
 */

import { OptimizationEvent, OptimizationEventType, OptimizationEventListener } from '../core/types';

/**
 * Event emitter for optimization events
 */
export class EventEmitter {
  private static instance: EventEmitter;
  private listeners: Map<OptimizationEventType, OptimizationEventListener[]> = new Map();
  private globalListeners: OptimizationEventListener[] = [];

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): EventEmitter {
    if (!EventEmitter.instance) {
      EventEmitter.instance = new EventEmitter();
    }
    return EventEmitter.instance;
  }

  /**
   * Add an event listener for a specific event type
   * 
   * @param eventType The event type to listen for
   * @param listener The listener function
   */
  public on(eventType: OptimizationEventType, listener: OptimizationEventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)!.push(listener);
  }

  /**
   * Add a global event listener for all event types
   * 
   * @param listener The listener function
   */
  public onAny(listener: OptimizationEventListener): void {
    this.globalListeners.push(listener);
  }

  /**
   * Remove an event listener for a specific event type
   * 
   * @param eventType The event type
   * @param listener The listener function to remove
   */
  public off(eventType: OptimizationEventType, listener: OptimizationEventListener): void {
    if (!this.listeners.has(eventType)) {
      return;
    }
    
    const eventListeners = this.listeners.get(eventType)!;
    const index = eventListeners.indexOf(listener);
    
    if (index !== -1) {
      eventListeners.splice(index, 1);
    }
  }

  /**
   * Remove a global event listener
   * 
   * @param listener The listener function to remove
   */
  public offAny(listener: OptimizationEventListener): void {
    const index = this.globalListeners.indexOf(listener);
    
    if (index !== -1) {
      this.globalListeners.splice(index, 1);
    }
  }

  /**
   * Emit an event
   * 
   * @param eventType The event type
   * @param event The event data
   */
  public emit(eventType: OptimizationEventType, event: OptimizationEvent): void {
    // Notify specific listeners
    if (this.listeners.has(eventType)) {
      for (const listener of this.listeners.get(eventType)!) {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      }
    }
    
    // Notify global listeners
    for (const listener of this.globalListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in global event listener:', error);
      }
    }
  }

  /**
   * Remove all listeners
   */
  public removeAllListeners(): void {
    this.listeners.clear();
    this.globalListeners = [];
  }

  /**
   * Get the number of listeners for a specific event type
   * 
   * @param eventType The event type
   * @returns The number of listeners
   */
  public listenerCount(eventType: OptimizationEventType): number {
    return (this.listeners.get(eventType) || []).length;
  }

  /**
   * Get the total number of listeners
   * 
   * @returns The total number of listeners
   */
  public totalListenerCount(): number {
    let count = this.globalListeners.length;
    
    for (const listeners of this.listeners.values()) {
      count += listeners.length;
    }
    
    return count;
  }
}

// Export singleton instance
export const eventEmitter = EventEmitter.getInstance();