import { useState, useCallback } from 'react';

type SaveStatus = 'saving' | 'saved' | 'error' | null;

export const useSaveStatus = () => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const setSaving = useCallback((message?: string) => {
    setSaveStatus('saving');
    setSaveMessage(message || 'Saving...');
  }, []);

  const setSaved = useCallback((message?: string) => {
    setSaveStatus('saved');
    setSaveMessage(message || 'Saved');
  }, []);

  const setError = useCallback((message?: string) => {
    setSaveStatus('error');
    setSaveMessage(message || 'Save failed');
  }, []);

  const clearStatus = useCallback(() => {
    setSaveStatus(null);
    setSaveMessage('');
  }, []);

  return {
    saveStatus,
    saveMessage,
    setSaving,
    setSaved,
    setError,
    clearStatus,
  };
}; 