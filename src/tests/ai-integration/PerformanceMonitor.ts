import { supabase } from '@/integrations/supabase/client';

export interface PerformanceMetrics {
  responseTime: number;
  tokenUsage: number;
  retryCount: number;
  errorRate: number;
  cacheHitRate: number;
  contextWindowUsage: number;
  timestamp: string;
}

export interface AIOperationMetrics {
  operationType: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  retries: number;
  tokensUsed: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  summary: {
    avgResponseTime: number;
    totalTokensUsed: number;
    successRate: number;
    errorRate: number;
    totalOperations: number;
    cacheEfficiency: number;
  };
  byOperation: Record<string, OperationStats>;
  byTimeRange: TimeRangeStats[];
  alerts: PerformanceAlert[];
  recommendations: string[];
}

export interface OperationStats {
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  avgTokens: number;
  errors: string[];
}

export interface TimeRangeStats {
  timeRange: string;
  operations: number;
  avgResponseTime: number;
  peakLoad: number;
  errors: number;
}

export interface PerformanceAlert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: string;
}

export class PerformanceMonitor {
  private operations: AIOperationMetrics[] = [];
  private cacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0
  };
  private readonly thresholds = {
    responseTime: {
      excellent: 500,
      good: 1000,
      acceptable: 2000,
      poor: 5000
    },
    tokenUsage: {
      low: 500,
      medium: 1000,
      high: 2000,
      excessive: 4000
    },
    errorRate: {
      excellent: 0.01,
      good: 0.05,
      acceptable: 0.1,
      poor: 0.2
    },
    retryRate: {
      excellent: 0.05,
      good: 0.1,
      acceptable: 0.2,
      poor: 0.3
    }
  };

  /**
   * Start monitoring an AI operation
   */
  startOperation(operationType: string, metadata?: Record<string, any>): string {
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.operations.push({
      operationType,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      success: false,
      retries: 0,
      tokensUsed: 0,
      metadata: metadata || {}
    });
    
    return operationId;
  }

  /**
   * End monitoring an AI operation
   */
  endOperation(
    operationId: string,
    success: boolean,
    tokensUsed: number = 0,
    error?: string
  ): void {
    const operation = this.operations.find(op => 
      `op_${op.startTime}_${op.metadata?.id}` === operationId
    );
    
    if (operation) {
      operation.endTime = Date.now();
      operation.duration = operation.endTime - operation.startTime;
      operation.success = success;
      operation.tokensUsed = tokensUsed;
      if (error) operation.error = error;
      
      // Store metrics
      this.storeMetrics(operation);
    }
  }

  /**
   * Record a retry attempt
   */
  recordRetry(operationId: string): void {
    const operation = this.operations.find(op => 
      `op_${op.startTime}_${op.metadata?.id}` === operationId
    );
    
    if (operation) {
      operation.retries++;
    }
  }

  /**
   * Record cache hit/miss
   */
  recordCacheAccess(hit: boolean): void {
    this.cacheStats.totalRequests++;
    if (hit) {
      this.cacheStats.hits++;
    } else {
      this.cacheStats.misses++;
    }
  }

  /**
   * Calculate current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    const recentOps = this.getRecentOperations(300000); // Last 5 minutes
    
    const avgResponseTime = this.calculateAverageResponseTime(recentOps);
    const totalTokens = recentOps.reduce((sum, op) => sum + op.tokensUsed, 0);
    const failedOps = recentOps.filter(op => !op.success).length;
    const retriedOps = recentOps.filter(op => op.retries > 0).length;
    
    return {
      responseTime: avgResponseTime,
      tokenUsage: totalTokens,
      retryCount: retriedOps,
      errorRate: recentOps.length > 0 ? (failedOps / recentOps.length) * 100 : 0,
      cacheHitRate: this.calculateCacheHitRate(),
      contextWindowUsage: this.calculateContextWindowUsage(totalTokens),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate performance report
   */
  generateReport(timeRangeMs: number = 3600000): PerformanceReport {
    const operations = this.getRecentOperations(timeRangeMs);
    
    const summary = this.calculateSummary(operations);
    const byOperation = this.groupByOperation(operations);
    const byTimeRange = this.groupByTimeRange(operations);
    const alerts = this.checkAlerts(summary, operations);
    const recommendations = this.generateRecommendations(summary, alerts);
    
    return {
      summary,
      byOperation,
      byTimeRange,
      alerts,
      recommendations
    };
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(operations: AIOperationMetrics[]): PerformanceReport['summary'] {
    const successfulOps = operations.filter(op => op.success);
    const totalTokens = operations.reduce((sum, op) => sum + op.tokensUsed, 0);
    
    return {
      avgResponseTime: this.calculateAverageResponseTime(operations),
      totalTokensUsed: totalTokens,
      successRate: operations.length > 0 ? (successfulOps.length / operations.length) * 100 : 100,
      errorRate: operations.length > 0 ? ((operations.length - successfulOps.length) / operations.length) * 100 : 0,
      totalOperations: operations.length,
      cacheEfficiency: this.calculateCacheHitRate()
    };
  }

  /**
   * Group operations by type
   */
  private groupByOperation(operations: AIOperationMetrics[]): Record<string, OperationStats> {
    const grouped: Record<string, OperationStats> = {};
    
    operations.forEach(op => {
      if (!grouped[op.operationType]) {
        grouped[op.operationType] = {
          count: 0,
          avgDuration: 0,
          minDuration: Infinity,
          maxDuration: 0,
          successRate: 0,
          avgTokens: 0,
          errors: []
        };
      }
      
      const stats = grouped[op.operationType];
      stats.count++;
      stats.avgDuration = ((stats.avgDuration * (stats.count - 1)) + op.duration) / stats.count;
      stats.minDuration = Math.min(stats.minDuration, op.duration);
      stats.maxDuration = Math.max(stats.maxDuration, op.duration);
      stats.avgTokens = ((stats.avgTokens * (stats.count - 1)) + op.tokensUsed) / stats.count;
      
      if (op.success) {
        stats.successRate = ((stats.successRate * (stats.count - 1)) + 100) / stats.count;
      } else {
        stats.successRate = (stats.successRate * (stats.count - 1)) / stats.count;
        if (op.error && !stats.errors.includes(op.error)) {
          stats.errors.push(op.error);
        }
      }
    });
    
    return grouped;
  }

  /**
   * Group operations by time range
   */
  private groupByTimeRange(operations: AIOperationMetrics[]): TimeRangeStats[] {
    const ranges: TimeRangeStats[] = [];
    const rangeSize = 300000; // 5 minute ranges
    
    if (operations.length === 0) return ranges;
    
    const minTime = Math.min(...operations.map(op => op.startTime));
    const maxTime = Math.max(...operations.map(op => op.endTime || op.startTime));
    
    for (let time = minTime; time <= maxTime; time += rangeSize) {
      const rangeOps = operations.filter(op => 
        op.startTime >= time && op.startTime < time + rangeSize
      );
      
      if (rangeOps.length > 0) {
        ranges.push({
          timeRange: new Date(time).toISOString(),
          operations: rangeOps.length,
          avgResponseTime: this.calculateAverageResponseTime(rangeOps),
          peakLoad: this.calculatePeakLoad(rangeOps),
          errors: rangeOps.filter(op => !op.success).length
        });
      }
    }
    
    return ranges;
  }

  /**
   * Check for performance alerts
   */
  private checkAlerts(
    summary: PerformanceReport['summary'],
    operations: AIOperationMetrics[]
  ): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];
    
    // Check response time
    if (summary.avgResponseTime > this.thresholds.responseTime.poor) {
      alerts.push({
        severity: 'critical',
        metric: 'responseTime',
        value: summary.avgResponseTime,
        threshold: this.thresholds.responseTime.poor,
        message: `Average response time (${summary.avgResponseTime.toFixed(0)}ms) exceeds critical threshold`,
        timestamp: new Date().toISOString()
      });
    } else if (summary.avgResponseTime > this.thresholds.responseTime.acceptable) {
      alerts.push({
        severity: 'high',
        metric: 'responseTime',
        value: summary.avgResponseTime,
        threshold: this.thresholds.responseTime.acceptable,
        message: `Average response time (${summary.avgResponseTime.toFixed(0)}ms) is poor`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check error rate
    const errorRate = summary.errorRate / 100;
    if (errorRate > this.thresholds.errorRate.poor) {
      alerts.push({
        severity: 'critical',
        metric: 'errorRate',
        value: summary.errorRate,
        threshold: this.thresholds.errorRate.poor * 100,
        message: `Error rate (${summary.errorRate.toFixed(1)}%) is critically high`,
        timestamp: new Date().toISOString()
      });
    } else if (errorRate > this.thresholds.errorRate.acceptable) {
      alerts.push({
        severity: 'high',
        metric: 'errorRate',
        value: summary.errorRate,
        threshold: this.thresholds.errorRate.acceptable * 100,
        message: `Error rate (${summary.errorRate.toFixed(1)}%) exceeds acceptable threshold`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check token usage
    const avgTokensPerOp = summary.totalTokensUsed / Math.max(summary.totalOperations, 1);
    if (avgTokensPerOp > this.thresholds.tokenUsage.excessive) {
      alerts.push({
        severity: 'high',
        metric: 'tokenUsage',
        value: avgTokensPerOp,
        threshold: this.thresholds.tokenUsage.excessive,
        message: `Average token usage per operation (${avgTokensPerOp.toFixed(0)}) is excessive`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check cache efficiency
    if (summary.cacheEfficiency < 50) {
      alerts.push({
        severity: 'medium',
        metric: 'cacheEfficiency',
        value: summary.cacheEfficiency,
        threshold: 50,
        message: `Cache hit rate (${summary.cacheEfficiency.toFixed(1)}%) is low`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for retry patterns
    const retryRate = operations.filter(op => op.retries > 0).length / Math.max(operations.length, 1);
    if (retryRate > this.thresholds.retryRate.poor) {
      alerts.push({
        severity: 'high',
        metric: 'retryRate',
        value: retryRate * 100,
        threshold: this.thresholds.retryRate.poor * 100,
        message: `Retry rate (${(retryRate * 100).toFixed(1)}%) indicates stability issues`,
        timestamp: new Date().toISOString()
      });
    }
    
    return alerts;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    summary: PerformanceReport['summary'],
    alerts: PerformanceAlert[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Response time recommendations
    if (summary.avgResponseTime > this.thresholds.responseTime.acceptable) {
      recommendations.push('Consider implementing request batching to reduce API calls');
      recommendations.push('Optimize prompt engineering to reduce token usage');
      recommendations.push('Implement more aggressive caching strategies');
    }
    
    // Error rate recommendations
    if (summary.errorRate > this.thresholds.errorRate.acceptable * 100) {
      recommendations.push('Implement exponential backoff for retries');
      recommendations.push('Add fallback mechanisms for critical operations');
      recommendations.push('Review error logs to identify common failure patterns');
    }
    
    // Token usage recommendations
    const avgTokensPerOp = summary.totalTokensUsed / Math.max(summary.totalOperations, 1);
    if (avgTokensPerOp > this.thresholds.tokenUsage.high) {
      recommendations.push('Optimize prompts to be more concise');
      recommendations.push('Implement context compression techniques');
      recommendations.push('Consider using smaller model variants where appropriate');
    }
    
    // Cache efficiency recommendations
    if (summary.cacheEfficiency < 70) {
      recommendations.push('Increase cache TTL for frequently accessed data');
      recommendations.push('Implement predictive caching for common patterns');
      recommendations.push('Review cache key generation strategy');
    }
    
    // Retry pattern recommendations
    const hasHighRetries = alerts.some(a => a.metric === 'retryRate' && a.severity === 'high');
    if (hasHighRetries) {
      recommendations.push('Implement circuit breaker pattern to prevent cascading failures');
      recommendations.push('Add request timeout configurations');
      recommendations.push('Consider implementing request queuing for peak loads');
    }
    
    return recommendations;
  }

  /**
   * Helper methods
   */
  private getRecentOperations(timeRangeMs: number): AIOperationMetrics[] {
    const cutoff = Date.now() - timeRangeMs;
    return this.operations.filter(op => op.startTime >= cutoff);
  }

  private calculateAverageResponseTime(operations: AIOperationMetrics[]): number {
    if (operations.length === 0) return 0;
    const totalDuration = operations.reduce((sum, op) => sum + op.duration, 0);
    return totalDuration / operations.length;
  }

  private calculateCacheHitRate(): number {
    if (this.cacheStats.totalRequests === 0) return 100;
    return (this.cacheStats.hits / this.cacheStats.totalRequests) * 100;
  }

  private calculateContextWindowUsage(tokens: number): number {
    const maxContextTokens = 8192; // Typical context window
    return Math.min((tokens / maxContextTokens) * 100, 100);
  }

  private calculatePeakLoad(operations: AIOperationMetrics[]): number {
    if (operations.length === 0) return 0;
    
    // Find the maximum number of concurrent operations
    let maxConcurrent = 0;
    
    operations.forEach(op => {
      const concurrent = operations.filter(other => 
        other.startTime <= op.startTime && 
        (other.endTime || other.startTime + 10000) >= op.startTime
      ).length;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
    });
    
    return maxConcurrent;
  }

  /**
   * Store metrics in database
   */
  private async storeMetrics(operation: AIOperationMetrics): Promise<void> {
    try {
      // Note: This would store metrics in a real database
      console.log('Storing performance metrics:', {
        operation_type: operation.operationType,
        duration: operation.duration,
        success: operation.success,
        tokens_used: operation.tokensUsed,
        retries: operation.retries,
        error: operation.error
      });
      
      // In a real implementation:
      // await supabase
      //   .from('ai_performance_metrics')
      //   .insert({
      //     operation_type: operation.operationType,
      //     duration: operation.duration,
      //     success: operation.success,
      //     tokens_used: operation.tokensUsed,
      //     retries: operation.retries,
      //     error: operation.error,
      //     metadata: operation.metadata,
      //     created_at: new Date().toISOString()
      //   });
    } catch (error) {
      console.error('Error storing performance metrics:', error);
    }
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): {
    operations: AIOperationMetrics[];
    cacheStats: typeof this.cacheStats;
    currentMetrics: PerformanceMetrics;
    report: PerformanceReport;
  } {
    return {
      operations: this.operations,
      cacheStats: this.cacheStats,
      currentMetrics: this.getCurrentMetrics(),
      report: this.generateReport()
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.operations = [];
    this.cacheStats = {
      hits: 0,
      misses: 0,
      totalRequests: 0
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();