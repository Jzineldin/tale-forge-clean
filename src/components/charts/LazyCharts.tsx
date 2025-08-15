import React, { Suspense, lazy } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Lazy load chart components to reduce initial bundle size
const LineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const BarChart = lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
const PieChart = lazy(() => import('recharts').then(module => ({ default: module.PieChart })));
const AreaChart = lazy(() => import('recharts').then(module => ({ default: module.AreaChart })));
const ScatterChart = lazy(() => import('recharts').then(module => ({ default: module.ScatterChart })));

// Chart loading fallback
const ChartLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-64 bg-slate-800/50 rounded-lg border border-purple-600/30">
    <div className="text-center">
      <LoadingSpinner size="lg" className="h-8 w-8 mx-auto mb-4 text-purple-400" />
      <p className="text-purple-300">Loading chart...</p>
    </div>
  </div>
);

// Wrapper for lazy chart components
const LazyChartWrapper: React.FC<{ 
  chart: React.ComponentType<any>; 
  [key: string]: any;
}> = ({ chart: Chart, ...props }) => (
  <Suspense fallback={<ChartLoadingFallback />}>
    <Chart {...props} />
  </Suspense>
);

// Export lazy chart components
export const LazyLineChart: React.FC = (props) => (
  <LazyChartWrapper chart={LineChart} {...props} />
);

export const LazyBarChart: React.FC = (props) => (
  <LazyChartWrapper chart={BarChart} {...props} />
);

export const LazyPieChart: React.FC = (props) => (
  <LazyChartWrapper chart={PieChart} {...props} />
);

export const LazyAreaChart: React.FC = (props) => (
  <LazyChartWrapper chart={AreaChart} {...props} />
);

export const LazyScatterChart: React.FC = (props) => (
  <LazyChartWrapper chart={ScatterChart} {...props} />
);

// Simple provider component that doesn't use recharts library
export const LazyRechartsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>
    {children}
  </div>
);

export default {
  LineChart: LazyLineChart,
  BarChart: LazyBarChart,
  PieChart: LazyPieChart,
  AreaChart: LazyAreaChart,
  ScatterChart: LazyScatterChart,
  RechartsProvider: LazyRechartsProvider,
};