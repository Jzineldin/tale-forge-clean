import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useStoryMigration } from '@/lib/migration/storyMigrationService';
import { StoryMigrationDialog } from './StoryMigrationDialog';

interface AuthMigrationWrapperProps {
  children: React.ReactNode;
}

export const AuthMigrationWrapper: React.FC<AuthMigrationWrapperProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { hasStoriesToMigrate } = useStoryMigration();
  
  const [showMigrationDialog, setShowMigrationDialog] = useState<boolean>(false);
  const [migrationChecked, setMigrationChecked] = useState<boolean>(false);

  // Check for stories to migrate when user signs in
  useEffect(() => {
    const checkForStoriesToMigrate = async () => {
      if (user && !loading && !migrationChecked) {
        const hasStories = await hasStoriesToMigrate();
        if (hasStories) {
          setShowMigrationDialog(true);
        }
        setMigrationChecked(true);
      }
    };

    checkForStoriesToMigrate();
  }, [user, loading, migrationChecked, hasStoriesToMigrate]);

  // Reset migration checked state when user signs out
  useEffect(() => {
    if (!user && !loading) {
      setMigrationChecked(false);
    }
  }, [user, loading]);

  // Handle migration completion
  const handleMigrationComplete = () => {
    console.log('Migration completed');
  };

  return (
    <>
      {children}
      
      <StoryMigrationDialog
        open={showMigrationDialog}
        onOpenChange={setShowMigrationDialog}
        onComplete={handleMigrationComplete}
      />
    </>
  );
};