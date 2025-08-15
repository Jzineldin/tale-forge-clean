import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthProvider';

interface UseAuthRequiredOptions {
  feature?: string;
  onAuthenticated?: () => void;
  onUnauthenticated?: () => void;
}

export const useAuthRequired = (options: UseAuthRequiredOptions = {}) => {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const checkAuthAndExecute = useCallback((action: () => void) => {
    if (isAuthenticated) {
      // User is authenticated, execute the action
      action();
      if (options.onAuthenticated) {
        options.onAuthenticated();
      }
    } else {
      // User is not authenticated, show the modal
      setPendingAction(() => action);
      setShowAuthModal(true);
      if (options.onUnauthenticated) {
        options.onUnauthenticated();
      }
    }
  }, [isAuthenticated, options]);

  const handleAuthModalClose = useCallback((open: boolean) => {
    setShowAuthModal(open);
    if (!open) {
      // Clear pending action when modal is closed
      setPendingAction(null);
    }
  }, []);

  // Execute pending action after successful authentication
  const executePendingAction = useCallback(() => {
    if (pendingAction && isAuthenticated) {
      pendingAction();
      setPendingAction(null);
      setShowAuthModal(false);
    }
  }, [pendingAction, isAuthenticated]);

  return {
    checkAuthAndExecute,
    showAuthModal,
    setShowAuthModal: handleAuthModalClose,
    executePendingAction,
    feature: options.feature,
  };
};