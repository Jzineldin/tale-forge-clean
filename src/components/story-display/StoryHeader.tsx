
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History, Play, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StoryHeaderProps {
  title: string;
  showHistory: boolean;
  onToggleHistory: () => void;
  onSwitchToPlayer?: () => void;
  canSwitchToPlayer?: boolean;
  showDiagnostics?: boolean;
}

const StoryHeader: React.FC<StoryHeaderProps> = ({
  title,
  showHistory,
  onToggleHistory,
  onSwitchToPlayer,
  canSwitchToPlayer = false,
  showDiagnostics = false
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {showDiagnostics && import.meta.env.DEV && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
          >
            <AlertTriangle className="h-4 w-4" />
            Debug
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleHistory}
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          {showHistory ? 'Hide History' : 'Show History'}
        </Button>

        {canSwitchToPlayer && onSwitchToPlayer && (
          <Button
            onClick={onSwitchToPlayer}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Play Story
          </Button>
        )}
      </div>
    </div>
  );
};

export default StoryHeader;
