import React from 'react';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  connectionHealth: 'healthy' | 'degraded' | 'failed';
  isFallbackPolling: boolean;
  isSubscribed: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionHealth,
  isFallbackPolling,
  isSubscribed
}) => {
  if (connectionHealth === 'healthy' && isSubscribed) {
    return null; // Don't show anything when everything is working
  }

  const getStatusConfig = () => {
    if (isFallbackPolling) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: 'Using backup sync - images may take longer to appear',
        className: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      };
    }

    if (connectionHealth === 'failed' || !isSubscribed) {
      return {
        icon: <WifiOff className="h-4 w-4" />,
        text: 'Connection issues detected - checking for updates',
        className: 'bg-red-500/20 text-red-300 border-red-500/30'
      };
    }

    return {
      icon: <Wifi className="h-4 w-4" />,
      text: 'Reconnecting...',
      className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    };
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${config.className} transition-all duration-300`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};

export default ConnectionStatus;