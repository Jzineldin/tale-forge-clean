import React, { Suspense, lazy } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Lazy load admin components to reduce initial bundle size
const AdminOverview = lazy(() => import('./AdminOverview'));
const AudioGenerationManager = lazy(() => import('./AudioGenerationManager'));
const APIMonitoringDashboard = lazy(() => import('./APIMonitoringDashboard'));
const ProviderMonitor = lazy(() => import('./ProviderMonitor'));
const CostTracker = lazy(() => import('./CostTracker'));
const ElevenLabsTestButton = lazy(() => import('./ElevenLabsTestButton'));
const ElevenLabsVoicesExplorer = lazy(() => import('./ElevenLabsVoicesExplorer'));
const TTSProviderSettings = lazy(() => import('./TTSProviderSettings'));
const SystemLogsViewer = lazy(() => import('./SystemLogsViewer'));
const AdminWaitlistViewer = lazy(() => import('./AdminWaitlistViewer'));

// Performance monitoring components
const PerformanceMonitorView = lazy(() => import('./optimization/views/PerformanceMonitorView'));
const DatabaseOptimizerView = lazy(() => import('./optimization/views/DatabaseOptimizerView'));
const VoiceOptimizerView = lazy(() => import('./optimization/views/VoiceOptimizerView'));
const ImageOptimizerView = lazy(() => import('./optimization/views/ImageOptimizerView'));

// Loading fallback component
const AdminLoadingFallback: React.FC<{ message?: string }> = ({ message = 'Loading admin component...' }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <LoadingSpinner size="lg" className="h-8 w-8 mx-auto mb-4 text-purple-400" />
      <p className="text-purple-300">{message}</p>
    </div>
  </div>
);

// Wrapper component for lazy-loaded admin components
const LazyAdminComponent: React.FC<{ 
  component: React.ComponentType<any>; 
  loadingMessage?: string;
  [key: string]: any;
}> = ({ component: Component, loadingMessage = 'Loading...', ...props }) => (
  <Suspense fallback={<AdminLoadingFallback message={loadingMessage} />}>
    <Component {...props} />
  </Suspense>
);

// Export lazy-loaded components with consistent interface
export const LazyAdminOverview: React.FC = (props) => (
  <LazyAdminComponent 
    component={AdminOverview} 
    loadingMessage="Loading admin dashboard..."
    {...props} 
  />
);

export const LazyAudioGenerationManager: React.FC = (props) => (
  <LazyAdminComponent 
    component={AudioGenerationManager} 
    loadingMessage="Loading audio management tools..."
    {...props} 
  />
);

export const LazyAPIMonitoringDashboard: React.FC = (props) => (
  <LazyAdminComponent 
    component={APIMonitoringDashboard} 
    loadingMessage="Loading API monitoring dashboard..."
    {...props} 
  />
);

export const LazyProviderMonitor: React.FC = (props) => (
  <LazyAdminComponent 
    component={ProviderMonitor} 
    loadingMessage="Loading provider monitoring..."
    {...props} 
  />
);

export const LazyCostTracker: React.FC = (props) => (
  <LazyAdminComponent 
    component={CostTracker} 
    loadingMessage="Loading cost tracking..."
    {...props} 
  />
);

export const LazyElevenLabsTestButton: React.FC = (props) => (
  <LazyAdminComponent 
    component={ElevenLabsTestButton} 
    loadingMessage="Loading ElevenLabs test tools..."
    {...props} 
  />
);

export const LazyElevenLabsVoicesExplorer: React.FC = (props) => (
  <LazyAdminComponent 
    component={ElevenLabsVoicesExplorer} 
    loadingMessage="Loading voice explorer..."
    {...props} 
  />
);

export const LazyTTSProviderSettings: React.FC = (props) => (
  <LazyAdminComponent 
    component={TTSProviderSettings} 
    loadingMessage="Loading TTS settings..."
    {...props} 
  />
);

export const LazySystemLogsViewer: React.FC = (props) => (
  <LazyAdminComponent 
    component={SystemLogsViewer} 
    loadingMessage="Loading system logs..."
    {...props} 
  />
);

export const LazyAdminWaitlistViewer: React.FC = (props) => (
  <LazyAdminComponent 
    component={AdminWaitlistViewer} 
    loadingMessage="Loading waitlist viewer..."
    {...props} 
  />
);

// Performance monitoring lazy components
export const LazyPerformanceMonitorView: React.FC = (props) => (
  <LazyAdminComponent 
    component={PerformanceMonitorView} 
    loadingMessage="Loading performance monitor..."
    {...props} 
  />
);

export const LazyDatabaseOptimizerView: React.FC = (props) => (
  <LazyAdminComponent 
    component={DatabaseOptimizerView} 
    loadingMessage="Loading database optimizer..."
    {...props} 
  />
);

export const LazyVoiceOptimizerView: React.FC = (props) => (
  <LazyAdminComponent 
    component={VoiceOptimizerView} 
    loadingMessage="Loading voice optimizer..."
    {...props} 
  />
);

export const LazyImageOptimizerView: React.FC = (props) => (
  <LazyAdminComponent 
    component={ImageOptimizerView} 
    loadingMessage="Loading image optimizer..."
    {...props} 
  />
);

// Default export for convenience
export default {
  AdminOverview: LazyAdminOverview,
  AudioGenerationManager: LazyAudioGenerationManager,
  APIMonitoringDashboard: LazyAPIMonitoringDashboard,
  ProviderMonitor: LazyProviderMonitor,
  CostTracker: LazyCostTracker,
  ElevenLabsTestButton: LazyElevenLabsTestButton,
  ElevenLabsVoicesExplorer: LazyElevenLabsVoicesExplorer,
  TTSProviderSettings: LazyTTSProviderSettings,
  SystemLogsViewer: LazySystemLogsViewer,
  AdminWaitlistViewer: LazyAdminWaitlistViewer,
  PerformanceMonitorView: LazyPerformanceMonitorView,
  DatabaseOptimizerView: LazyDatabaseOptimizerView,
  VoiceOptimizerView: LazyVoiceOptimizerView,
  ImageOptimizerView: LazyImageOptimizerView,
};