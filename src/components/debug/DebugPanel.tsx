import React, { useState } from 'react';
import { AlertTriangle, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DebugPanelProps {
  connectionHealth: 'healthy' | 'degraded' | 'failed';
  isFallbackPolling: boolean;
  isSubscribed: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  connectionHealth,
  isFallbackPolling,
  isSubscribed
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Only show if there are connection issues
  const hasIssues = connectionHealth !== 'healthy' || isFallbackPolling || !isSubscribed;

  if (!hasIssues && !isVisible) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      {hasIssues && !isVisible && (
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 bg-amber-500/20 border-amber-500 text-amber-300 hover:bg-amber-500/30"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Connection Issues
        </Button>
      )}

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed bottom-4 right-4 max-w-md bg-slate-800 border border-amber-500/30 rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-medium text-amber-300">Connection Status</h3>
            </div>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300">Real-time:</span>
              <span className={isSubscribed ? 'text-green-400' : 'text-red-400'}>
                {isSubscribed ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-300">Health:</span>
              <span className={
                connectionHealth === 'healthy' ? 'text-green-400' :
                connectionHealth === 'degraded' ? 'text-yellow-400' : 'text-red-400'
              }>
                {connectionHealth}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-300">Fallback polling:</span>
              <span className={isFallbackPolling ? 'text-amber-400' : 'text-slate-400'}>
                {isFallbackPolling ? 'Active (3s)' : 'Inactive'}
              </span>
            </div>
          </div>

          {hasIssues && (
            <div className="mt-3 p-2 bg-amber-500/10 rounded border border-amber-500/20">
              <p className="text-xs text-amber-300">
                {!isSubscribed ? 
                  "Real-time connection blocked. Using backup sync every 3 seconds." :
                  isFallbackPolling ?
                  "Real-time unstable. Using backup sync for reliability." :
                  "Connection recovering..."
                }
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DebugPanel;