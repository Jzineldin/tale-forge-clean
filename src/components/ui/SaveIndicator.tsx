import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
interface SaveIndicatorProps {
  status: 'saving' | 'saved' | 'error' | null;
  message?: string;
}

const SaveIndicator: React.FC<SaveIndicatorProps> = ({ status, message }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (status) {
      setIsVisible(true);
      
      // Auto-hide after 3 seconds for success/error states
      if (status === 'saved' || status === 'error') {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
    return undefined;
  }, [status]);

  if (!isVisible) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <LoadingSpinner size="sm" className="h-4 w-4 " />,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200'
        };
      case 'saved':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: null,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg border ${config.bgColor} ${config.textColor} ${config.borderColor} shadow-lg transition-all duration-300 flex items-center gap-2`}>
      {config.icon}
      <span className="text-sm font-medium">
        {message || (status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : 'Save failed')}
      </span>
    </div>
  );
};

export default SaveIndicator; 