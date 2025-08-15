import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNetworkMonitor } from '@/lib/network/networkMonitor';
import { useSyncService } from '@/lib/sync/syncService';

export enum AutosaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  OFFLINE = 'offline',
  SYNCING = 'syncing'
}

interface AutosaveIndicatorProps {
  status: AutosaveStatus;
  lastSaved?: Date | null;
  error?: string;
  className?: string;
}

export const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({
  status,
  lastSaved,
  error,
  className = ''
}) => {
  const [visible, setVisible] = useState<boolean>(status !== AutosaveStatus.IDLE);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // Hide the indicator after a delay when status is SAVED
  useEffect(() => {
    if (status === AutosaveStatus.SAVED) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
      return undefined; // Explicit return for consistency
    }
  }, [status]);

  // Format the last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    
    return lastSaved.toLocaleString();
  };

  // Get status text and icon
  const getStatusInfo = () => {
    switch (status) {
      case AutosaveStatus.SAVING:
        return {
          text: 'Saving...',
          icon: <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
        };
      case AutosaveStatus.SAVED:
        return {
          text: `Saved ${lastSaved ? formatLastSaved() : ''}`,
          icon: <CheckCircle className="h-4 w-4 text-green-500" />
        };
      case AutosaveStatus.ERROR:
        return {
          text: error || 'Error saving',
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        };
      case AutosaveStatus.OFFLINE:
        return {
          text: 'Offline - Changes saved locally',
          icon: <WifiOff className="h-4 w-4 text-amber-500" />
        };
      case AutosaveStatus.SYNCING:
        return {
          text: 'Syncing changes...',
          icon: <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
        };
      default:
        return {
          text: '',
          icon: null
        };
    }
  };

  const { text, icon } = getStatusInfo();

  if (!visible) return null;

  return (
    <TooltipProvider>
      <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
        <TooltipTrigger asChild>
          <div 
            className={`flex items-center gap-2 text-xs py-1 px-2 rounded-md bg-slate-800/80 backdrop-blur-sm ${className}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {icon}
            <span className="text-slate-300">{text}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {status === AutosaveStatus.ERROR ? (
            <div className="text-xs">
              <p className="font-semibold text-red-400">Error saving your story</p>
              <p className="text-slate-300 mt-1">{error}</p>
              <p className="text-slate-400 mt-1">Your changes are saved locally and will be synced when the issue is resolved.</p>
            </div>
          ) : status === AutosaveStatus.OFFLINE ? (
            <div className="text-xs">
              <p className="font-semibold text-amber-400">You're currently offline</p>
              <p className="text-slate-300 mt-1">Your changes are saved locally and will be synced when you're back online.</p>
            </div>
          ) : (
            <div className="text-xs">
              <p className="font-semibold">{text}</p>
              {lastSaved && (
                <p className="text-slate-300 mt-1">Last saved: {lastSaved.toLocaleString()}</p>
              )}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Connected AutosaveIndicator that automatically monitors network status
 * and sync status
 */
export const ConnectedAutosaveIndicator: React.FC<Omit<AutosaveIndicatorProps, 'status'>> = (props) => {
  const { isOnline } = useNetworkMonitor();
  const { isSyncInProgress } = useSyncService();
  const [status, setStatus] = useState<AutosaveStatus>(AutosaveStatus.IDLE);

  useEffect(() => {
    if (!isOnline()) {
      setStatus(AutosaveStatus.OFFLINE);
    } else if (isSyncInProgress()) {
      setStatus(AutosaveStatus.SYNCING);
    } else if (props.error) {
      setStatus(AutosaveStatus.ERROR);
    } else if (props.lastSaved) {
      setStatus(AutosaveStatus.SAVED);
    } else {
      setStatus(AutosaveStatus.IDLE);
    }
  }, [isOnline, isSyncInProgress, props.error, props.lastSaved]);

  return <AutosaveIndicator {...props} status={status} />;
};