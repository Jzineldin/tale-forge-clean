import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface RecoveryData {
  storyId: string;
  title: string;
  lastSaved: string;
  segmentCount: number;
  isCompleted: boolean;
}

interface RecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recoveryData: RecoveryData | null;
  onRecover: () => Promise<boolean>;
  onDiscard: () => Promise<boolean>;
}

export const RecoveryDialog: React.FC<RecoveryDialogProps> = ({
  open,
  onOpenChange,
  recoveryData,
  onRecover,
  onDiscard
}) => {
  const navigate = useNavigate();
  const [isRecovering, setIsRecovering] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [recoveryComplete, setRecoveryComplete] = useState(false);

  if (!recoveryData) return null;

  const handleRecover = async () => {
    setIsRecovering(true);
    try {
      const success = await onRecover();
      if (success) {
        setRecoveryComplete(true);
        toast.success('Story recovered successfully');
        
        // Navigate to the story after a short delay
        setTimeout(() => {
          navigate(`/story-viewer/${recoveryData.storyId}`);
          onOpenChange(false);
        }, 1500);
      } else {
        toast.error('Failed to recover story');
        setIsRecovering(false);
      }
    } catch (error) {
      console.error('Error recovering story:', error);
      toast.error('An error occurred while recovering the story');
      setIsRecovering(false);
    }
  };

  const handleDiscard = async () => {
    setIsDiscarding(true);
    try {
      const success = await onDiscard();
      if (success) {
        toast.info('Unsaved story discarded');
        onOpenChange(false);
      } else {
        toast.error('Failed to discard story');
        setIsDiscarding(false);
      }
    } catch (error) {
      console.error('Error discarding story:', error);
      toast.error('An error occurred while discarding the story');
      setIsDiscarding(false);
    }
  };

  // Format the last saved date
  const formatLastSaved = () => {
    const date = new Date(recoveryData.lastSaved);
    return date.toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card-enhanced sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="fantasy-heading text-amber-500">
            {recoveryComplete ? 'Story Recovered!' : 'Recover Unsaved Story?'}
          </DialogTitle>
          <DialogDescription>
            {recoveryComplete ? (
              <div className="flex flex-col items-center justify-center py-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <p className="text-center">
                  Your story has been successfully recovered. You'll be redirected to continue where you left off.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start gap-3 mt-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>
                      We found an unsaved story that was being created when your session ended unexpectedly.
                      Would you like to recover it?
                    </p>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-md p-3 mt-4">
                  <h3 className="font-semibold text-amber-400 mb-1">{recoveryData.title || 'Untitled Story'}</h3>
                  <div className="text-sm text-slate-300 space-y-1">
                    <p>Last edited: {formatLastSaved()}</p>
                    <p>Segments: {recoveryData.segmentCount}</p>
                    <p>Status: {recoveryData.isCompleted ? 'Completed' : 'In progress'}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        {!recoveryComplete && (
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={handleDiscard}
              disabled={isRecovering || isDiscarding}
            >
              {isDiscarding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Discarding...
                </>
              ) : (
                'Discard'
              )}
            </Button>
            <Button
              onClick={handleRecover}
              disabled={isRecovering || isDiscarding}
              variant="cta-primary"
            >
              {isRecovering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recovering...
                </>
              ) : (
                'Recover Story'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};