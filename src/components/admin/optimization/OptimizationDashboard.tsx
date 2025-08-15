import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mic, 
  Image, 
  Database, 
  Activity, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertTriangle 
} from 'lucide-react';
import { 
  OptimizerType, 
  PerformanceMetric, 
  OptimizationEvent 
} from '@/optimization/core/types';
import { 
  eventEmitter, 
  configManager, 
  voiceOptimizerAdapter,
  imageOptimizerAdapter,
  databaseOptimizerAdapter,
  performanceMonitorAdapter
} from '@/optimization/index';
import MetricsChart from './shared/MetricsChart';
import EventsTable from './shared/EventsTable';

const OptimizerCard: React.FC<{
  type: OptimizerType;
  title: string;
  icon: React.ReactNode;
  metrics: PerformanceMetric[];
  isInitialized: boolean;
  isEnabled: boolean;
  detailPath: string;
}> = ({ type, title, icon, metrics, isInitialized, isEnabled, detailPath }) => {
  // Get the most recent metrics (up to 5)
  const recentMetrics = [...metrics]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  // Calculate status
  let status: 'healthy' | 'warning' | 'error' | 'disabled' = 'healthy';
  
  if (!isEnabled) {
    status = 'disabled';
  } else if (!isInitialized) {
    status = 'error';
  } else {
    // Check if any metrics exceed thresholds
    const config = configManager.getOptimizerConfig(type);
    const hasWarnings = recentMetrics.some(metric => {
      const thresholdKey = `${metric.name}.threshold`;
      const threshold = config.thresholds[thresholdKey];
      return threshold !== undefined && metric.value > threshold;
    });
    
    if (hasWarnings) {
      status = 'warning';
    }
  }

  // Get status color and icon
  const getStatusInfo = () => {
    switch (status) {
      case 'healthy':
        return { color: 'text-green-500', icon: <CheckCircle className="h-5 w-5" /> };
      case 'warning':
        return { color: 'text-yellow-500', icon: <AlertTriangle className="h-5 w-5" /> };
      case 'error':
        return { color: 'text-red-500', icon: <XCircle className="h-5 w-5" /> };
      case 'disabled':
        return { color: 'text-gray-500', icon: <XCircle className="h-5 w-5" /> };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-slate-700 rounded-lg mr-3">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center">
          <span className={`flex items-center mr-3 ${statusInfo.color}`}>
            {statusInfo.icon}
            <span className="ml-1 text-sm">
              {status === 'healthy' ? 'Healthy' : 
               status === 'warning' ? 'Warning' : 
               status === 'error' ? 'Error' : 'Disabled'}
            </span>
          </span>
          <Link 
            to={detailPath} 
            className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
            title="View details"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
      
      <div className="h-32">
        {recentMetrics.length > 0 ? (
          <MetricsChart 
            metrics={recentMetrics} 
            title="" 
            height={120} 
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No metrics data available
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-slate-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Status:</span>
          <span className="text-white">
            {isInitialized ? 'Initialized' : 'Not Initialized'}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-400">Enabled:</span>
          <span className="text-white">
            {isEnabled ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-400">Metrics:</span>
          <span className="text-white">
            {metrics.length}
          </span>
        </div>
      </div>
    </div>
  );
};

const OptimizationDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [voiceMetrics, setVoiceMetrics] = useState<PerformanceMetric[]>([]);
  const [imageMetrics, setImageMetrics] = useState<PerformanceMetric[]>([]);
  const [databaseMetrics, setDatabaseMetrics] = useState<PerformanceMetric[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [recentEvents, setRecentEvents] = useState<OptimizationEvent[]>([]);
  
  const [voiceInitialized, setVoiceInitialized] = useState(false);
  const [imageInitialized, setImageInitialized] = useState(false);
  const [databaseInitialized, setDatabaseInitialized] = useState(false);
  const [performanceInitialized, setPerformanceInitialized] = useState(false);
  
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [imageEnabled, setImageEnabled] = useState(false);
  const [databaseEnabled, setDatabaseEnabled] = useState(false);
  const [performanceEnabled, setPerformanceEnabled] = useState(false);

  useEffect(() => {
    loadData();
    
    // Subscribe to events
    const eventListener = (event: OptimizationEvent) => {
      setRecentEvents(prev => [event, ...prev].slice(0, 50));
      
      // Update metrics if a new metric is recorded
      if (event.type === 'metric_recorded' && event.data?.metric) {
        const metric = event.data.metric as PerformanceMetric;
        
        switch (event.optimizerType) {
          case OptimizerType.VOICE:
            setVoiceMetrics(prev => [...prev, metric]);
            break;
          case OptimizerType.IMAGE:
            setImageMetrics(prev => [...prev, metric]);
            break;
          case OptimizerType.DATABASE:
            setDatabaseMetrics(prev => [...prev, metric]);
            break;
          case OptimizerType.PERFORMANCE:
            setPerformanceMetrics(prev => [...prev, metric]);
            break;
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
      setVoiceMetrics(voiceOptimizerAdapter.getMetrics());
      setImageMetrics(imageOptimizerAdapter.getMetrics());
      setDatabaseMetrics(databaseOptimizerAdapter.getMetrics());
              setPerformanceMetrics(performanceMonitorAdapter.instance.getMetrics());
      
      // Get initialization status
      setVoiceInitialized(voiceOptimizerAdapter instanceof Object);
      setImageInitialized(imageOptimizerAdapter instanceof Object);
      setDatabaseInitialized(databaseOptimizerAdapter instanceof Object);
      setPerformanceInitialized(performanceMonitorAdapter instanceof Object);
      
      // Get enabled status from config
      const voiceConfig = configManager.getOptimizerConfig(OptimizerType.VOICE);
      const imageConfig = configManager.getOptimizerConfig(OptimizerType.IMAGE);
      const databaseConfig = configManager.getOptimizerConfig(OptimizerType.DATABASE);
      const performanceConfig = configManager.getOptimizerConfig(OptimizerType.PERFORMANCE);
      
      setVoiceEnabled(voiceConfig.enabled);
      setImageEnabled(imageConfig.enabled);
      setDatabaseEnabled(databaseConfig.enabled);
      setPerformanceEnabled(performanceConfig.enabled);
    } catch (error) {
      console.error('Error loading optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Optimization Dashboard</h2>
        <button 
          onClick={loadData}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OptimizerCard
          type={OptimizerType.VOICE}
          title="Voice Optimizer"
          icon={<Mic className="h-5 w-5 text-purple-400" />}
          metrics={voiceMetrics}
          isInitialized={voiceInitialized}
          isEnabled={voiceEnabled}
          detailPath="/admin/system/optimization/voice"
        />
        
        <OptimizerCard
          type={OptimizerType.IMAGE}
          title="Image Optimizer"
          icon={<Image className="h-5 w-5 text-blue-400" />}
          metrics={imageMetrics}
          isInitialized={imageInitialized}
          isEnabled={imageEnabled}
          detailPath="/admin/system/optimization/image"
        />
        
        <OptimizerCard
          type={OptimizerType.DATABASE}
          title="Database Optimizer"
          icon={<Database className="h-5 w-5 text-green-400" />}
          metrics={databaseMetrics}
          isInitialized={databaseInitialized}
          isEnabled={databaseEnabled}
          detailPath="/admin/system/optimization/database"
        />
        
        <OptimizerCard
          type={OptimizerType.PERFORMANCE}
          title="Performance Monitor"
          icon={<Activity className="h-5 w-5 text-red-400" />}
          metrics={performanceMetrics}
          isInitialized={performanceInitialized}
          isEnabled={performanceEnabled}
          detailPath="/admin/system/optimization/performance"
        />
      </div>
      
      <div className="mt-8">
        <EventsTable 
          events={recentEvents} 
          title="Recent Optimization Events" 
          onRefresh={loadData}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default OptimizationDashboard;