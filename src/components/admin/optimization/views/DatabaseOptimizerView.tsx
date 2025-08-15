import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Server
} from 'lucide-react';
import { 
  OptimizerType, 
  OptimizationEventType, 
  PerformanceMetric, 
  OptimizationEvent,
  ConnectionHealthStatus
} from '@/optimization/core/types';
import { 
  eventEmitter, 
  configManager, 
  featureFlagManager,
  databaseOptimizerAdapter,
  supabaseConnectionMonitor
} from '@/optimization/index';
import MetricsChart from '../shared/MetricsChart';
import EventsTable from '../shared/EventsTable';
import ConfigurationPanel from '../shared/ConfigurationPanel';
import FeatureToggle from '../shared/FeatureToggle';

const DatabaseOptimizerView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [events, setEvents] = useState<OptimizationEvent[]>([]);
  const [config, setConfig] = useState(configManager.getOptimizerConfig(OptimizerType.DATABASE));
  const [featureFlags, setFeatureFlags] = useState(featureFlagManager.getAllFlags().filter(
    flag => flag.name.startsWith('database-')
  ));
  const [connectionHealth, setConnectionHealth] = useState<any>(null);
  const [queryStats, setQueryStats] = useState<any>(null);

  useEffect(() => {
    loadData();
    
    // Subscribe to events
    const eventListener = (event: OptimizationEvent) => {
      if (event.optimizerType === OptimizerType.DATABASE || event.optimizerType === OptimizerType.SUPABASE) {
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
      setMetrics([
        ...databaseOptimizerAdapter.getMetrics(),
        ...supabaseConnectionMonitor.getMetrics()
      ]);
      
      // Get events
      const dbEvents = Array.from(events)
        .filter(event => 
          event.optimizerType === OptimizerType.DATABASE || 
          event.optimizerType === OptimizerType.SUPABASE
        )
        .sort((a, b) => b.timestamp - a.timestamp);
      setEvents(dbEvents);
      
      // Get config
      setConfig(configManager.getOptimizerConfig(OptimizerType.DATABASE));
      
      // Get feature flags
      setFeatureFlags(featureFlagManager.getAllFlags().filter(
        flag => flag.name.startsWith('database-')
      ));
      
      // Get connection health if available
      if (typeof supabaseConnectionMonitor.getConnectionHealth === 'function') {
        setConnectionHealth(supabaseConnectionMonitor.getConnectionHealth());
      } else {
        // Sample connection health data
        setConnectionHealth({
          status: ConnectionHealthStatus.HEALTHY,
          latency: 45,
          errorRate: 0.01,
          successRate: 0.99,
          lastChecked: Date.now(),
          consecutiveFailures: 0,
          consecutiveSuccesses: 12
        });
      }
      
      // Sample query stats
      setQueryStats({
        totalQueries: 1250,
        averageQueryTime: 42, // ms
        cachedQueries: 875,
        cacheHitRate: 0.7,
        slowQueries: 15,
        errorQueries: 3,
        queryDistribution: {
          'select': 850,
          'insert': 220,
          'update': 150,
          'delete': 30
        }
      });
    } catch (error) {
      console.error('Error loading database optimizer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (newConfig: any) => {
    configManager.updateOptimizerConfig(OptimizerType.DATABASE, newConfig);
    setConfig(configManager.getOptimizerConfig(OptimizerType.DATABASE));
  };

  const handleResetConfig = () => {
    configManager.resetToDefaults();
    setConfig(configManager.getOptimizerConfig(OptimizerType.DATABASE));
  };

  const handleToggleFeature = (featureName: string, enabled: boolean) => {
    if (enabled) {
      featureFlagManager.enableFlag(featureName);
    } else {
      featureFlagManager.disableFlag(featureName);
    }
    
    setFeatureFlags(featureFlagManager.getAllFlags().filter(
      flag => flag.name.startsWith('database-')
    ));
  };

  const handleRolloutChange = (featureName: string, percentage: number) => {
    featureFlagManager.setRolloutPercentage(featureName, percentage);
    
    setFeatureFlags(featureFlagManager.getAllFlags().filter(
      flag => flag.name.startsWith('database-')
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

  // Get connection health status color
  const getConnectionStatusColor = (status: ConnectionHealthStatus) => {
    switch (status) {
      case ConnectionHealthStatus.HEALTHY:
        return 'text-green-500';
      case ConnectionHealthStatus.DEGRADED:
        return 'text-yellow-500';
      case ConnectionHealthStatus.UNHEALTHY:
        return 'text-red-500';
      case ConnectionHealthStatus.DISCONNECTED:
        return 'text-gray-500';
      default:
        return 'text-blue-500';
    }
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
              <Database className="h-5 w-5 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Database Optimizer</h2>
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
                  {databaseOptimizerAdapter instanceof Object ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="text-white">
                    {databaseOptimizerAdapter instanceof Object ? 'Initialized' : 'Not Initialized'}
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
          
          {/* Connection Health */}
          {connectionHealth && (
            <div className="bg-slate-800 rounded-lg p-4 shadow-md">
              <div className="flex items-center mb-4">
                <Server className="h-5 w-5 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Connection Health</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">Status</div>
                  <div className={`flex items-center ${getConnectionStatusColor(connectionHealth.status)}`}>
                    {connectionHealth.status === ConnectionHealthStatus.HEALTHY && (
                      <CheckCircle className="h-5 w-5 mr-2" />
                    )}
                    {connectionHealth.status === ConnectionHealthStatus.DEGRADED && (
                      <AlertTriangle className="h-5 w-5 mr-2" />
                    )}
                    {connectionHealth.status === ConnectionHealthStatus.UNHEALTHY && (
                      <XCircle className="h-5 w-5 mr-2" />
                    )}
                    {connectionHealth.status === ConnectionHealthStatus.DISCONNECTED && (
                      <XCircle className="h-5 w-5 mr-2" />
                    )}
                    <span className="text-white font-medium">
                      {connectionHealth.status}
                    </span>
                  </div>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">Latency</div>
                  <div className="text-white text-xl font-semibold">
                    {connectionHealth.latency} ms
                  </div>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">Success Rate</div>
                  <div className="text-white text-xl font-semibold">
                    {(connectionHealth.successRate * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">Error Rate</div>
                  <div className="text-white text-xl font-semibold">
                    {(connectionHealth.errorRate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Query Statistics */}
          {queryStats && (
            <div className="bg-slate-800 rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold text-white mb-4">Query Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">Total Queries</div>
                  <div className="text-white text-xl font-semibold">
                    {queryStats.totalQueries}
                  </div>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">Average Query Time</div>
                  <div className="text-white text-xl font-semibold">
                    {queryStats.averageQueryTime} ms
                  </div>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">Cache Hit Rate</div>
                  <div className="text-white text-xl font-semibold">
                    {(queryStats.cacheHitRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {queryStats.cachedQueries} cached / {queryStats.totalQueries} total
                  </div>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">Slow Queries</div>
                  <div className="text-white text-xl font-semibold">
                    {queryStats.slowQueries}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {((queryStats.slowQueries / queryStats.totalQueries) * 100).toFixed(1)}% of total
                  </div>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">Error Queries</div>
                  <div className="text-white text-xl font-semibold">
                    {queryStats.errorQueries}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {((queryStats.errorQueries / queryStats.totalQueries) * 100).toFixed(1)}% of total
                  </div>
                </div>
                
                {queryStats.queryDistribution && (
                  <div className="bg-slate-700 rounded-lg p-3">
                    <div className="text-gray-400 text-sm mb-2">Query Types</div>
                    <div className="space-y-1">
                      {Object.entries(queryStats.queryDistribution).map(([type, count]: [string, any]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-white text-sm capitalize">{type}</span>
                          <span className="text-gray-400 text-sm">{count}</span>
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
            title="Database Events" 
            onRefresh={loadData}
            loading={loading}
          />
        </div>
        
        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Configuration Panel */}
          <ConfigurationPanel
            optimizerType={OptimizerType.DATABASE}
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

export default DatabaseOptimizerView;