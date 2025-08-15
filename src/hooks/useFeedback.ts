import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';

export interface FeedbackData {
  feedback_type: 'bug' | 'feature' | 'general' | 'praise' | 'complaint';
  subject?: string;
  message: string;
  email?: string;
  page_url?: string;
  user_agent?: string;
  browser_info?: any;
}

export interface FeedbackRecord extends FeedbackData {
  id: string;
  user_id?: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FeedbackStats {
  total_feedback: number;
  new_feedback: number;
  in_progress_feedback: number;
  resolved_feedback: number;
  by_type: Record<string, number>;
}

// Get browser information for debugging purposes
const getBrowserInfo = () => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    url: window.location.href,
    referrer: document.referrer,
    timestamp: new Date().toISOString(),
  };
};

export const useFeedback = (enableAdminQueries: boolean = false) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Submit feedback mutation
  const submitFeedback = useMutation({
    mutationFn: async (feedbackData: FeedbackData) => {
      const browserInfo = getBrowserInfo();
      
      console.log('Submitting feedback:', {
        feedback_type: feedbackData.feedback_type,
        subject: feedbackData.subject,
        message: feedbackData.message,
        user_id: user?.id || null,
        email: feedbackData.email || user?.email || null,
      });
      
      const { data, error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user?.id || null,
          email: feedbackData.email || user?.email || null,
          feedback_type: feedbackData.feedback_type,
          subject: feedbackData.subject || null,
          message: feedbackData.message,
          page_url: feedbackData.page_url || window.location.href,
          user_agent: navigator.userAgent,
          browser_info: browserInfo,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error submitting feedback:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        // Fallback: Store in localStorage if database table doesn't exist
        if (error.message?.includes('relation "user_feedback" does not exist')) {
          console.log('Database table not found, storing feedback locally as fallback');
          
          const localFeedback = {
            id: crypto.randomUUID(),
            ...feedbackData,
            user_id: user?.id || null,
            email: feedbackData.email || user?.email || null,
            page_url: window.location.href,
            user_agent: navigator.userAgent,
            browser_info: browserInfo,
            created_at: new Date().toISOString(),
            status: 'new',
            priority: 'medium',
          };
          
          // Get existing feedback from localStorage
          const existingFeedback = JSON.parse(localStorage.getItem('pending_feedback') || '[]');
          existingFeedback.push(localFeedback);
          localStorage.setItem('pending_feedback', JSON.stringify(existingFeedback));
          
          console.log('Feedback stored locally:', localFeedback);
          return localFeedback;
        }
        
        throw new Error(`Failed to submit feedback: ${error.message}`);
      }

      console.log('Feedback submitted successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast.success('Thank you for your feedback! We appreciate your input.');
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] });
    },
    onError: (error) => {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    },
  });

  // Get user's feedback history
  const getUserFeedback = useQuery({
    queryKey: ['feedback', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user feedback:', error);
        throw error;
      }

      return data as FeedbackRecord[];
    },
    enabled: !!user?.id,
  });

  // Get all feedback (admin only)
  const getAllFeedback = useQuery({
    queryKey: ['feedback', 'all'],
    queryFn: async () => {
      console.log('Fetching all feedback for admin...');
      
      try {
        // Simplified query without joins that might cause issues
        const { data, error } = await supabase
          .from('user_feedback')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error fetching all feedback:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          
          // If it's a permission error, try a more basic query
          if (error.code === 'PGRST116' || error.message?.includes('permission denied')) {
            console.log('Permission error, trying basic select...');
            const { data: basicData, error: basicError } = await supabase
              .from('user_feedback')
              .select('id, message, feedback_type, created_at, status, priority')
              .order('created_at', { ascending: false });
              
            if (basicError) {
              console.error('Basic query also failed:', basicError);
              throw basicError;
            }
            
            console.log('Basic query succeeded:', basicData);
            return basicData as FeedbackRecord[];
          }
          
          throw error;
        }

        console.log('Fetched feedback data:', data);
        return data as FeedbackRecord[];
      } catch (err) {
        console.error('Unexpected error in getAllFeedback:', err);
        throw err;
      }
    },
    enabled: enableAdminQueries,
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
  });

  // Get feedback statistics
  const getFeedbackStats = useQuery({
    queryKey: ['feedback-stats'],
    queryFn: async () => {
      console.log('Fetching feedback stats...');
      
      const { data, error } = await supabase
        .rpc('get_feedback_stats');

      if (error) {
        console.error('Error fetching feedback stats:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      console.log('Fetched stats data:', data);
      return data[0] as FeedbackStats;
    },
    enabled: enableAdminQueries, // Enable when explicitly requested
  });

  // Update feedback status (admin only)
  const updateFeedbackStatus = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      priority, 
      admin_notes 
    }: { 
      id: string; 
      status?: string; 
      priority?: string; 
      admin_notes?: string; 
    }) => {
      const updateData: any = {};
      
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;
      if (admin_notes) updateData.admin_notes = admin_notes;
      
      if (status === 'resolved') {
        updateData.resolved_by = user?.id;
        updateData.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('user_feedback')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating feedback:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Feedback updated successfully');
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] });
    },
    onError: (error) => {
      console.error('Failed to update feedback:', error);
      toast.error('Failed to update feedback');
    },
  });

  return {
    submitFeedback,
    getUserFeedback,
    getAllFeedback,
    getFeedbackStats,
    updateFeedbackStatus,
  };
};