import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface ImageRefreshButtonProps {
  storyId: string;
  segmentId: string;
  className?: string;
}

const ImageRefreshButton: React.FC<ImageRefreshButtonProps> = ({
  storyId,
  segmentId,
  className = ''
}) => {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered for segment:', segmentId);
    
    // Invalidate and refetch story data
    queryClient.invalidateQueries({ queryKey: ['story', storyId] });
    queryClient.refetchQueries({ queryKey: ['story', storyId] });
    
    // Dispatch custom refresh event
    window.dispatchEvent(new CustomEvent('force-image-refresh', {
      detail: {
        segmentId,
        timestamp: new Date().toISOString()
      }
    }));
  };

  return (
    <Button
      onClick={handleRefresh}
      variant="outline"
      size="sm"
      className={`gap-2 ${className}`}
    >
      <RefreshCw className="h-4 w-4" />
      Refresh Image
    </Button>
  );
};

export default ImageRefreshButton;