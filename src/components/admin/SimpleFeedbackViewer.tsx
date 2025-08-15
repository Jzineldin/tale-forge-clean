import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SimpleFeedbackViewer: React.FC = () => {
  const [localFeedback, setLocalFeedback] = useState<any[]>([]);
  const [dbFeedback, setDbFeedback] = useState<any[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get feedback from localStorage (fallback storage)
    try {
      const stored = localStorage.getItem('pending_feedback');
      const feedback = stored ? JSON.parse(stored) : [];
      setLocalFeedback(feedback);
      console.log('Found local feedback:', feedback);
    } catch (error) {
      console.error('Error reading local feedback:', error);
    }
    // Fetch from Supabase
    supabase
      .from('user_feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setDbError(error.message);
        else setDbFeedback(data || []);
        setLoading(false);
      });
  }, []);

  const clearLocalFeedback = () => {
    localStorage.removeItem('pending_feedback');
    setLocalFeedback([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-slate-300">Loading feedback...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-8 w-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Simple Feedback Viewer</h1>
            <p className="text-slate-400">
              {dbFeedback.length > 0 ? 'Viewing database feedback' : 'Viewing locally stored feedback (database connection issues detected)'}
            </p>
          </div>
        </div>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          className="border-slate-600 text-slate-300"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Database Feedback Display */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Database Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {dbError && <div className="text-red-400">{dbError}</div>}
          {dbFeedback.length === 0 && !dbError ? (
            <div className="text-center py-8 text-slate-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No database feedback found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dbFeedback.map((feedback: any, index: number) => (
                <div key={feedback.id || index} className="border border-slate-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {feedback.feedback_type === 'bug' ? '🐛' :
                         feedback.feedback_type === 'feature' ? '✨' :
                         feedback.feedback_type === 'praise' ? '👏' :
                         feedback.feedback_type === 'complaint' ? '😞' : '💬'}
                      </span>
                      <span className="text-sm text-slate-400 capitalize">
                        {feedback.feedback_type}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(feedback.created_at).toLocaleString()}
                    </span>
                  </div>
                  {feedback.subject && (
                    <h3 className="font-medium text-white mb-2">
                      {feedback.subject}
                    </h3>
                  )}
                  <p className="text-slate-300 mb-2">
                    {feedback.message}
                  </p>
                  <div className="text-xs text-slate-400 space-y-1">
                    {feedback.email && <p>Email: {feedback.email}</p>}
                    {feedback.page_url && <p>Page: {new URL(feedback.page_url).pathname}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Local Feedback</p>
                <p className="text-2xl font-bold text-white">{localFeedback.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Status</p>
                <p className="text-sm font-bold text-yellow-400">{dbFeedback.length > 0 ? 'Database' : 'Local Storage'}</p>
              </div>
              <div className={`h-3 w-3 rounded-full ${dbFeedback.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions (only show if no DB feedback) */}
      {dbFeedback.length === 0 && !dbError && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Database Setup Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              The feedback system is storing data locally because the database connection has issues. 
              To fix this and see all feedback in the database:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>Go to your Supabase Dashboard → SQL Editor</li>
              <li>Run the SQL migration from the feedback setup guide</li>
              <li>Ensure you're logged in when accessing this admin page</li>
              <li>Refresh this page to see database feedback</li>
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Local Feedback Display */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Locally Stored Feedback</CardTitle>
          {localFeedback.length > 0 && (
            <Button
              onClick={clearLocalFeedback}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300"
            >
              Clear Local Data
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {localFeedback.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No local feedback found.</p>
              <p className="text-sm mt-2">Try submitting feedback through the widget to test the system.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {localFeedback.map((feedback, index) => (
                <div key={index} className="border border-slate-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {feedback.feedback_type === 'bug' ? '🐛' :
                         feedback.feedback_type === 'feature' ? '✨' :
                         feedback.feedback_type === 'praise' ? '👏' :
                         feedback.feedback_type === 'complaint' ? '😞' : '💬'}
                      </span>
                      <span className="text-sm text-slate-400 capitalize">
                        {feedback.feedback_type}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(feedback.created_at).toLocaleString()}
                    </span>
                  </div>
                  {feedback.subject && (
                    <h3 className="font-medium text-white mb-2">
                      {feedback.subject}
                    </h3>
                  )}
                  <p className="text-slate-300 mb-2">
                    {feedback.message}
                  </p>
                  <div className="text-xs text-slate-400 space-y-1">
                    {feedback.email && <p>Email: {feedback.email}</p>}
                    {feedback.page_url && <p>Page: {new URL(feedback.page_url).pathname}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleFeedbackViewer;