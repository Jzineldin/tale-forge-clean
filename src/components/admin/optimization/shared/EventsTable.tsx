import React, { useState } from 'react';
import { OptimizationEvent, OptimizationEventType, OptimizerType } from '@/optimization/core/types';
import { ChevronDown, ChevronUp, Filter, RefreshCw } from 'lucide-react';

interface EventsTableProps {
  events: OptimizationEvent[];
  title?: string;
  maxHeight?: number;
  onRefresh?: () => void;
  loading?: boolean;
}

/**
 * A reusable component for displaying optimization events
 */
const EventsTable: React.FC<EventsTableProps> = ({
  events,
  title = 'Recent Events',
  maxHeight = 400,
  onRefresh,
  loading = false
}) => {
  const [sortField, setSortField] = useState<'timestamp' | 'type' | 'optimizerType'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<OptimizationEventType | ''>('');
  const [filterOptimizer, setFilterOptimizer] = useState<OptimizerType | ''>('');
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());

  // Get unique event types and optimizer types for filters
  const eventTypes = Array.from(new Set(events.map(event => event.type)));
  const optimizerTypes = Array.from(new Set(events.map(event => event.optimizerType)));

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEvents(newExpanded);
  };

  const handleSort = (field: 'timestamp' | 'type' | 'optimizerType') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter and sort events
  const filteredEvents = events.filter(event => {
    if (filterType && event.type !== filterType) return false;
    if (filterOptimizer && event.optimizerType !== filterOptimizer) return false;
    return true;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'timestamp') {
      comparison = a.timestamp - b.timestamp;
    } else if (sortField === 'type') {
      comparison = a.type.localeCompare(b.type);
    } else if (sortField === 'optimizerType') {
      comparison = a.optimizerType.localeCompare(b.optimizerType);
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get status color based on event type
  const getEventTypeColor = (type: OptimizationEventType) => {
    switch (type) {
      case OptimizationEventType.FAILED:
      case OptimizationEventType.CONNECTION_LOST:
      case OptimizationEventType.THRESHOLD_EXCEEDED:
        return 'text-red-500';
      case OptimizationEventType.COMPLETED:
      case OptimizationEventType.INITIALIZED:
      case OptimizationEventType.CONNECTION_ESTABLISHED:
      case OptimizationEventType.FEATURE_ENABLED:
        return 'text-green-500';
      case OptimizationEventType.STARTED:
      case OptimizationEventType.CONNECTION_DEGRADED:
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              className="bg-slate-700 text-white text-sm rounded-lg px-3 py-1.5 appearance-none pr-8"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as OptimizationEventType | '')}
            >
              <option value="">All Event Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <div className="relative">
            <select
              className="bg-slate-700 text-white text-sm rounded-lg px-3 py-1.5 appearance-none pr-8"
              value={filterOptimizer}
              onChange={(e) => setFilterOptimizer(e.target.value as OptimizerType | '')}
            >
              <option value="">All Optimizers</option>
              {optimizerTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="bg-slate-700 hover:bg-slate-600 text-white p-1.5 rounded-lg"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-hidden rounded-lg border border-slate-700" style={{ maxHeight }}>
        <div className="overflow-y-auto" style={{ maxHeight }}>
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-8"></th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center">
                    Timestamp
                    {sortField === 'timestamp' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Event Type
                    {sortField === 'type' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('optimizerType')}
                >
                  <div className="flex items-center">
                    Optimizer
                    {sortField === 'optimizerType' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {sortedEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                    No events found
                  </td>
                </tr>
              ) : (
                sortedEvents.map((event, index) => (
                  <React.Fragment key={`${event.timestamp}-${index}`}>
                    <tr 
                      className="hover:bg-slate-700 cursor-pointer"
                      onClick={() => toggleExpand(index)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {expandedEvents.has(index) ? 
                          <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        }
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {formatTimestamp(event.timestamp)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {event.optimizerType}
                      </td>
                    </tr>
                    {expandedEvents.has(index) && (
                      <tr className="bg-slate-900">
                        <td colSpan={4} className="px-4 py-3 text-sm text-gray-400">
                          <div className="p-2">
                            <pre className="whitespace-pre-wrap overflow-x-auto">
                              {JSON.stringify(event.data, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventsTable;