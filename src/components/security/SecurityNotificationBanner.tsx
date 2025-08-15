import React, { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { secureStorage } from '@/services/secureStorage';
import { SecureStorageMigrator } from '@/utils/secureLocalStorageMigration';

/**
 * Security notification banner to inform users of completed security fixes
 */
export const SecurityNotificationBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const initializeSecurity = async () => {
      // Ensure migration is completed first
      await SecureStorageMigrator.migrate();
      
      const dismissed = await secureStorage.getItem('security_fixes_notification_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    initializeSecurity();
  }, []);

  const handleDismiss = async () => {
    await secureStorage.setItem('security_fixes_notification_dismissed', true, { encrypt: true });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
      <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-green-800 dark:text-green-200">
            <strong>Security Enhanced:</strong> We've implemented critical security fixes including
            admin privilege protection, encrypted secure storage migration, comprehensive audit logging,
            and enhanced input validation across all components.
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="ml-4 h-6 w-6 p-0 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};