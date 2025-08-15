/**
 * Simplified Database Query Optimization System
 * Provides basic caching without complex schema assumptions
 */

import { supabase } from '@/integrations/supabase/client';

export interface QueryOptimizationOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: { column: string; ascending: boolean };
  filters?: Record<string, any>;
}

export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private queryCache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  /**
   * Basic stories query without complex schema assumptions
   */
  async getStories(options: QueryOptimizationOptions = {}) {
    const cacheKey = `stories-${JSON.stringify(options)}`;
    
    // Check cache
    if (this.queryCache.has(cacheKey) && Date.now() - this.queryCache.get(cacheKey).timestamp < this.cacheTimeout) {
      return this.queryCache.get(cacheKey).data;
    }

    try {
      let query = supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching stories:', error);
        return [];
      }

      // Cache result
      this.queryCache.set(cacheKey, { data: data || [], timestamp: Date.now() });
      return data || [];
    } catch (error) {
      console.error('Error in getStories:', error);
      return [];
    }
  }

  /**
   * Basic story segments query
   */
  async getStorySegments(storyId: string) {
    const cacheKey = `segments-${storyId}`;
    
    if (this.queryCache.has(cacheKey) && Date.now() - this.queryCache.get(cacheKey).timestamp < this.cacheTimeout) {
      return this.queryCache.get(cacheKey).data;
    }

    try {
      const { data, error } = await supabase
        .from('story_segments')
        .select('*')
        .eq('story_id', storyId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching story segments:', error);
        return [];
      }

      this.queryCache.set(cacheKey, { data: data || [], timestamp: Date.now() });
      return data || [];
    } catch (error) {
      console.error('Error in getStorySegments:', error);
      return [];
    }
  }

  /**
   * Basic user stories query
   */
  async getUserStories(userId: string, options: QueryOptimizationOptions = {}) {
    const cacheKey = `user-stories-${userId}-${JSON.stringify(options)}`;
    
    if (this.queryCache.has(cacheKey) && Date.now() - this.queryCache.get(cacheKey).timestamp < this.cacheTimeout) {
      return this.queryCache.get(cacheKey).data;
    }

    try {
      let query = supabase
        .from('stories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching user stories:', error);
        return [];
      }

      this.queryCache.set(cacheKey, { data: data || [], timestamp: Date.now() });
      return data || [];
    } catch (error) {
      console.error('Error in getUserStories:', error);
      return [];
    }
  }

  /**
   * Simple batch fetch without complex joins
   */
  async getStoriesWithSegments(storyIds: string[]) {
    const cacheKey = `stories-with-segments-${storyIds.join(',')}`;
    
    if (this.queryCache.has(cacheKey) && Date.now() - this.queryCache.get(cacheKey).timestamp < this.cacheTimeout) {
      return this.queryCache.get(cacheKey).data;
    }

    try {
      // Fetch stories
      const { data: stories, error: storiesError } = await supabase
        .from('stories')
        .select('*')
        .in('id', storyIds);

      if (storiesError) {
        console.error('Error fetching stories:', storiesError);
        return [];
      }

      // Fetch segments for all stories in one query
      const { data: segments, error: segmentsError } = await supabase
        .from('story_segments')
        .select('*')
        .in('story_id', storyIds)
        .order('created_at', { ascending: true });

      if (segmentsError) {
        console.error('Error fetching segments:', segmentsError);
        return [];
      }

      // Combine data safely
      const result = (stories || []).map(story => {
        const storySegments = (segments || []).filter(segment => segment.story_id === story.id);
        return {
          ...story,
          segments: storySegments
        };
      });

      this.queryCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error in getStoriesWithSegments:', error);
      return [];
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.queryCache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; timeout: number } {
    return {
      size: this.queryCache.size,
      timeout: this.cacheTimeout
    };
  }
}

// Export singleton instance
export const databaseOptimizer = DatabaseOptimizer.getInstance();