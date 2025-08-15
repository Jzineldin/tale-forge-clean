import React, { useState, useEffect } from 'react';
import { RecoveryDialog } from './RecoveryDialog';
import { AutosaveStatus, ConnectedAutosaveIndicator } from '@/components/ui/AutosaveIndicator';
import { useStoryRecovery } from '@/hooks/useStoryRecovery';
import { useNetworkMonitor } from '@/lib/network/networkMonitor';
import { useSyncService } from '@/lib/sync/syncService';
import { useExitDetection } from '@/lib/browser/exitDetection';
import { useAutosaveErrorHandler, ErrorSeverity } from '@/lib/error/autosaveErrorHandler';
import { AutosaveData } from '@/utils/autosaveUtils';
// import { toast } from 'sonner';

interface AutosaveWrapperProps {
  children: React.ReactNode;
  storyId?: string;
  segmentId?: string;
  storyTitle?: string;
  segmentCount?: number;
  isEnd?: boolean;
  className?: string;
}

export const AutosaveWrapper: React.FC<AutosaveWrapperProps> = ({
  children,
  storyId,
  segmentId,
  storyTitle,
  segmentCount = 0,
  isEnd = false,
  className = ''
}) => {
  const {
    recoveryData,
    showRecoveryDialog,
    setShowRecoveryDialog,
    handleRecover,
    handleDiscard
  } = useStoryRecovery();

  const { isOnline } = useNetworkMonitor();
  const syncService = useSyncService();
  const exitDetection = useExitDetection();

  const [_autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>(AutosaveStatus.IDLE);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const { handleError, showErrorToast } = useAutosaveErrorHandler();

  // Update exit detection data when story data changes
  useEffect(() => {
    if (storyId && segmentId) {
      const autosaveData: AutosaveData = {
        storyId,
        segmentId,
        storyTitle: storyTitle || 'Untitled Story',
        segmentCount,
        isEnd
      };

      exitDetection.updateCurrentData(autosaveData);
    }
  }, [storyId, segmentId, storyTitle, segmentCount, isEnd, exitDetection]);

  // Register exit handler
  useEffect(() => {
    const handleExit = async (data: AutosaveData) => {
      try {
        setAutosaveStatus(AutosaveStatus.SAVING);
        
        // Perform emergency save
        // This would typically call your autosave function
        console.log('Emergency save triggered:', data);
        
        // For demonstration, we'll just update the status
        setLastSaved(new Date());
        setAutosaveStatus(AutosaveStatus.SAVED);
        
        // Mark changes as saved in exit detection
        exitDetection.markChangesSaved();
      } catch (err) {
        console.error('Error during emergency save:', err);
        
        // Handle the error
        const autosaveError = handleError(err as Error);
        setError(autosaveError.userMessage);
        setAutosaveStatus(AutosaveStatus.ERROR);
        
        // Show error toast for critical errors
        if (autosaveError.severity === ErrorSeverity.CRITICAL) {
          showErrorToast(autosaveError);
        }
      }
    };

    exitDetection.registerHandler(handleExit);
    
    return () => {
      exitDetection.unregisterHandler(handleExit);
    };
  }, [exitDetection]);

  // Initialize components
  useEffect(() => {
    exitDetection.init();
    syncService.init();
    
    return () => {
      exitDetection.cleanup();
    };
  }, []);

  // Sync when coming back online
  useEffect(() => {
    const handleSync = async () => {
      if (isOnline()) {
        setAutosaveStatus(AutosaveStatus.SYNCING);
        
        try {
          await syncService.syncAll();
          setAutosaveStatus(AutosaveStatus.SAVED);
          setLastSaved(new Date());
        } catch (err) {
          console.error('Error syncing:', err);
          
          // Handle the error
          const autosaveError = handleError(err as Error);
          setError(autosaveError.userMessage);
          setAutosaveStatus(AutosaveStatus.ERROR);
          
          // Show error toast for network errors
          showErrorToast(autosaveError);
        }
      } else {
        setAutosaveStatus(AutosaveStatus.OFFLINE);
      }
    };

    handleSync();
  }, [isOnline]);

  // Simulate autosave (in a real implementation, this would be triggered by actual saves)
  // const _triggerAutosave = async () => {
  //   if (!storyId || !segmentId) return;
  //   
  //   setAutosaveStatus(AutosaveStatus.SAVING);
  //   
  //   try {
  //     // Simulate save operation
  //     await new Promise(resolve => setTimeout(resolve, 500));
  //     
  //     setLastSaved(new Date());
  //     setAutosaveStatus(AutosaveStatus.SAVED);
  //     
  //     // Mark changes as saved in exit detection
  //     exitDetection.markChangesSaved();
  //   } catch (err) {
  //     console.error('Error during autosave:', err);
  //     
  //     // Handle the error
  //     const autosaveError = handleError(err as Error);
  //     setError(autosaveError.userMessage);
  //     setAutosaveStatus(AutosaveStatus.ERROR);
  //     
  //     // Show error toast
  //     showErrorToast(autosaveError);
  //     
  //     // Try recovery action if available
  //     if (autosaveError.recoveryAction) {
  //       toast.info('Attempting to recover...', {
  //         action: {
  //           label: 'Retry',
  //           onClick: () => autosaveError.recoveryAction?.()
  //         }
  //       });
  //     }
  //   }
  // };

  return (
    <div className={`relative ${className}`}>
      {children}
      
      {/* Autosave Indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <ConnectedAutosaveIndicator
          lastSaved={lastSaved}
          error={error || ''}
        />
      </div>
      
      {/* Recovery Dialog */}
      <RecoveryDialog
        open={showRecoveryDialog}
        onOpenChange={setShowRecoveryDialog}
        recoveryData={recoveryData}
        onRecover={handleRecover}
        onDiscard={handleDiscard}
      />
    </div>
  );
};