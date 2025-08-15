import React, { useState, useEffect } from 'react';
import { PerformanceMetric } from '@/optimization/core/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricsChartProps {
  metrics: PerformanceMetric[];
  title: string;
  description?: string;
  height?: number;
  colors?: string[];
}

/**
 * A reusable component for visualizing performance metrics
 */
const MetricsChart: React.FC<MetricsChartProps> = ({
  metrics,
  title,
  description,
  height = 300,
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe']
}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [metricNames, setMetricNames] = useState<string[]>([]);

  useEffect(() => {
    if (!metrics || metrics.length === 0) return;

    // Group metrics by timestamp
    const groupedByTimestamp: Record<number, Record<string, number>> = {};
    const uniqueMetricNames = new Set<string>();

    metrics.forEach(metric => {
      const timestamp = metric.timestamp;
      if (!groupedByTimestamp[timestamp]) {
        groupedByTimestamp[timestamp] = {};
      }
      
      groupedByTimestamp[timestamp][metric.name] = metric.value;
      uniqueMetricNames.add(metric.name);
    });

    // Convert to chart data format
    const formattedData = Object.entries(groupedByTimestamp).map(([timestamp, values]) => ({
      timestamp: new Date(parseInt(timestamp)).toLocaleTimeString(),
      ...values
    }));

    setChartData(formattedData);
    setMetricNames(Array.from(uniqueMetricNames));
  }, [metrics]);

  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-gray-400 text-sm mb-4">{description}</p>}
      
      {metrics.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-500">
          No metrics data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="timestamp" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }} 
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            {metricNames.map((name, index) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={colors[index % colors.length]}
                activeDot={{ r: 8 }}
                name={name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MetricsChart;