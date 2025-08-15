import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  Cpu,
  MemoryStick,
  Clock,
  Zap
} from 'lucide-react';
import { 
  OptimizerType, 
  OptimizationEventType, 
  PerformanceMetric, 
  OptimizationEvent 
} from '@/optimization/core/types';
import { 
  eventEmitter, 
  configManager, 
  featureFlagManager,
  performanceMonitorAdapter
} from '@/optimization/index';
import MetricsChart from '../shared/MetricsChart';
import EventsTable from '../shared/EventsTable';
import ConfigurationPanel from '../shared/ConfigurationPanel';
import FeatureToggle from '../shared/FeatureToggle';

const PerformanceMonitorView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [events, setEvents] = useState<OptimizationEvent[]>([]);
  const [config, setConfig] = useState(configManager.getOptimizerConfig(OptimizerType.PERFORMANCE));
  const [featureFlags, setFeatureFlags] = useState(featureFlagManager.getAllFlags().filter(
    flag => flag.name.startsWith('performance-')
  ));
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);

  useEffect(() => {
    loadData();
    
    // Subscribe to events
    const eventListener = (event: OptimizationEvent) => {
      if (event.optimizerType === OptimizerType.PERFORMANCE) {
        setEvents(prev => [event, ...prev].slice(0, 100));
        
        // Update metrics if a new metric is recorded
        if (event.type === OptimizationEventType.METRIC_RECORDED && event.data?.metric) {
          setMetrics(prev => [...prev, event.data.metric]);
        }
      }
    };
    
    eventEmitter.onAny(eventListener);
    
    return () => {
      eventEmitter.offAny(eventListener);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Get metrics
              setMetrics(performanceMonitorAdapter.instance.getMetrics());
      
      // Get events
      const perfEvents = Array.from(events)
        .filter(event => event.optimizerType === OptimizerType.PERFORMANCE)
        .sort((a, b) => b.timestamp - a.timestamp);
      setEvents(perfEvents);
      
      // Get config
      setConfig(configManager.getOptimizerConfig(OptimizerType.PERFORMANCE));
      
      // Get feature flags
      setFeatureFlags(featureFlagManager.getAllFlags().filter(
        flag => flag.name.startsWith('performance-')
      ));
      
      // Sample performance stats
      setPerformanceStats({
        totalOptimizations: 342,
        successfulOptimizations: 325,
        failedOptimizations: 17,
        averageOptimizationTime: 125, // ms
        totalTimeSaved: 45.2, // seconds
        resourcesSaved: {
          cpu: 15.3, // %
          memory: 22.1, // %
          network: 18.7 // %
        },
        optimizationTypes: {
          'image-compression': 145,
          'voice-caching': 98,
          'database-query': 67,
          'lazy-loading': 32
        }
      });
      
      // Sample system metrics
      setSystemMetrics({
        cpu: {
          usage: 42.3,
          cores: 8,
          frequency: 3.2 // GHz
        },
        memory: {
          used: 6.8, // GB
          total: 16, // GB
          usage: 42.5 // %
        },
        network: {
          downloadSpeed: 125.4, // Mbps
          uploadSpeed: 45.2, // Mbps
          latency: 23 // ms
        },
        performance: {
          fps: 58.7,
          loadTime: 1.2, // seconds
          interactiveTime: 2.1, // seconds
          firstContentfulPaint: 0.8 // seconds
        }
      });
    } catch (error) {
      console.error('Error loading performance monitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (newConfig: any) => {
    configManager.updateOptimizerConfig(OptimizerType.PERFORMANCE, newConfig);
    setConfig(configManager.getOptimizerConfig(OptimizerType.PERFORMANCE));
  };

  const handleResetConfig = () => {
    configManager.resetToDefaults();
    setConfig(configManager.getOptimizerConfig(OptimizerType.PERFORMANCE));
  };

  const handleToggleFeature = (featureName: string, enabled: boolean) => {
    if (enabled) {
      featureFlagManager.enableFlag(featureName);
    } else {
      featureFlagManager.disableFlag(featureName);
    }
    
    setFeatureFlags(featureFlagManager.getAllFlags().filter(
      flag => flag.name.startsWith('performance-')
    ));
  };

  const handleRolloutChange = (featureName: string, percentage: number) => {
    featureFlagManager.setRolloutPercentage(featureName, percentage);
    
    setFeatureFlags(featureFlagManager.getAllFlags().filter(
      flag => flag.name.startsWith('performance-')
    ));
  };

  // Group metrics by name
  const groupedMetrics: Record<string, PerformanceMetric[]> = {};
  metrics.forEach(metric => {
    if (!groupedMetrics[metric.name]) {
      groupedMetrics[metric.name] = [];
    }
    groupedMetrics[metric.name].push(metric);
  });

  // Get status color based on value and threshold
  const getStatusColor = (value: number, threshold: number) => {
    if (value < threshold * 0.7) return 'text-green-500';
    if (value < threshold) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link 
            to="/admin/system" 
            className="mr-4 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center">
            <div className="p-2 bg-slate-700 rounded-lg mr-3">
              <Activity className="h-5 w-5 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Performance Monitor</h2>
          </div>
        </div>
        <button 
          onClick={loadData}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-slate-800 rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold text-white mb-4">Status Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-gray-400 text-sm mb-1">Initialization</div>
                <div className="flex items-center">
                  {performanceMonitorAdapter instanceof Object ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="text-white">
                    {performanceMonitorAdapter instanceof Object ? 'Initialized' : 'Not Initialized'}
                  </span>
                </div>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-gray-400 text-sm mb-1">Status</div>
                <div className="flex items-center">
                  {config.enabled ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-500 mr-2" />
                  )}
                  <span className="text-white">
                    {config.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-gray-400 text-sm mb-1">Metrics Collected</div>
                <div className="text-white text-xl font-semibold">
                  {metrics.length}
                </div>
              </div>
            </div>
          </div>
          
          {/* System Metrics */}
          {systemMetrics && (
            <div className="bg-slate-800 rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold text-white mb-4">System Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <Cpu className="h-5 w-5 text-blue-400 mr-2" />
                    <div className="text-gray-400 text-sm">CPU Usage</div>
                  </div>
                  <div className={`text-xl font-semibold ${getStatusColor(systemMetrics.cpu.usage, 80)}`}>
                    {systemMetrics.cpu.usage.toFixed(1)}%
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {systemMetrics.cpu.cores} cores @ {systemMetrics.cpu.frequency} GHz
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        systemMetrics.cpu.usage < 56 ? 'bg-green-500' : 
                        systemMetrics.cpu.usage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${systemMetrics.cpu.usage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <MemoryStick className="h-5 w-5 text-green-400 mr-2" />
                    <div className="text-gray-400 text-sm">Memory Usage</div>
                  </div>
                  <div className={`text-xl font-semibold ${getStatusColor(systemMetrics.memory.usage, 80)}`}>
                    {systemMetrics.memory.usage.toFixed(1)}%
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {systemMetrics.memory.used.toFixed(1)} GB / {systemMetrics.memory.total} GB
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        systemMetrics.memory.usage < 56 ? 'bg-green-500' : 
                        systemMetrics.memory.usage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${systemMetrics.memory.usage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-purple-400 mr-2" />
                    <div className="text-gray-400 text-sm">Load Time</div>
                  </div>
                  <div className={`text-xl font-semibold ${getStatusColor(systemMetrics.performance.loadTime * 1000, 3000)}`}>
                    {systemMetrics.performance.loadTime.toFixed(1)}s
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    Interactive: {systemMetrics.performance.interactiveTime.toFixed(1)}s
                  </div>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <Zap className="h-5 w-5 text-yellow-400 mr-2" />
                    <div className="text-gray-400 text-sm">FPS</div>
                  </div>
                  <div className={`text-xl font-semibold ${getStatusColor(60 - systemMetrics.performance.fps, 10)}`}>
                    {systemMetrics.performance.fps.toFixed(1)}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    Target: 60 FPS
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Optimization Statistics */}
          {performanceStats && (
            <div className="bg-slate-800 rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold text-white mb-4">Optimization Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">Total Optimizations</div>
                  <div className="text-white text-xl font-semibold">
                    {performanceStats.totalOptimizations}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    Success rate: {((performanceStats.successfulOptimizations / performanceStats.totalOptimizations) * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">Average Time</div>
                  <div className="text-white text-xl font-semibold">
                    {performanceStats.averageOptimizationTime} ms
                  </div>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">Time Saved</div>
                  <div className="text-white text-xl font-semibold">
                    {performanceStats.totalTimeSaved.toFixed(1)}s
                  </div>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">CPU Saved</div>
                  <div className="text-white text-xl font-semibold">
                    {performanceStats.resourcesSaved.cpu.toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">Memory Saved</div>
                  <div className="text-white text-xl font-semibold">
                    {performanceStats.resourcesSaved.memory.toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">Network Saved</div>
                  <div className="text-white text-xl font-semibold">
                    {performanceStats.resourcesSaved.network.toFixed(1)}%
                  </div>
                </div>
                
                {performanceStats.optimizationTypes && (
                  <div className="bg-slate-700 rounded-lg p-3 md:col-span-2 lg:col-span-3">
                    <div className="text-gray-400 text-sm mb-2">Optimization Types</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(performanceStats.optimizationTypes).map(([type, count]: [string, any]) => (
                        <div key={type} className="flex flex-col">
                          <span className="text-white text-sm font-medium">{count}</span>
                          <span className="text-gray-400 text-xs capitalize">{type.replace('-', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Performance Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
            
            {Object.entries(groupedMetrics).length === 0 ? (
              <div className="bg-slate-800 rounded-lg p-6 text-center text-gray-500">
                No metrics data available
              </div>
            ) : (
              Object.entries(groupedMetrics).map(([name, metricGroup]) => (
                <MetricsChart
                  key={name}
                  metrics={metricGroup}
                  title={name}
                  description={`${metricGroup.length} data points`}
                />
              ))
            )}
          </div>
          
          {/* Recent Events */}
          <EventsTable 
            events={events} 
            title="Performance Monitor Events" 
            onRefresh={loadData}
            loading={loading}
          />
        </div>
        
        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Configuration Panel */}
          <ConfigurationPanel
            optimizerType={OptimizerType.PERFORMANCE}
            config={config}
            onSave={handleSaveConfig}
            onReset={handleResetConfig}
          />
          
          {/* Feature Flags */}
          <div className="bg-slate-800 rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold text-white mb-4">Feature Flags</h3>
            <div className="space-y-4">
              {featureFlags.map(flag => (
                <FeatureToggle
                  key={flag.name}
                  feature={flag}
                  onChange={(enabled) => handleToggleFeature(flag.name, enabled)}
                  onRolloutChange={(percentage) => handleRolloutChange(flag.name, percentage)}
                  showDetails
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitorView;