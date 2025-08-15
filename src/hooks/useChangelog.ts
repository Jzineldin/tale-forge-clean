
import { useCallback, useEffect } from 'react';
import ChangelogManager from '@/utils/changelogManager';

interface ChangeEntry {
  type: 'feature' | 'improvement' | 'fix';
  description: string;
}

export const useChangelog = () => {
  const logChange = useCallback((change: ChangeEntry) => {
    ChangelogManager.logChanges([change]);
  }, []);

  const logChanges = useCallback((changes: ChangeEntry[]) => {
    ChangelogManager.logChanges(changes);
  }, []);

  const logFeature = useCallback((description: string) => {
    logChange({ type: 'feature', description });
  }, [logChange]);

  const logImprovement = useCallback((description: string) => {
    logChange({ type: 'improvement', description });
  }, [logChange]);

  const logFix = useCallback((description: string) => {
    logChange({ type: 'fix', description });
  }, [logChange]);

  // Initialize the changelog with v2.7.1 changes if not already present
  useEffect(() => {
    const currentChangelog = ChangelogManager.getCurrentChangelog();
    if (currentChangelog.length === 0 || currentChangelog[0].version !== '2.7.1') {
      // This will trigger the changelog to be updated with the new default entries
      ChangelogManager.getCurrentChangelog();
    }
  }, []);

  return {
    logChange,
    logChanges,
    logFeature,
    logImprovement,
    logFix,
  };
};
