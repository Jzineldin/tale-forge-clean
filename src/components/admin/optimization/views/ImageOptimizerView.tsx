import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Image, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle,
  XCircle
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
  imageOptimizerAdapter
} from '@/optimization/index';
import MetricsChart from '../shared/MetricsChart';
import EventsTable from '../shared/EventsTable';
import ConfigurationPanel from '../shared/ConfigurationPanel';
import FeatureToggle from '../shared/FeatureToggle';

const ImageOptimizerView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [events, setEvents] = useState<OptimizationEvent[]>([]);
  const [config, setConfig] = useState(configManager.getOptimizerConfig(OptimizerType.IMAGE));
  const [featureFlags, setFeatureFlags] = useState(featureFlagManager.getAllFlags().filter(
    flag => flag.name.startsWith('image-')
  ));
  const [imageStats, setImageStats] = useState<any>(null);

  useEffect(() => {
    loadData();
    
    // Subscribe to events
    const eventListener = (event: OptimizationEvent) => {
      if (event.optimizerType === OptimizerType.IMAGE) {
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
      setMetrics(imageOptimizerAdapter.getMetrics());
      
      // Get events
      const imageEvents = Array.from(events)
        .filter(event => event.optimizerType === OptimizerType.IMAGE)
        .sort((a, b) => b.timestamp - a.timestamp);
      setEvents(imageEvents);
      
      // Get config
      setConfig(configManager.getOptimizerConfig(OptimizerType.IMAGE));
      
      // Get feature flags
      setFeatureFlags(featureFlagManager.getAllFlags().filter(
        flag => flag.name.startsWith('image-')
      ));
      
      // Get image stats if available
      // Note: This is a placeholder for when the adapter implements this method
      // For now, we'll create some sample stats
      setImageStats({
        totalImages: 250,
        totalSize: 25 * 1024 * 1024, // 25MB
        averageSize: 100 * 1024, // 100KB
        compressionSavings: 15 * 1024 * 1024, // 15MB
        compressionPercentage: 37.5,
        formatDistribution: {
          'webp': 120,
          'jpg': 80,
          'png': 40,
          'avif': 10
        }
      });
    } catch (error) {
      console.error('Error loading image optimizer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (newConfig: any) => {
    configManager.updateOptimizerConfig(OptimizerType.IMAGE, newConfig);
    setConfig(configManager.getOptimizerConfig(OptimizerType.IMAGE));
  };

  const handleResetConfig = () => {
    configManager.resetToDefaults();
    setConfig(configManager.getOptimizerConfig(OptimizerType.IMAGE));
  };

  const handleToggleFeature = (featureName: string, enabled: boolean) => {
    if (enabled) {
      featureFlagManager.enableFlag(featureName);
    } else {
      featureFlagManager.disableFlag(featureName);
    }
    
    setFeatureFlags(featureFlagManager.getAllFlags().filter(
      flag => flag.name.startsWith('image-')
    ));
  };

  const handleRolloutChange = (featureName: string, percentage: number) => {
    featureFlagManager.setRolloutPercentage(featureName, percentage);
    
    setFeatureFlags(featureFlagManager.getAllFlags().filter(
      flag => flag.name.startsWith('image-')
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
              <Image className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Image Optimizer</h2>
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
                  {imageOptimizerAdapter instanceof Object ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="text-white">
                    {imageOptimizerAdapter instanceof Object ? 'Initialized' : 'Not Initialized'}
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
          
          {/* Image Statistics */}
          {imageStats && (
            <div className="bg-slate-800 rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold text-white mb-4">Image Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imageStats.totalImages !== undefined && (
                  <div className="bg-slate-700 rounded-lg p-3">
                    <div className="text-gray-400 text-sm mb-1">Total Images</div>
                    <div className="text-white text-xl font-semibold">
                      {imageStats.totalImages}
                    </div>
                  </div>
                )}
                
                {imageStats.totalSize !== undefined && (
                  <div className="bg-slate-700 rounded-lg p-3">
                    <div className="text-gray-400 text-sm mb-1">Total Size</div>
                    <div className="text-white text-xl font-semibold">
                      {(imageStats.totalSize / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>
                )}
                
                {imageStats.averageSize !== undefined && (
                  <div className="bg-slate-700 rounded-lg p-3">
                    <div className="text-gray-400 text-sm mb-1">Average Size</div>
                    <div className="text-white text-xl font-semibold">
                      {(imageStats.averageSize / 1024).toFixed(2)} KB
                    </div>
                  </div>
                )}
                
                {imageStats.compressionSavings !== undefined && (
                  <div className="bg-slate-700 rounded-lg p-3">
                    <div className="text-gray-400 text-sm mb-1">Compression Savings</div>
                    <div className="text-white text-xl font-semibold">
                      {(imageStats.compressionSavings / (1024 * 1024)).toFixed(2)} MB
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {imageStats.compressionPercentage !== undefined ? 
                        `${imageStats.compressionPercentage.toFixed(1)}% reduction` : ''}
                    </div>
                  </div>
                )}
                
                {imageStats.formatDistribution && (
                  <div className="bg-slate-700 rounded-lg p-3 md:col-span-2">
                    <div className="text-gray-400 text-sm mb-2">Format Distribution</div>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(imageStats.formatDistribution).map(([format, count]: [string, any]) => (
                        <div key={format} className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-1"
                            style={{ 
                              backgroundColor: format === 'webp' ? '#8884d8' : 
                                              format === 'jpg' ? '#82ca9d' : 
                                              format === 'png' ? '#ffc658' : 
                                              format === 'avif' ? '#ff8042' : '#0088fe'
                            }}
                          ></div>
                          <span className="text-white text-sm">{format}: {count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Recent Events */}
          <EventsTable 
            events={events} 
            title="Image Optimizer Events" 
            onRefresh={loadData}
            loading={loading}
          />
        </div>
        
        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Configuration Panel */}
          <ConfigurationPanel
            optimizerType={OptimizerType.IMAGE}
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

export default ImageOptimizerView;