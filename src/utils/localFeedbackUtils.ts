/**
 * Utility functions for managing locally stored feedback
 * Use these functions to retrieve and manage feedback stored in localStorage
 * when the database table is not yet available.
 */

export interface LocalFeedback {
  id: string;
  feedback_type: string;
  subject?: string;
  message: string;
  email?: string;
  user_id?: string;
  page_url: string;
  user_agent: string;
  browser_info: any;
  created_at: string;
  status: string;
  priority: string;
}

/**
 * Get all locally stored feedback
 */
export const getLocalFeedback = (): LocalFeedback[] => {
  try {
    const stored = localStorage.getItem('pending_feedback');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading local feedback:', error);
    return [];
  }
};

/**
 * Clear all locally stored feedback
 * Use this after migrating feedback to the database
 */
export const clearLocalFeedback = (): void => {
  try {
    localStorage.removeItem('pending_feedback');
    console.log('Local feedback cleared');
  } catch (error) {
    console.error('Error clearing local feedback:', error);
  }
};

/**
 * Export locally stored feedback as JSON
 * Useful for manually importing into the database
 */
export const exportLocalFeedback = (): string => {
  const feedback = getLocalFeedback();
  return JSON.stringify(feedback, null, 2);
};

/**
 * Get count of locally stored feedback
 */
export const getLocalFeedbackCount = (): number => {
  return getLocalFeedback().length;
};

/**
 * Console helper to view locally stored feedback
 * Run this in browser console: window.viewLocalFeedback()
 */
export const viewLocalFeedback = (): void => {
  const feedback = getLocalFeedback();
  console.log(`Found ${feedback.length} locally stored feedback items:`);
  console.table(feedback);
};

// Make viewLocalFeedback available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).viewLocalFeedback = viewLocalFeedback;
  (window as any).exportLocalFeedback = exportLocalFeedback;
  (window as any).clearLocalFeedback = clearLocalFeedback;
}

/**
 * Migration helper: Convert local feedback to database format
 * Use this to prepare local feedback for database insertion
 */
export const prepareLocalFeedbackForDatabase = (): any[] => {
  const feedback = getLocalFeedback();
  
  return feedback.map(item => ({
    user_id: item.user_id || null,
    email: item.email || null,
    feedback_type: item.feedback_type,
    subject: item.subject || null,
    message: item.message,
    page_url: item.page_url || null,
    user_agent: item.user_agent || null,
    browser_info: item.browser_info || null,
    status: 'new',
    priority: 'medium',
    created_at: item.created_at,
  }));
};

/**
 * Console helper to get SQL INSERT statements for local feedback
 * Run this in browser console after setting up the database
 */
export const generateInsertSQL = (): string => {
  const feedback = prepareLocalFeedbackForDatabase();
  
  if (feedback.length === 0) {
    return '-- No local feedback found';
  }
  
  const values = feedback.map(item => {
    const escapedMessage = item.message.replace(/'/g, "''");
    const escapedSubject = item.subject ? `'${item.subject.replace(/'/g, "''")}'` : 'NULL';
    const escapedEmail = item.email ? `'${item.email}'` : 'NULL';
    const escapedUserId = item.user_id ? `'${item.user_id}'` : 'NULL';
    const escapedPageUrl = item.page_url ? `'${item.page_url}'` : 'NULL';
    const escapedUserAgent = item.user_agent ? `'${item.user_agent.replace(/'/g, "''")}'` : 'NULL';
    const escapedBrowserInfo = item.browser_info ? `'${JSON.stringify(item.browser_info).replace(/'/g, "''")}'::jsonb` : 'NULL';
    
    return `(${escapedUserId}, ${escapedEmail}, '${item.feedback_type}', ${escapedSubject}, '${escapedMessage}', ${escapedPageUrl}, ${escapedUserAgent}, ${escapedBrowserInfo}, '${item.status}', '${item.priority}', '${item.created_at}')`;
  }).join(',\n  ');
  
  return `-- Insert locally stored feedback into database
INSERT INTO public.user_feedback (user_id, email, feedback_type, subject, message, page_url, user_agent, browser_info, status, priority, created_at)
VALUES
  ${values};`;
};

// Make SQL generator available globally
if (typeof window !== 'undefined') {
  (window as any).generateInsertSQL = generateInsertSQL;
}

console.log('Local feedback utilities loaded. Available functions:');
console.log('- window.viewLocalFeedback() - View stored feedback');
console.log('- window.exportLocalFeedback() - Export as JSON');
console.log('- window.generateInsertSQL() - Generate SQL for database');
console.log('- window.clearLocalFeedback() - Clear stored feedback');