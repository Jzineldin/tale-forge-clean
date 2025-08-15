
import React from 'react';
import { Button } from '@/components/ui/button';

interface StoryModeToggleProps {
  viewMode: 'create' | 'player';
  onSwitchToCreate: () => void;
  onSwitchToPlayer: () => void;
  hasSegments: boolean;
}

const StoryModeToggle: React.FC<StoryModeToggleProps> = ({
  viewMode,
  onSwitchToCreate,
  onSwitchToPlayer,
  hasSegments
}) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-xl p-2 shadow-xl">
        <Button
          onClick={onSwitchToCreate}
          variant={viewMode === 'create' ? 'orange-amber' : 'secondary'}
          size="sm"
          className="px-6 py-2 font-bold"
        >
          ✍️ Create Mode
        </Button>
        <Button
          onClick={onSwitchToPlayer}
          variant={viewMode === 'player' ? 'orange-amber' : 'secondary'}
          size="sm"
          className="px-6 py-2 font-bold"
          disabled={!hasSegments}
        >
          🎭 Story Player
        </Button>
      </div>
    </div>
  );
};

export default StoryModeToggle;
