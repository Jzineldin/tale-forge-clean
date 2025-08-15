
import { useState } from 'react';

export const useStoryConfirmation = () => {
  const [showCostDialog, setShowCostDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'start' | 'choice' | 'audio' | null>(null);
  const [pendingChoice, setPendingChoice] = useState<string>('');

  const showConfirmation = (action: 'start' | 'choice' | 'audio', choice?: string) => {
    setPendingAction(action);
    if (choice) setPendingChoice(choice);
    setShowCostDialog(true);
  };

  const resetConfirmation = () => {
    setPendingAction(null);
    setPendingChoice('');
    setShowCostDialog(false);
  };

  return {
    showCostDialog,
    pendingAction,
    pendingChoice,
    setShowCostDialog,
    showConfirmation,
    resetConfirmation,
  };
};
