import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStoryMigration, MigrationProgress } from '@/lib/migration/storyMigrationService';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface StoryMigrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export const StoryMigrationDialog: React.FC<StoryMigrationDialogProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const { user } = useAuth();
  const {
    migrateAnonymousStories,
    resumeMigration,
    registerProgressCallback,
    unregisterProgressCallback,
    getMigrationProgress,
    // isMigrationInProgress,
    getStoriesToMigrateCount
  } = useStoryMigration();

  const [progress, setProgress] = useState<MigrationProgress>(getMigrationProgress());
  const [storyCount, setStoryCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [migrationStarted, setMigrationStarted] = useState<boolean>(false);

  // Calculate progress percentage
  const progressPercentage = progress.total > 0
    ? Math.round(((progress.completed + progress.failed) / progress.total) * 100)
    : 0;

  // Handle progress updates
  const handleProgressUpdate = (updatedProgress: MigrationProgress) => {
    setProgress(updatedProgress);

    // If migration is complete, notify parent
    if (!updatedProgress.inProgress && migrationStarted && 
        (updatedProgress.completed + updatedProgress.failed) >= updatedProgress.total) {
      setTimeout(() => {
        onComplete();
        onOpenChange(false);
      }, 1500);
    }
  };

  // Register progress callback
  useEffect(() => {
    registerProgressCallback(handleProgressUpdate);
    
    return () => {
      unregisterProgressCallback(handleProgressUpdate);
    };
  }, [registerProgressCallback, unregisterProgressCallback]);

  // Get story count on mount
  useEffect(() => {
    const fetchStoryCount = async () => {
      const count = await getStoriesToMigrateCount();
      setStoryCount(count);
    };

    if (open) {
      fetchStoryCount();
    }
  }, [open, getStoriesToMigrateCount]);

  // Start migration
  const handleStartMigration = async () => {
    if (!user) {
      toast.error('You must be signed in to migrate stories');
      return;
    }

    setIsLoading(true);
    setMigrationStarted(true);

    try {
      const result = await migrateAnonymousStories(user.id);
      
      if (!result.success && result.errors.length > 0) {
        console.error('Migration errors:', result.errors);
      }
    } catch (error) {
      console.error('Error starting migration:', error);
      toast.error('Failed to migrate stories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resume migration
  const handleResumeMigration = async () => {
    if (!user) {
      toast.error('You must be signed in to migrate stories');
      return;
    }

    setIsLoading(true);
    setMigrationStarted(true);

    try {
      const result = await resumeMigration(user.id);
      
      if (!result.success && result.errors.length > 0) {
        console.error('Migration errors:', result.errors);
      }
    } catch (error) {
      console.error('Error resuming migration:', error);
      toast.error('Failed to resume migration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Skip migration
  const handleSkipMigration = () => {
    toast.info('You can migrate your stories later from the Settings page');
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card-enhanced sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="fantasy-heading text-amber-500">Save Your Stories</DialogTitle>
          <DialogDescription>
            {storyCount > 0 ? (
              <span>
                We found {storyCount} {storyCount === 1 ? 'story' : 'stories'} created while you were browsing anonymously.
                Would you like to save {storyCount === 1 ? 'it' : 'them'} to your account?
              </span>
            ) : (
              <span>Checking for stories to migrate...</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {progress.inProgress && (
          <div className="space-y-4 py-4">
            <div className="flex justify-between text-sm">
              <span>Migrating stories...</span>
              <span>
                {progress.completed} of {progress.total} complete
                {progress.failed > 0 && ` (${progress.failed} failed)`}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          {!progress.inProgress && !migrationStarted && (
            <>
              <Button
                variant="outline"
                onClick={handleSkipMigration}
                disabled={isLoading}
              >
                Skip
              </Button>
              <Button
                onClick={handleStartMigration}
                disabled={isLoading || storyCount === 0}
                variant="cta-primary"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save to My Account'
                )}
              </Button>
            </>
          )}

          {!progress.inProgress && migrationStarted && (
            <Button
              onClick={handleResumeMigration}
              disabled={isLoading || progress.failed === 0}
              variant="cta-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resuming...
                </>
              ) : (
                'Retry Failed'
              )}
            </Button>
          )}

          {progress.inProgress && (
            <Button disabled variant="cta-primary">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Migrating...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};