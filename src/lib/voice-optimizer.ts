/**
 * Voice Asset Optimization System
 * Implements lazy loading and chunk splitting for voice assets
 */

export interface VoiceAsset {
  id: string;
  name: string;
  url: string;
  size: number;
  type: 'narrator' | 'character' | 'effect';
  compression: 'mp3' | 'ogg' | 'wav';
}

export interface VoiceLoadProgress {
  loaded: number;
  total: number;
  percent: number;
  currentAsset?: string;
}

export class VoiceOptimizer {
  private static instance: VoiceOptimizer;
  private cache = new Map<string, AudioBuffer>();
  private loadingQueue = new Map<string, Promise<AudioBuffer>>();
  private baseUrl = '/assets/voices/';

  static getInstance(): VoiceOptimizer {
    if (!VoiceOptimizer.instance) {
      VoiceOptimizer.instance = new VoiceOptimizer();
    }
    return VoiceOptimizer.instance;
  }

  /**
   * Lazy load voice asset with caching
   */
  async loadVoiceAsset(assetId: string, onProgress?: (progress: VoiceLoadProgress) => void): Promise<AudioBuffer> {
    // Check cache first
    if (this.cache.has(assetId)) {
      return this.cache.get(assetId)!;
    }

    // Check if already loading
    if (this.loadingQueue.has(assetId)) {
      return this.loadingQueue.get(assetId)!;
    }

    // Create new loading promise
    const loadPromise = this.loadAudioBuffer(assetId, onProgress);
    this.loadingQueue.set(assetId, loadPromise);

    try {
      const buffer = await loadPromise;
      this.cache.set(assetId, buffer);
      this.loadingQueue.delete(assetId);
      return buffer;
    } catch (error) {
      this.loadingQueue.delete(assetId);
      throw error;
    }
  }

  /**
   * Load audio buffer with compression
   */
  private async loadAudioBuffer(assetId: string, onProgress?: (progress: VoiceLoadProgress) => void): Promise<AudioBuffer> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const url = `${this.baseUrl}${assetId}.mp3`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load voice asset: ${assetId}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to read response stream');
    }

    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      chunks.push(value);
      loaded += value.length;
      
      if (onProgress && total > 0) {
        onProgress({
          loaded,
          total,
          percent: (loaded / total) * 100,
          currentAsset: assetId
        });
      }
    }

    const arrayBuffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    chunks.forEach(chunk => {
      arrayBuffer.set(chunk, offset);
      offset += chunk.length;
    });

    return audioContext.decodeAudioData(arrayBuffer.buffer);
  }

  /**
   * Preload critical voice assets
   */
  async preloadCriticalAssets(assetIds: string[]): Promise<void> {
    const promises = assetIds.map(id => this.loadVoiceAsset(id));
    await Promise.allSettled(promises);
  }

  /**
   * Clear cache to free memory
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Get loading progress for all active loads
   */
  getLoadingProgress(): Map<string, Promise<AudioBuffer>> {
    return new Map(this.loadingQueue);
  }
}

// Export singleton instance
export const voiceOptimizer = VoiceOptimizer.getInstance();